import {
  createAgent,
  createNetwork,
  createState,
  createTool,
} from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import { desc, eq } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import {
  buildEvent,
  fragment,
  message,
  BuildEventKind,
  MessageRole,
  MessageType,
} from "@/db/schema";
import { isFailoverError, listModelCandidates, type ModelCandidate } from "@/lib/ai";
import {
  CODE_AGENT_PROMPT,
  FRAGMENT_TITLE_PROMPT,
  RESPONSE_PROMPT,
} from "@/prompt";
import { inngest } from "./client";
import { BUILD_EVENT_NAME, SANDBOX_TTL_MS } from "./constants";
import {
  agentOutputText,
  describeFailure,
  extractTaskSummary,
  lastAssistantTextMessageContent,
  toolErrorMessage,
} from "./utils";

// Matches the `name` in sandbox/next-js-developer/package.json, which is the
// alias `bun run sandbox:build` publishes to. Set E2B_TEMPLATE_ID to point at a
// `-dev` build instead.
//
// The alias is namespaced on purpose. E2B resolves an unknown alias against its
// public templates, so the un-prefixed `nextjs-developer` silently resolved to
// E2B's own community image (envd 0.1.2) whenever this account had not built
// its own — sandboxes came up from a completely different image than the one
// `sandbox/next-js-developer/template.ts` builds and CODE_AGENT_PROMPT
// describes. A prefixed alias has no public counterpart to fall through to, so
// a missing build fails loudly instead.
const SANDBOX_TEMPLATE = process.env.E2B_TEMPLATE_ID ?? "zivo-nextjs-developer";

const SANDBOX_TIMEOUT_MS = Number(
  process.env.E2B_SANDBOX_TIMEOUT_MS ?? SANDBOX_TTL_MS,
);

const MAX_ITERATIONS = Number(process.env.AI_MAX_ITERATIONS ?? 25);

const MAX_HISTORY_MESSAGES = Number(process.env.AI_MAX_HISTORY_MESSAGES ?? 10);

const PREVIEW_PORT = 3000;

export interface CodeAgentState {
  sandboxId: string;
  summary: string;
  files: Record<string, string>;
}

async function emit(
  projectId: string,
  kind: BuildEventKind,
  label: string,
  detail?: string,
) {
  try {
    await db.insert(buildEvent).values({ projectId, kind, label, detail });
  } catch (error) {
    console.error("Failed to record build event:", error);
  }
}

async function clearEvents(projectId: string) {
  await db.delete(buildEvent).where(eq(buildEvent.projectId, projectId));
}

/**
 * Kill the sandboxes a failed run left behind.
 *
 * A failed run leaves its sandbox alive until its create-time timeout expires,
 * and `retries` means a single bad build can strand three of them. Nothing will
 * ever serve a preview from those — the fragment that would point at one is
 * only written on the success path — so they are pure cost.
 *
 * Scoped by `buildId`, not by project: a project whose previous build succeeded
 * still has a healthy sandbox serving that fragment's preview, and killing it
 * because a *later* build failed would take a working preview away from someone
 * looking at it. Best-effort either way — the create-time timeout is still the
 * backstop if this fails.
 */
async function releaseSandboxes(projectId: string, buildId: string) {
  try {
    const running = await Sandbox.list({
      query: { metadata: { projectId, buildId }, state: ["running"] },
    }).nextItems();

    await Promise.all(
      running.map((info) =>
        Sandbox.kill(info.sandboxId).catch((error: unknown) => {
          console.error(`Failed to kill sandbox ${info.sandboxId}:`, error);
        }),
      ),
    );
  } catch (error) {
    console.error("Failed to list sandboxes for cleanup:", error);
  }
}

async function recordFailure(projectId: string, content: string) {
  await db.insert(message).values({
    projectId,
    content,
    role: MessageRole.ASSISTANT,
    type: MessageType.ERROR,
  });
}

async function runWithFailover<T>(
  projectId: string,
  role: "code" | "title" | "response",
  attempt: (candidate: ModelCandidate, index: number) => Promise<T>,
) {
  const candidates = listModelCandidates(role);
  let lastError: unknown;

  for (const [index, candidate] of candidates.entries()) {
    try {
      const result = await attempt(candidate, index);

      return { result, candidate };
    } catch (error) {
      lastError = error;

      const isLast = index === candidates.length - 1;

      if (!isFailoverError(error) || isLast) {
        throw error;
      }

      await emit(
        projectId,
        BuildEventKind.STATUS,
        `${candidate.label} unavailable, switching provider`,
        toolErrorMessage(error).slice(0, 200),
      );
    }
  }

  throw lastError;
}

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    triggers: { event: BUILD_EVENT_NAME },
    retries: 2,
    onFailure: async ({ event, error }) => {
      const projectId = event.data.event.data.projectId as string | undefined;

      if (!projectId) return;

      const buildId = event.data.event.id ?? projectId;

      await recordFailure(projectId, describeFailure(error));
      await emit(projectId, BuildEventKind.ERROR, "Build failed");
      await releaseSandboxes(projectId, buildId);
    },
  },
  async ({ event, step }) => {
    const { projectId, value } = event.data;

    await step.run("reset-events", async () => {
      await clearEvents(projectId);
      await emit(projectId, BuildEventKind.STATUS, "Starting a sandbox");

      return null;
    });

    // Identifies every sandbox this run creates, including the ones a retry
    // makes, so a failure can reclaim exactly its own and nothing else.
    const buildId = event.id ?? projectId;

    const sandboxId = await step.run("create-sandbox", async () => {
      const sandbox = await Sandbox.create(SANDBOX_TEMPLATE, {
        timeoutMs: SANDBOX_TIMEOUT_MS,
        metadata: { projectId, buildId },
      });

      return sandbox.sandboxId;
    });

    const previousMessages = await step.run("load-history", async () => {
      await emit(projectId, BuildEventKind.STATUS, "Sandbox ready");

      const rows = await db
        .select()
        .from(message)
        .where(eq(message.projectId, projectId))
        .orderBy(desc(message.createdAt))
        .limit(MAX_HISTORY_MESSAGES);

      return rows.reverse().map((row) => ({
        type: "text" as const,
        role:
          row.role === MessageRole.ASSISTANT
            ? ("assistant" as const)
            : ("user" as const),
        content: row.content,
      }));
    });

    const state = createState<CodeAgentState>(
      { sandboxId, summary: "", files: {} },
      { messages: previousMessages },
    );

    // Inngest memoises a step by its id, so two steps sharing an id in one run
    // return the same cached result. Our ids were derived from the command or
    // the file paths, which repeat constantly — the agent reruns `bun install`
    // or rewrites a file it already wrote — and the repeat was silently skipped
    // instead of actually touching the sandbox. Number them instead.
    //
    // The counter is deterministic across Inngest's replays because the tool
    // calls replay in the same order.
    let stepSequence = 0;
    const nextStepId = (label: string) => `${++stepSequence}-${label}`;

    const buildTools = () => [
      createTool({
        name: "terminal",
        description: "Run a shell command inside the sandbox",
        parameters: z.object({ command: z.string() }),
        handler: async ({ command }, { step }) =>
          step?.run(nextStepId(`terminal-${command.slice(0, 40)}`), async () => {
            await emit(
              projectId,
              BuildEventKind.TERMINAL,
              command.length > 60 ? `${command.slice(0, 60)}…` : command,
            );

            const buffers = { stdout: "", stderr: "" };

            try {
              const sandbox = await Sandbox.connect(sandboxId);
              const result = await sandbox.commands.run(command, {
                onStdout: (data: string) => {
                  buffers.stdout += data;
                },
                onStderr: (data: string) => {
                  buffers.stderr += data;
                },
              });

              return result.stdout;
            } catch (error) {
              return `Command failed: ${toolErrorMessage(error)}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
            }
          }),
      }),

      createTool({
        name: "createOrUpdateFiles",
        description: "Create or update files inside the sandbox",
        parameters: z.object({
          files: z.array(z.object({ path: z.string(), content: z.string() })),
        }),
        handler: async ({ files }, { step, network }) => {
          const written = await step?.run(
            nextStepId(
              `write-${files.map((f) => f.path).join(",").slice(0, 40)}`,
            ),
            async () => {
              for (const file of files) {
                await emit(projectId, BuildEventKind.WRITE, file.path);
              }

              try {
                const sandbox = await Sandbox.connect(sandboxId);
                const updated: Record<string, string> = {};

                for (const file of files) {
                  await sandbox.files.write(file.path, file.content);
                  updated[file.path] = file.content;
                }

                return updated;
              } catch (error) {
                return `Failed to write files: ${toolErrorMessage(error)}`;
              }
            },
          );

          if (typeof written === "string") return written;

          if (written && network) {
            network.state.data.files = {
              ...network.state.data.files,
              ...written,
            };
          }

          return `Wrote ${files.length} file(s).`;
        },
      }),

      createTool({
        name: "readFiles",
        description: "Read files from the sandbox",
        parameters: z.object({ files: z.array(z.string()) }),
        handler: async ({ files }, { step }) =>
          step?.run(nextStepId(`read-${files.join(",").slice(0, 40)}`), async () => {
            for (const path of files) {
              await emit(projectId, BuildEventKind.READ, path);
            }

            try {
              const sandbox = await Sandbox.connect(sandboxId);
              const contents: { path: string; content: string }[] = [];

              for (const path of files) {
                contents.push({
                  path,
                  content: await sandbox.files.read(path),
                });
              }

              return JSON.stringify(contents);
            } catch (error) {
              return `Failed to read files: ${toolErrorMessage(error)}`;
            }
          }),
      }),
    ];

    const { result: networkResult, candidate: codeCandidate } =
      await runWithFailover(projectId, "code", async (candidate) => {
        await emit(
          projectId,
          BuildEventKind.THOUGHT,
          `Planning with ${candidate.label}`,
          candidate.model,
        );

        const codeAgent = createAgent<CodeAgentState>({
          name: `code-agent-${candidate.provider}`,
          description: "Builds and edits the application inside the sandbox",
          system: CODE_AGENT_PROMPT,
          model: candidate.create(),
          tools: buildTools(),
          lifecycle: {
            onResponse: async ({ result, network }) => {
              const text = lastAssistantTextMessageContent(result);

              if (network && text?.includes("<task_summary>")) {
                network.state.data.summary = text;
              }

              return result;
            },
          },
        });

        const network = createNetwork<CodeAgentState>({
          name: `code-agent-network-${candidate.provider}`,
          agents: [codeAgent],
          maxIter: MAX_ITERATIONS,
          router: async ({ network }) =>
            network.state.data.summary ? undefined : codeAgent,
        });

        return network.run(value, { state });
      });

    const summary = extractTaskSummary(networkResult.state.data.summary);
    const files = networkResult.state.data.files ?? {};
    const paths = Object.keys(files);

    // Only a build that wrote nothing is a real failure.
    if (paths.length === 0) {
      await step.run("save-empty-result", async () => {
        await emit(projectId, BuildEventKind.ERROR, "No files were produced");
        await recordFailure(
          projectId,
          summary
            ? "The agent finished without writing any files. Try describing the app in more detail."
            : "The agent stopped before it could write anything. Try again, or add more detail about the app you want.",
        );

        return null;
      });

      return { status: "failed" as const };
    }

    // Files exist but no <task_summary>: the agent ran out of iterations, or its
    // final message was cut off. The sandbox is running and the code is real, so
    // keep the work instead of throwing it away — the user can iterate from it.
    const isComplete = Boolean(summary);
    const resolvedSummary =
      summary ||
      `The build stopped before the agent reported back, after writing ${paths.length} file(s): ${paths.slice(0, 8).join(", ")}. The app may be unfinished.`;

    await step.run("summarise", async () => {
      if (isComplete) {
        await emit(
          projectId,
          BuildEventKind.STATUS,
          `Built with ${codeCandidate.label}`,
          codeCandidate.model,
        );
      } else {
        await emit(
          projectId,
          BuildEventKind.ERROR,
          "Build stopped early — keeping what was written",
          `${paths.length} file(s) saved. Ask for a change to continue.`,
        );
      }

      return null;
    });

    const { result: fragmentTitle } = await runWithFailover(
      projectId,
      "title",
      async (candidate) => {
        const agent = createAgent({
          name: `fragment-title-${candidate.provider}`,
          system: FRAGMENT_TITLE_PROMPT,
          model: candidate.create(),
        });

        const { output } = await agent.run(resolvedSummary, { step });

        return agentOutputText(output, "Untitled");
      },
    );

    const { result: responseText } = await runWithFailover(
      projectId,
      "response",
      async (candidate) => {
        const agent = createAgent({
          name: `response-generator-${candidate.provider}`,
          system: RESPONSE_PROMPT,
          model: candidate.create(),
        });

        const { output } = await agent.run(resolvedSummary, { step });

        return agentOutputText(
          output,
          isComplete
            ? "Here is what I built for you."
            : "The build stopped early, but the files it wrote are saved below. Ask for a change to keep going.",
        );
      },
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      await emit(projectId, BuildEventKind.STATUS, "Booting the preview");

      const sandbox = await Sandbox.connect(sandboxId);

      // The create-time timeout started counting when the sandbox booted, but
      // the client measures a preview's life from `fragment.createdAt` — the
      // moment the build finishes. On a build that took ten minutes those are
      // ten minutes apart, so the iframe loads E2B's "Sandbox Not Found" page
      // while the UI still believes the preview is live. Restarting the clock
      // here makes the TTL the client assumes the TTL the sandbox actually has.
      await sandbox.setTimeout(SANDBOX_TIMEOUT_MS);

      return `https://${sandbox.getHost(PREVIEW_PORT)}`;
    });

    await step.run("save-result", async () => {
      const messageId = crypto.randomUUID();

      await db.batch([
        db.insert(message).values({
          id: messageId,
          projectId,
          content: responseText,
          role: MessageRole.ASSISTANT,
          type: MessageType.RESULT,
        }),
        db.insert(fragment).values({
          messageId,
          sandboxUrl,
          title: fragmentTitle,
          files,
        }),
      ]);

      await clearEvents(projectId);

      return null;
    });

    return {
      status: isComplete ? ("completed" as const) : ("partial" as const),
      provider: codeCandidate.provider,
      url: sandboxUrl,
      title: fragmentTitle,
      files,
    };
  },
);

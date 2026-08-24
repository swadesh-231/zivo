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
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/lib/prompt";
import { inngest } from "./client";
import { BUILD_EVENT_NAME } from "./dispatch";
import {
  agentOutputText,
  describeFailure,
  extractTaskSummary,
  lastAssistantTextMessageContent,
  toolErrorMessage,
} from "./utils";

const SANDBOX_TEMPLATE = process.env.E2B_TEMPLATE_ID ?? "c0-build";

const SANDBOX_TIMEOUT_MS = Number(
  process.env.E2B_SANDBOX_TIMEOUT_MS ?? 15 * 60 * 1000,
);

const MAX_ITERATIONS = Number(process.env.AI_MAX_ITERATIONS ?? 15);

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

      await recordFailure(projectId, describeFailure(error));
      await emit(projectId, BuildEventKind.ERROR, "Build failed");
    },
  },
  async ({ event, step }) => {
    const { projectId, value } = event.data;

    await step.run("reset-events", async () => {
      await clearEvents(projectId);
      await emit(projectId, BuildEventKind.STATUS, "Starting a sandbox");

      return null;
    });

    const sandboxId = await step.run("create-sandbox", async () => {
      const sandbox = await Sandbox.create(SANDBOX_TEMPLATE, {
        timeoutMs: SANDBOX_TIMEOUT_MS,
        metadata: { projectId },
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

    const buildTools = () => [
      createTool({
        name: "terminal",
        description: "Run a shell command inside the sandbox",
        parameters: z.object({ command: z.string() }),
        handler: async ({ command }, { step }) =>
          step?.run(`terminal-${command.slice(0, 40)}`, async () => {
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
            `write-${files.map((f) => f.path).join(",").slice(0, 40)}`,
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
          step?.run(`read-${files.join(",").slice(0, 40)}`, async () => {
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
          system: PROMPT,
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
    const hasResult = Boolean(summary) && Object.keys(files).length > 0;

    if (!hasResult) {
      await step.run("save-empty-result", async () => {
        await emit(projectId, BuildEventKind.ERROR, "No files were produced");
        await recordFailure(
          projectId,
          "The agent could not finish this build. Try describing the app in more detail.",
        );

        return null;
      });

      return { status: "failed" as const };
    }

    await step.run("summarise", async () => {
      await emit(
        projectId,
        BuildEventKind.STATUS,
        `Built with ${codeCandidate.label}`,
        codeCandidate.model,
      );

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

        const { output } = await agent.run(summary, { step });

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

        const { output } = await agent.run(summary, { step });

        return agentOutputText(output, "Here is what I built for you.");
      },
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      await emit(projectId, BuildEventKind.STATUS, "Booting the preview");

      const sandbox = await Sandbox.connect(sandboxId);

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
      status: "completed" as const,
      provider: codeCandidate.provider,
      url: sandboxUrl,
      title: fragmentTitle,
      files,
    };
  },
);

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
import { fragment, message, MessageRole, MessageType } from "@/db/schema";
import { resolveModel } from "@/lib/ai";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/lib/prompt";
import { inngest } from "./client";
import {
  agentOutputText,
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

async function recordFailure(projectId: string, content: string) {
  await db.insert(message).values({
    projectId,
    content,
    role: MessageRole.ASSISTANT,
    type: MessageType.ERROR,
  });
}

function describeFailure(error: unknown) {
  const raw =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";

  const detail = raw.trim().slice(0, 200);

  if (/status code: 404|model_not_found|does not exist/i.test(detail)) {
    return `The configured model is not available for your API key. Check AI_PROVIDER and AI_MODEL. (${detail})`;
  }

  if (/status code: 402|insufficient|quota|credit/i.test(detail)) {
    return `The AI provider refused the request for billing reasons — the account is out of credit. Top it up or switch providers with AI_CODE_PROVIDER. (${detail})`;
  }

  if (/status code: 429|rate.?limit/i.test(detail)) {
    return `The AI provider rate limit was hit before the build finished. Wait a minute and try again, or use a provider with a higher token-per-minute limit. (${detail})`;
  }

  if (/401|403|invalid_api_key|unauthorized/i.test(detail)) {
    return `The AI provider rejected the API key. Check the provider key in .env. (${detail})`;
  }

  if (/template .* not found/i.test(detail)) {
    return "The E2B sandbox template is missing. Run `bun run sandbox:build` and try again.";
  }

  return detail
    ? `The build failed: ${detail}`
    : "The build failed after several attempts. Try rephrasing your request.";
}

export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent",
    triggers: { event: "code-agent/run" },
    retries: 4,
    onFailure: async ({ event }) => {
      const projectId = event.data.event.data.projectId as string | undefined;

      if (!projectId) return;

      await recordFailure(projectId, describeFailure(event.data.error));
    },
  },
  async ({ event, step }) => {
    const { projectId, value } = event.data;

    const sandboxId = await step.run("create-sandbox", async () => {
      const sandbox = await Sandbox.create(SANDBOX_TEMPLATE, {
        timeoutMs: SANDBOX_TIMEOUT_MS,
        metadata: { projectId },
      });

      return sandbox.sandboxId;
    });

    const previousMessages = await step.run("load-history", async () => {
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

    const codeAgent = createAgent<CodeAgentState>({
      name: "code-agent",
      description: "Builds and edits the application inside the sandbox",
      system: PROMPT,
      model: resolveModel("code"),
      tools: [
        createTool({
          name: "terminal",
          description: "Run a shell command inside the sandbox",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) =>
            step?.run("terminal", async () => {
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
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const written = await step?.run("create-or-update-files", async () => {
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
            });

            if (typeof written === "string") {
              return written;
            }

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
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) =>
            step?.run("read-files", async () => {
              try {
                const sandbox = await Sandbox.connect(sandboxId);
                const contents: { path: string; content: string }[] = [];

                for (const path of files) {
                  contents.push({ path, content: await sandbox.files.read(path) });
                }

                return JSON.stringify(contents);
              } catch (error) {
                return `Failed to read files: ${toolErrorMessage(error)}`;
              }
            }),
        }),
      ],

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
      name: "code-agent-network",
      agents: [codeAgent],
      maxIter: MAX_ITERATIONS,
      router: async ({ network }) =>
        network.state.data.summary ? undefined : codeAgent,
    });

    const result = await network.run(value, { state });
    const summary = extractTaskSummary(result.state.data.summary);
    const files = result.state.data.files ?? {};
    const hasResult = Boolean(summary) && Object.keys(files).length > 0;

    if (!hasResult) {
      await step.run("save-empty-result", () =>
        recordFailure(
          projectId,
          "The agent could not finish this build. Try describing the app in more detail.",
        ),
      );

      return { status: "failed" as const };
    }

    const titleAgent = createAgent({
      name: "fragment-title-generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: resolveModel("title"),
    });

    const responseAgent = createAgent({
      name: "response-generator",
      system: RESPONSE_PROMPT,
      model: resolveModel("response"),
    });

    const [titleResult, responseResult] = await Promise.all([
      titleAgent.run(summary, { step }),
      responseAgent.run(summary, { step }),
    ]);

    const fragmentTitle = agentOutputText(titleResult.output, "Untitled");
    const responseText = agentOutputText(
      responseResult.output,
      "Here is what I built for you.",
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await Sandbox.connect(sandboxId);

      return `https://${sandbox.getHost(PREVIEW_PORT)}`;
    });

    await step.run("save-result", async () => {
      const messageId = crypto.randomUUID();

      return db.batch([
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
    });

    return {
      status: "completed" as const,
      url: sandboxUrl,
      title: fragmentTitle,
      files,
    };
  },
);

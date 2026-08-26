import type { AgentResult, Message, TextMessage } from "@inngest/agent-kit";

function isAssistantText(message: Message): message is TextMessage {
  return message.type === "text" && message.role === "assistant";
}

export function lastAssistantTextMessageContent(
  result: Pick<AgentResult, "output">,
): string | undefined {
  const index = result.output.findLastIndex(isAssistantText);

  if (index === -1) return undefined;

  const { content } = result.output[index] as TextMessage;

  return typeof content === "string"
    ? content
    : content.map((part) => part.text).join("");
}

export function agentOutputText(
  output: AgentResult["output"],
  fallback: string,
) {
  const text = lastAssistantTextMessageContent({ output })?.trim();

  return text ? text : fallback;
}

export function extractTaskSummary(raw: string | undefined) {
  if (!raw) return "";

  const match = raw.match(/<task_summary>([\s\S]*?)<\/task_summary>/i);

  return (match ? match[1] : raw).trim();
}

export function toolErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function describeFailure(error: unknown) {
  const raw =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";

  const detail = raw.trim().slice(0, 200);

  if (/template .* not found/i.test(detail)) {
    return "The E2B sandbox template is missing. Run `bun run sandbox:build` and try again.";
  }

  // E2B rejects sandboxes created with `secure: true` (the SDK default) on
  // templates whose envd predates secured access. In practice that means the
  // template was never rebuilt on this account.
  if (/secured access/i.test(detail)) {
    return "The E2B sandbox template predates secured access. Rebuild it with `bun run sandbox:build` and try again.";
  }

  if (/status code: 402|insufficient|quota|credit/i.test(detail)) {
    return `Every configured AI provider refused the request for billing reasons. Top one up or add another key. (${detail})`;
  }

  if (/status code: 429|rate.?limit/i.test(detail)) {
    return `Every configured AI provider hit a rate limit. Wait a minute and try again, or add a key with more headroom. (${detail})`;
  }

  if (/status code: 40[134]|invalid.?api.?key|unauthorized|not found/i.test(detail)) {
    return `No configured AI provider accepted the request. Check the keys and model names in .env. (${detail})`;
  }

  return detail
    ? `The build failed: ${detail}`
    : "The build failed after several attempts. Try rephrasing your request.";
}

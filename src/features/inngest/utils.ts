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

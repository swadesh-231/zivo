export const PROMPT_PARAM = "prompt";

const MAX_HANDOFF_LENGTH = 1000;

export function withPrompt(path: string, prompt: string) {
  const trimmed = prompt.trim().slice(0, MAX_HANDOFF_LENGTH);

  if (!trimmed) return path;

  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}${PROMPT_PARAM}=${encodeURIComponent(trimmed)}`;
}

export function readPrompt(value: string | string[] | undefined) {
  if (typeof value !== "string") return "";

  return value.slice(0, MAX_HANDOFF_LENGTH);
}

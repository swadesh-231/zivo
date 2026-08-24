import "server-only";

import { inngest } from "./client";
export const MAX_PROMPT_LENGTH = 8000;

export const BUILD_EVENT_NAME = "code-agent/run";

export const INNGEST_UNREACHABLE =
  "Could not reach the Inngest server. Start it with `bun run inngest` and try again.";
export async function dispatchBuild(projectId: string, value: string) {
  await inngest.send({
    name: BUILD_EVENT_NAME,
    data: { value, projectId },
  });
}

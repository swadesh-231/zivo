/**
 * Plain values shared by the server actions that enforce them and the client
 * that shows them. Kept out of `dispatch.ts`, which is `server-only` because it
 * holds the Inngest client — importing that from a component is a build error.
 */

export const MAX_PROMPT_LENGTH = 8000;

export const BUILD_EVENT_NAME = "code-agent/run";

export const INNGEST_UNREACHABLE =
  "Could not reach the Inngest server. Start it with `bun run inngest` and try again.";

/**
 * How long an E2B sandbox stays alive. The preview URL stored on a fragment
 * points at a machine that is gone once this elapses, so the client uses the
 * same number to decide whether to embed the preview or explain that it
 * expired. Overriding E2B_SANDBOX_TIMEOUT_MS moves the server side only — the
 * client keeps estimating from this default.
 */
export const SANDBOX_TTL_MS = 15 * 60 * 1000;

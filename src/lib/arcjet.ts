import "server-only";

import arcjet, {
  detectBot,
  detectPromptInjection,
  fixedWindow,
  request,
  shield,
  tokenBucket,
} from "@arcjet/next";

import { optionalEnv } from "@/lib/env";

const key = optionalEnv("ARCJET_KEY");

export const isArcjetConfigured = Boolean(key);
const base = key ? arcjet({ key, rules: [shield({ mode: "LIVE" })] }) : null;

type ArcjetClient = NonNullable<typeof base>;
type Decision = Awaited<ReturnType<ArcjetClient["protect"]>>;

const BUILD_CAPACITY = 10;
const BUILD_REFILL_PER_HOUR = 5;

const buildGuard = base
  ?.withRule(
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId"],
      refillRate: BUILD_REFILL_PER_HOUR,
      interval: "1h",
      capacity: BUILD_CAPACITY,
    }),
  )
  .withRule(
    detectPromptInjection({ mode: "DRY_RUN" }),
  );

const uploadGuard = base?.withRule(
  fixedWindow({
    mode: "LIVE",
    characteristics: ["userId"],
    window: "1m",
    max: 10,
  }),
);

const downloadGuard = base?.withRule(
  fixedWindow({
    mode: "LIVE",
    characteristics: ["userId"],
    window: "1m",
    max: 20,
  }),
);

const authGuard = base
  ?.withRule(fixedWindow({ mode: "LIVE", window: "1m", max: 60 }))
  .withRule(
    detectBot({ mode: "DRY_RUN", allow: [] }),
  );

export type Denial = { message: string; status: number };

function toDenial(decision: Decision): Denial | null {
  if (!decision.isDenied()) return null;

  if (decision.reason.isRateLimit()) {
    return {
      message:
        "You have made a lot of requests recently. Wait a few minutes and try again.",
      status: 429,
    };
  }

  if (decision.reason.isBot()) {
    return { message: "This request looked automated and was blocked.", status: 403 };
  }

  return { message: "That request was blocked for security reasons.", status: 403 };
}
async function decide(run: () => Promise<Decision>): Promise<Denial | null> {
  try {
    return toDenial(await run());
  } catch (error) {
    console.error("Arcjet check failed, allowing the request:", error);

    return null;
  }
}

export async function guardBuild(userId: string, prompt: string) {
  if (!buildGuard) return null;

  return decide(async () =>
    buildGuard.protect(await request(), {
      userId,
      requested: 1,
      detectPromptInjectionMessage: prompt,
    }),
  );
}

export async function guardUpload(req: Request, userId: string) {
  if (!uploadGuard) return null;

  return decide(() => uploadGuard.protect(req, { userId }));
}

export async function guardDownload(req: Request, userId: string) {
  if (!downloadGuard) return null;

  return decide(() => downloadGuard.protect(req, { userId }));
}

export async function guardAuth(req: Request) {
  if (!authGuard) return null;

  return decide(() => authGuard.protect(req));
}

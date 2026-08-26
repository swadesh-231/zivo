import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { appUrl, optionalEnv, requiredEnv } from "@/lib/env";
import { AUTH_COOKIE_PREFIX, type SocialProvider } from "@/lib/auth-config";
import { socialProviderCredentials } from "@/lib/auth-providers";

const DAY = 60 * 60 * 24;

const socialProviders = socialProviderCredentials();
const enabledProviders = Object.keys(socialProviders) as SocialProvider[];

if (enabledProviders.length === 0) {
  // Social sign-in is the only way in, so this leaves the app unusable. It is
  // still not worth throwing at import time: that would take down every route
  // that touches a session instead of just the sign-in page, which renders its
  // own "not configured" state.
  console.error(
    "No sign-in provider is configured. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET or GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET.",
  );
}

export const auth = betterAuth({
  appName: "Zivo",
  baseURL: appUrl(),
  secret: requiredEnv("BETTER_AUTH_SECRET"),
  trustedOrigins: [appUrl()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders,
  account: {
    accountLinking: {
      enabled: true,
      // Someone who signs in with GitHub and then Google on the same address
      // lands on one account rather than two. Both providers report whether
      // the address is verified on their side, which is what makes matching on
      // email safe here.
      trustedProviders: enabledProviders,
    },
  },
  session: {
    expiresIn: DAY * 30,
    updateAge: DAY,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    cookiePrefix: AUTH_COOKIE_PREFIX,
    useSecureCookies: appUrl().startsWith("https://"),
  },
  telemetry: {
    enabled: optionalEnv("BETTER_AUTH_TELEMETRY") === "1",
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type SessionUser = Session["user"];

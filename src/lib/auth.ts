import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { appUrl, optionalEnv, requiredEnv } from "@/lib/env";
import { AUTH_COOKIE_PREFIX } from "@/lib/auth-config";

const DAY = 60 * 60 * 24;

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
  socialProviders: {
    google: {
      clientId: requiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
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

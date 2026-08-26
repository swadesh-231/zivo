"use client";

import { createAuthClient } from "better-auth/react";

import { AFTER_SIGN_IN_PATH, type SocialProvider } from "@/lib/auth-config";

export const authClient = createAuthClient();

export const { signIn, signOut, useSession, getSession, updateUser } =
  authClient;

export function signInWithProvider(
  provider: SocialProvider,
  callbackURL: string = AFTER_SIGN_IN_PATH,
) {
  return authClient.signIn.social({ provider, callbackURL });
}

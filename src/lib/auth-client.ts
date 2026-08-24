"use client";

import { createAuthClient } from "better-auth/react";

import { AFTER_SIGN_IN_PATH } from "@/lib/auth-config";

export const authClient = createAuthClient();

export const { signIn, signOut, useSession, getSession, updateUser } =
  authClient;

export function signInWithGoogle(callbackURL: string = AFTER_SIGN_IN_PATH) {
  return authClient.signIn.social({ provider: "google", callbackURL });
}

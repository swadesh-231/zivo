import "server-only";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  isSocialProvider,
  SIGN_IN_PATH,
  type SocialProvider,
} from "@/lib/auth-config";

export async function getSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to read session:", error);

    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();

  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(SIGN_IN_PATH);
  }

  return user;
}

/**
 * Which sign-in providers the current user's account is linked to. Account
 * linking means one user can have several, so this is a list.
 */
export async function getLinkedProviders(): Promise<SocialProvider[]> {
  try {
    const accounts = await auth.api.listUserAccounts({
      headers: await headers(),
    });

    return [
      ...new Set(
        accounts
          .map((account) => account.providerId)
          .filter((providerId) => isSocialProvider(providerId)),
      ),
    ];
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to list linked accounts:", error);

    return [];
  }
}

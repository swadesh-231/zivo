import "server-only";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";

import { auth } from "@/lib/auth";
import { SIGN_IN_PATH } from "@/lib/auth-config";

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

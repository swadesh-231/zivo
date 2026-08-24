import "server-only";

import { getUploadAuthParams } from "@imagekit/next/server";

import { optionalEnv } from "@/lib/env";

function credentials() {
  const publicKey = optionalEnv("IMAGEKIT_PUBLIC_KEY", "IMAGE_KIT_PUBLIC_KEY");
  const privateKey = optionalEnv(
    "IMAGEKIT_PRIVATE_KEY",
    "IMAGE_KIT_PRIVATE_KEY",
  );

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey };
}

export function isImageKitConfigured() {
  return credentials() !== null;
}

export function createUploadAuth() {
  const keys = credentials();

  if (!keys) {
    throw new Error(
      "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY.",
    );
  }

  const { token, signature, expire } = getUploadAuthParams({
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
  });

  return { token, signature, expire, publicKey: keys.publicKey };
}

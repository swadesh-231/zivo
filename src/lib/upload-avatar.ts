"use client";

import { upload } from "@imagekit/next";

import { AVATAR_FOLDER } from "@/lib/avatar";

export { AVATAR_ACCEPT, AVATAR_HINT, validateAvatar } from "@/lib/avatar";

export async function uploadAvatar(
  file: File,
  onProgress?: (percent: number) => void,
) {
  const response = await fetch("/api/imagekit/auth");

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(body?.error ?? "Could not prepare the upload.");
  }

  const { token, signature, expire, publicKey } = (await response.json()) as {
    token: string;
    signature: string;
    expire: number;
    publicKey: string;
  };

  const result = await upload({
    file,
    fileName: file.name,
    folder: AVATAR_FOLDER,
    useUniqueFileName: true,
    token,
    signature,
    expire,
    publicKey,
    onProgress: (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  if (!result.url) {
    throw new Error("The upload finished without returning a URL.");
  }

  return result.url;
}

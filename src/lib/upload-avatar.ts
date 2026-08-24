"use client";

import { upload } from "@imagekit/next";

const MAX_BYTES = 4 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
];

export const AVATAR_ACCEPT = ACCEPTED_TYPES.join(",");

export function validateAvatar(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Use a PNG, JPEG, WebP, or AVIF image.";
  }

  if (file.size > MAX_BYTES) {
    return "Keep the image under 4 MB.";
  }

  return null;
}

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
    folder: "/zivo/avatars",
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

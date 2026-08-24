
export const AVATAR_FOLDER = "/zivo/avatars";

export const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

export const ACCEPTED_AVATAR_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
] as const;

export const AVATAR_ACCEPT = ACCEPTED_AVATAR_TYPES.join(",");

export const AVATAR_HINT = "PNG, JPEG, WebP, or AVIF up to 4 MB.";

export function validateAvatar(file: File) {
  if (!(ACCEPTED_AVATAR_TYPES as readonly string[]).includes(file.type)) {
    return "Use a PNG, JPEG, WebP, or AVIF image.";
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return "Keep the image under 4 MB.";
  }

  return null;
}

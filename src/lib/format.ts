import { formatDistanceToNowStrict } from "date-fns";

export function getInitials(name?: string | null) {
  if (!name?.trim()) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatRelativeTime(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${formatDistanceToNowStrict(date)} ago`;
}

export function formatProjectName(name: string) {
  return name.replace(/-/g, " ");
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function seededGradient(seed: string) {
  const hash = hashString(seed);
  const from = hash % 360;
  const to = (from + 45 + (hash % 90)) % 360;

  return `linear-gradient(135deg, oklch(0.62 0.16 ${from}) 0%, oklch(0.48 0.14 ${to}) 100%)`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

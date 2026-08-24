"use client";

import { ChevronRight, Code2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Fragment } from "@/db/schema";

export function FragmentCard({
  fragment,
  isActive,
  onSelect,
}: {
  fragment: Fragment;
  isActive: boolean;
  onSelect: () => void;
}) {
  const fileCount = Object.keys(fragment.files ?? {}).length;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
        isActive
          ? "border-foreground/25 bg-muted"
          : "border-border/70 bg-card/40 hover:border-border hover:bg-card",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background">
        <Code2 className="size-3.5 text-muted-foreground" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {fragment.title}
        </span>
        <span className="block text-xs text-muted-foreground">
          {fileCount} {fileCount === 1 ? "file" : "files"}
        </span>
      </span>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

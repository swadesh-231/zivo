"use client";

import { ArrowUpRight, Code2 } from "lucide-react";

import type { Fragment } from "@/db/schema";
import { cn } from "@/lib/utils";

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
        "group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all",
        isActive
          ? "border-foreground/20 bg-muted shadow-xs"
          : "border-border/70 bg-card/40 hover:border-border hover:bg-card/80",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background">
        <Code2 className="size-4 text-muted-foreground" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">
          {fragment.title}
        </span>
        <span className="block text-[11px] text-muted-foreground">
          {fileCount} {fileCount === 1 ? "file" : "files"} · Preview
        </span>
      </span>

      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </button>
  );
}

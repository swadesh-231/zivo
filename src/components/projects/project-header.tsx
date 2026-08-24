"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatProjectName } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProjectHeader({
  name,
  isBuilding,
}: {
  name: string;
  isBuilding: boolean;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-2.5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Back to projects"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        <ArrowLeft />
      </Button>

      <p className="min-w-0 flex-1 truncate text-[13px] font-medium capitalize">
        {formatProjectName(name)}
      </p>

      <span
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] transition-colors",
          isBuilding
            ? "bg-muted text-foreground"
            : "text-muted-foreground/70",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            isBuilding ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/40",
          )}
        />
        {isBuilding ? "Building" : "Ready"}
      </span>
    </div>
  );
}

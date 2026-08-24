"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatProjectName } from "@/lib/format";

export function ProjectHeader({
  name,
  isBuilding,
}: {
  name: string;
  isBuilding: boolean;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border/60 px-3">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Back to projects"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        <ArrowLeft />
      </Button>

      <p className="min-w-0 flex-1 truncate text-sm font-medium capitalize">
        {formatProjectName(name)}
      </p>

      {isBuilding ? (
        <Badge variant="secondary" className="gap-1.5">
          <Loader2 className="size-3 animate-spin" />
          Building
        </Badge>
      ) : null}
    </div>
  );
}

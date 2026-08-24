"use client";

import {
  Brain,
  FileText,
  Search,
  Terminal,
  TriangleAlert,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import type { BuildEvent } from "@/db/schema";
import { cn } from "@/lib/utils";

const ICONS = {
  STATUS: Brain,
  THOUGHT: Brain,
  READ: Search,
  WRITE: FileText,
  TERMINAL: Terminal,
  ERROR: TriangleAlert,
} as const;

function elapsed(from: Date | string, to: Date | string) {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  const seconds = Math.max(0, Math.round((end - start) / 1000));

  return seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;
}

export function ActivityFeed({
  events,
  startedAt,
  isBuilding,
}: {
  events: BuildEvent[];
  startedAt: Date | string;
  isBuilding: boolean;
}) {
  if (events.length === 0) {
    return (
      <div className="flex items-center gap-2.5 py-1 text-sm text-muted-foreground">
        <Spinner className="size-3.5" />
        Thinking…
      </div>
    );
  }

  const [first, ...rest] = events;
  const lastIndex = events.length - 1;

  return (
    <div className="flex flex-col gap-2.5 py-1">
      <div className="flex items-center gap-2.5 text-sm">
        <Brain className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">
          Thought for {elapsed(startedAt, first.createdAt)}
        </span>
      </div>

      {rest.map((event, index) => {
        const Icon = ICONS[event.kind] ?? Search;
        const isCurrent = isBuilding && index === lastIndex - 1;

        return (
          <div key={event.id} className="flex items-start gap-2.5 text-sm">
            {isCurrent ? (
              <Spinner className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            ) : (
              <Icon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  event.kind === "ERROR"
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              />
            )}

            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block truncate",
                  event.kind === "ERROR"
                    ? "text-destructive"
                    : isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {event.label}
              </span>
              {event.detail ? (
                <span className="block truncate font-mono text-[11px] text-muted-foreground/70">
                  {event.detail}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import {
  Brain,
  FileText,
  Sparkles,
  Terminal,
  TextSearch,
  TriangleAlert,
} from "lucide-react";

import type { BuildEvent, BuildEventKind } from "@/db/schema";
import { cn } from "@/lib/utils";

const ICONS: Record<BuildEventKind, typeof Brain> = {
  STATUS: Sparkles,
  THOUGHT: Brain,
  READ: TextSearch,
  WRITE: FileText,
  TERMINAL: Terminal,
  ERROR: TriangleAlert,
};

function elapsed(from: Date | string, to: Date | string) {
  const seconds = Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 1000),
  );

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);

  return seconds % 60 === 0
    ? `${minutes}m`
    : `${minutes}m ${seconds % 60}s`;
}

function Step({
  icon: Icon,
  label,
  detail,
  isError,
  isActive,
  isLast,
}: {
  icon: typeof Brain;
  label: string;
  detail?: string | null;
  isError?: boolean;
  isActive?: boolean;
  isLast?: boolean;
}) {
  return (
    <li className="fade-up relative flex gap-3 pb-3 last:pb-0">
      {/* Rail connecting one step to the next. */}
      {!isLast ? (
        <span
          aria-hidden
          className="absolute top-6 bottom-0 left-[11px] w-px bg-border"
        />
      ) : null}

      <span
        className={cn(
          "relative z-10 flex size-[22px] shrink-0 items-center justify-center rounded-full border bg-background transition-colors",
          isError
            ? "border-destructive/30 text-destructive"
            : isActive
              ? "border-foreground/25 text-foreground"
              : "border-border text-muted-foreground",
        )}
      >
        <Icon className={cn("size-3", isActive && "animate-pulse")} />
      </span>

      <span className="min-w-0 flex-1 pt-0.5">
        <span
          className={cn(
            "block truncate text-[13px] leading-5",
            isError
              ? "text-destructive"
              : isActive
                ? "shimmer-text font-medium"
                : "text-muted-foreground",
          )}
        >
          {label}
        </span>

        {detail ? (
          <span className="mt-0.5 block truncate font-mono text-[11px] leading-4 text-muted-foreground/60">
            {detail}
          </span>
        ) : null}
      </span>
    </li>
  );
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
  const [first, ...rest] = events;

  return (
    <ol className="flex flex-col">
      <Step
        icon={Brain}
        label={
          first
            ? `Thought for ${elapsed(startedAt, first.createdAt)}`
            : "Thinking"
        }
        isActive={!first && isBuilding}
        isLast={rest.length === 0 && !isBuilding}
      />

      {rest.map((event, index) => (
        <Step
          key={event.id}
          icon={ICONS[event.kind] ?? Sparkles}
          label={event.label}
          detail={event.detail}
          isError={event.kind === "ERROR"}
          isActive={isBuilding && index === rest.length - 1}
          isLast={!isBuilding && index === rest.length - 1}
        />
      ))}

      {isBuilding && events.length > 0 ? (
        <Step icon={Sparkles} label="Working" isActive isLast />
      ) : null}
    </ol>
  );
}

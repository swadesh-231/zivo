"use client";

import { useEffect, useRef } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";

import { ActivityFeed } from "@/components/projects/activity-feed";
import { FragmentCard } from "@/components/projects/fragment-card";
import { RichText } from "@/components/projects/rich-text";
import { Skeleton } from "@/components/ui/skeleton";
import type { BuildEvent } from "@/db/schema";
import type { ProjectMessage } from "@/features/messages/actions";
import type { BuildState } from "@/features/messages/hooks/messages";
import { formatRelativeTime } from "@/lib/format";

function StalledNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-card/40 px-3.5 py-3 text-[13px] leading-relaxed text-muted-foreground">
      <RotateCw className="mt-0.5 size-3.5 shrink-0" />
      <span>
        This build never reported back. The sandbox may have timed out or the
        agent server was unreachable. Send the request again to retry.
      </span>
    </div>
  );
}

function UserMessage({ entry }: { entry: ProjectMessage }) {
  return (
    <div className="fade-up flex flex-col items-end gap-1">
      <div className="max-w-[88%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap">
        {entry.content}
      </div>
      <span className="px-1 text-[11px] text-muted-foreground/60">
        {formatRelativeTime(entry.createdAt)}
      </span>
    </div>
  );
}

function AssistantMessage({
  entry,
  activeFragmentId,
  onSelectFragment,
}: {
  entry: ProjectMessage;
  activeFragmentId: string | null;
  onSelectFragment: (fragmentId: string) => void;
}) {
  if (entry.type === "ERROR") {
    return (
      <div className="fade-up flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/8 px-3.5 py-3 text-[13px] leading-relaxed text-destructive">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <span className="min-w-0">{entry.content}</span>
      </div>
    );
  }

  return (
    <div className="fade-up flex flex-col gap-3">
      <div className="text-[13px] leading-relaxed text-foreground/90">
        <RichText>{entry.content}</RichText>
      </div>

      {entry.fragment ? (
        <FragmentCard
          fragment={entry.fragment}
          isActive={entry.fragment.id === activeFragmentId}
          onSelect={() => onSelectFragment(entry.fragment!.id)}
        />
      ) : null}
    </div>
  );
}

export function MessageThread({
  messages,
  isLoading,
  buildState,
  buildEvents,
  activeFragmentId,
  onSelectFragment,
}: {
  messages: ProjectMessage[];
  isLoading: boolean;
  buildState: BuildState;
  buildEvents: BuildEvent[];
  activeFragmentId: string | null;
  onSelectFragment: (fragmentId: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, buildState, buildEvents.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-4">
        <Skeleton className="h-12 w-3/5 self-end rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-14 w-4/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      {messages.map((entry) =>
        entry.role === "USER" ? (
          <UserMessage key={entry.id} entry={entry} />
        ) : (
          <AssistantMessage
            key={entry.id}
            entry={entry}
            activeFragmentId={activeFragmentId}
            onSelectFragment={onSelectFragment}
          />
        ),
      )}

      {buildState === "building" ? (
        <ActivityFeed
          events={buildEvents}
          startedAt={messages.at(-1)?.createdAt ?? new Date()}
          isBuilding
        />
      ) : null}

      {buildState === "stalled" ? <StalledNotice /> : null}

      <div ref={endRef} />
    </div>
  );
}

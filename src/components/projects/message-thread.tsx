"use client";

import { useEffect, useRef } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";

import { FragmentCard } from "@/components/projects/fragment-card";
import { RichText } from "@/components/projects/rich-text";
import { Message, MessageContent, MessageGroup } from "@/components/ui/message";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { ProjectMessage } from "@/features/messages/actions";
import type { BuildState } from "@/features/messages/hooks/messages";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function BuildingIndicator() {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card/40 px-3 py-2.5 text-sm text-muted-foreground">
      <Spinner className="size-3.5" />
      <span>Agents are writing files and booting the preview…</span>
    </div>
  );
}

function StalledNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-card/40 px-3 py-2.5 text-sm text-muted-foreground">
      <RotateCw className="mt-0.5 size-3.5 shrink-0" />
      <span>
        This build never reported back. The sandbox may have timed out or the
        agent server was unreachable. Send the request again to retry.
      </span>
    </div>
  );
}

function FragmentEntry({
  fragment,
  activeFragmentId,
  onSelectFragment,
}: {
  fragment: NonNullable<ProjectMessage["fragment"]>;
  activeFragmentId: string | null;
  onSelectFragment: (fragmentId: string) => void;
}) {
  return (
    <FragmentCard
      fragment={fragment}
      isActive={fragment.id === activeFragmentId}
      onSelect={() => onSelectFragment(fragment.id)}
    />
  );
}

export function MessageThread({
  messages,
  isLoading,
  buildState,
  activeFragmentId,
  onSelectFragment,
}: {
  messages: ProjectMessage[];
  isLoading: boolean;
  buildState: BuildState;
  activeFragmentId: string | null;
  onSelectFragment: (fragmentId: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, buildState]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-14 w-3/5 self-end rounded-2xl" />
        <Skeleton className="h-24 w-4/5 rounded-2xl" />
        <Skeleton className="h-16 w-2/3 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <MessageGroup className="gap-5">
        {messages.map((entry) => {
          const isUser = entry.role === "USER";

          return (
            <Message key={entry.id} align={isUser ? "end" : "start"}>
              <MessageContent className="max-w-[92%]">
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/70 bg-card/50",
                    entry.type === "ERROR" &&
                      "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {entry.type === "ERROR" ? (
                    <span className="flex items-start gap-2">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                      {entry.content}
                    </span>
                  ) : isUser ? (
                    entry.content
                  ) : (
                    <RichText>{entry.content}</RichText>
                  )}
                </div>

                {entry.fragment ? (
                  <FragmentEntry
                    fragment={entry.fragment}
                    activeFragmentId={activeFragmentId}
                    onSelectFragment={onSelectFragment}
                  />
                ) : null}

                <span className="px-1 text-[11px] text-muted-foreground">
                  {formatRelativeTime(entry.createdAt)}
                </span>
              </MessageContent>
            </Message>
          );
        })}
      </MessageGroup>

      {buildState === "building" ? <BuildingIndicator /> : null}
      {buildState === "stalled" ? <StalledNotice /> : null}

      <div ref={endRef} />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { MessageSquare, MonitorPlay, TriangleAlert } from "lucide-react";

import { MessageComposer } from "@/components/projects/message-composer";
import { MessageThread } from "@/components/projects/message-thread";
import { PreviewPane } from "@/components/projects/preview-pane";
import { ProjectHeader } from "@/components/projects/project-header";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { getBuildState, useMessages } from "@/features/messages/hooks/messages";
import { cn } from "@/lib/utils";

export function ProjectView({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const messages = useMessages(projectId);
  const [selectedFragmentId, setSelectedFragmentId] = useState<string | null>(
    null,
  );
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");

  const fragments = useMemo(
    () =>
      (messages.data ?? [])
        .map((entry) => entry.fragment)
        .filter((fragment) => fragment !== null),
    [messages.data],
  );

  const activeFragment = useMemo(() => {
    if (selectedFragmentId) {
      const match = fragments.find(
        (fragment) => fragment.id === selectedFragmentId,
      );

      if (match) return match;
    }

    return fragments.at(-1) ?? null;
  }, [fragments, selectedFragmentId]);

  const buildState = getBuildState(messages.data);
  const isBuilding = buildState === "building";

  if (messages.isError) {
    return (
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Could not open this project</EmptyTitle>
          <EmptyDescription>{messages.error.message}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const chatPanel = (
    <div className="flex h-full min-h-0 flex-col">
      <ProjectHeader name={projectName} isBuilding={isBuilding} />

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <MessageThread
          messages={messages.data ?? []}
          isLoading={messages.isPending}
          buildState={buildState}
          activeFragmentId={activeFragment?.id ?? null}
          onSelectFragment={(fragmentId) => {
            setSelectedFragmentId(fragmentId);
            setMobileView("preview");
          }}
        />
      </div>

      <MessageComposer projectId={projectId} disabled={isBuilding} />
    </div>
  );

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-border/60 p-2 lg:hidden">
        {(
          [
            { value: "chat", label: "Chat", icon: MessageSquare },
            { value: "preview", label: "Preview", icon: MonitorPlay },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setMobileView(tab.value)}
            aria-pressed={mobileView === tab.value}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              mobileView === tab.value
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 lg:hidden">
        {mobileView === "chat" ? (
          chatPanel
        ) : (
          <PreviewPane fragment={activeFragment} />
        )}
      </div>

      <ResizablePanelGroup
        orientation="horizontal"
        className="hidden min-h-0 flex-1 lg:flex"
      >
        <ResizablePanel defaultSize="34%" minSize="24%" maxSize="55%">
          {chatPanel}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="66%" minSize="45%">
          <PreviewPane fragment={activeFragment} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

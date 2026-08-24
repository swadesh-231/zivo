"use client";

import { useMemo, useState } from "react";
import { Code2, MessageSquare, MonitorPlay, TriangleAlert } from "lucide-react";

import { CodeViewer } from "@/components/projects/code-viewer";
import { MessageComposer } from "@/components/projects/message-composer";
import { MessageThread } from "@/components/projects/message-thread";
import { PreviewPanel } from "@/components/projects/preview-panel";
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
import {
  getBuildState,
  useBuildEvents,
  useMessages,
} from "@/features/messages/hooks/messages";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { value: "chat", label: "Chat", icon: MessageSquare },
  { value: "code", label: "Code", icon: Code2 },
  { value: "preview", label: "Preview", icon: MonitorPlay },
] as const;

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
  const [mobileView, setMobileView] =
    useState<(typeof MOBILE_TABS)[number]["value"]>("chat");

  const buildState = getBuildState(messages.data);
  const isBuilding = buildState === "building";
  const events = useBuildEvents(projectId, isBuilding);

  const fragments = useMemo(
    () =>
      (messages.data ?? [])
        .map((entry) => entry.fragment)
        .filter((entry) => entry !== null),
    [messages.data],
  );

  const activeFragment = useMemo(() => {
    if (selectedFragmentId) {
      const match = fragments.find((item) => item.id === selectedFragmentId);
      if (match) return match;
    }

    return fragments.at(-1) ?? null;
  }, [fragments, selectedFragmentId]);

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
          buildEvents={events.data ?? []}
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

  const codePanel = (
    <div className="h-full min-h-0">
      <CodeViewer files={activeFragment?.files ?? {}} />
    </div>
  );

  const previewPanel = (
    <PreviewPanel fragment={activeFragment} projectId={projectId} />
  );

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-border/60 p-2 lg:hidden">
        {MOBILE_TABS.map((tab) => (
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
        {mobileView === "chat"
          ? chatPanel
          : mobileView === "code"
            ? codePanel
            : previewPanel}
      </div>

      <ResizablePanelGroup
        orientation="horizontal"
        className="hidden min-h-0 flex-1 lg:flex"
      >
        <ResizablePanel defaultSize="26%" minSize="20%" maxSize="40%">
          {chatPanel}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="34%" minSize="20%">
          {codePanel}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="40%" minSize="25%">
          {previewPanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

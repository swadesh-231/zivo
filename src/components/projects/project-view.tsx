"use client";

import { useMemo, useState } from "react";
import { Code2, MessageSquare, MonitorPlay, TriangleAlert } from "lucide-react";

import { CodeViewer } from "@/components/projects/code-viewer";
import { MessageComposer } from "@/components/projects/message-composer";
import { MessageThread } from "@/components/projects/message-thread";
import { PreviewPanel } from "@/components/projects/preview-panel";
import { ProjectHeader } from "@/components/projects/project-header";
import {
  WorkspaceTabs,
  type WorkspacePane,
} from "@/components/projects/workspace-tabs";
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
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const [selectedFragmentId, setSelectedFragmentId] = useState<string | null>(
    null,
  );
  const [mobileView, setMobileView] =
    useState<(typeof MOBILE_TABS)[number]["value"]>("chat");
  const [pane, setPane] = useState<WorkspacePane>("preview");

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
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex size-10 items-center justify-center rounded-full border border-border/70">
          <TriangleAlert className="size-4 text-muted-foreground" />
        </span>
        <p className="text-sm font-medium">Could not open this project</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {messages.error.message}
        </p>
      </div>
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

  const codePanel = <CodeViewer files={activeFragment?.files ?? {}} />;

  const previewPanel = (
    <PreviewPanel
      fragment={activeFragment}
      projectId={projectId}
      isBuilding={isBuilding}
      onViewCode={() => setMobileView("code")}
    />
  );

  const tabs = <WorkspaceTabs value={pane} onChange={setPane} />;

  const workspacePane =
    pane === "code" ? (
      <CodeViewer files={activeFragment?.files ?? {}} leading={tabs} />
    ) : (
      <PreviewPanel
        fragment={activeFragment}
        projectId={projectId}
        leading={tabs}
        isBuilding={isBuilding}
        onViewCode={() => setPane("code")}
      />
    );

  if (isMobile) {
    return (
      <div className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col">
        <div className="flex shrink-0 items-center gap-1 border-b border-border/60 p-2">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setMobileView(tab.value)}
              aria-pressed={mobileView === tab.value}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
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

        <div className="min-h-0 flex-1">
          {mobileView === "chat"
            ? chatPanel
            : mobileView === "code"
              ? codePanel
              : previewPanel}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-3.5rem)] min-h-0 flex-col bg-canvas">
      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="26%" minSize="20%" maxSize="42%">
          <div className="h-full min-h-0 bg-background">{chatPanel}</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="74%" minSize="40%">
          {/* Inset so the pane reads as a surface sitting on the canvas. */}
          <div className="h-full min-h-0 p-3 pl-1.5">
            <div className="h-full min-h-0 overflow-hidden rounded-xl border border-border shadow-lg shadow-black/5">
              {workspacePane}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

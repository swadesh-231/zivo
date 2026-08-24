"use client";

import { useState } from "react";
import { Download, ExternalLink, MonitorSmartphone, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Fragment } from "@/db/schema";

export function PreviewPanel({
  fragment,
  projectId,
}: {
  fragment: Fragment | null;
  projectId: string;
}) {
  const [reloadKey, setReloadKey] = useState(0);

  if (!fragment) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MonitorSmartphone />
          </EmptyMedia>
          <EmptyTitle>Nothing to preview yet</EmptyTitle>
          <EmptyDescription>
            The running app appears here once the agents finish a build.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border/60 px-2.5">
        <span className="min-w-0 flex-1 truncate rounded-md bg-muted/50 px-2.5 py-1 text-center font-mono text-[11px] text-muted-foreground">
          {fragment.sandboxUrl.replace(/^https?:\/\//, "")}
        </span>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Reload preview"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          <RotateCw />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Download source as ZIP"
          nativeButton={false}
          render={<a href={`/api/projects/${projectId}/download`} download />}
        >
          <Download />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open preview in a new tab"
          nativeButton={false}
          render={
            <a href={fragment.sandboxUrl} target="_blank" rel="noreferrer" />
          }
        >
          <ExternalLink />
        </Button>
      </div>

      <iframe
        key={reloadKey}
        src={fragment.sandboxUrl}
        title={fragment.title}
        className="min-h-0 flex-1 border-0 bg-background"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="lazy"
      />
    </div>
  );
}

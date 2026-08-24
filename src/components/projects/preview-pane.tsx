"use client";

import { useState } from "react";
import { ExternalLink, MonitorSmartphone, RotateCw } from "lucide-react";

import { CodeViewer } from "@/components/projects/code-viewer";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Fragment } from "@/db/schema";

export function PreviewPane({ fragment }: { fragment: Fragment | null }) {
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
            Once the agents finish a build, the running app and its source show
            up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const fileCount = Object.keys(fragment.files ?? {}).length;

  return (
    <Tabs defaultValue="preview" className="flex h-full min-h-0 flex-col gap-0">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        <TabsList className="h-7">
          <TabsTrigger value="preview" className="text-xs">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="text-xs">
            Code
            <span className="ml-1.5 text-muted-foreground">{fileCount}</span>
          </TabsTrigger>
        </TabsList>

        <span className="mx-2 hidden min-w-0 flex-1 truncate rounded-md bg-muted/50 px-2.5 py-1 text-center font-mono text-[11px] text-muted-foreground sm:block">
          {fragment.sandboxUrl.replace(/^https?:\/\//, "")}
        </span>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
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
            aria-label="Open preview in a new tab"
            nativeButton={false}
            render={
              <a href={fragment.sandboxUrl} target="_blank" rel="noreferrer" />
            }
          >
            <ExternalLink />
          </Button>
        </div>
      </div>

      <TabsContent value="preview" className="min-h-0 flex-1">
        <iframe
          key={reloadKey}
          src={fragment.sandboxUrl}
          title={fragment.title}
          className="size-full border-0 bg-background"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
        />
      </TabsContent>

      <TabsContent value="code" className="min-h-0 flex-1">
        <CodeViewer files={fragment.files ?? {}} />
      </TabsContent>
    </Tabs>
  );
}

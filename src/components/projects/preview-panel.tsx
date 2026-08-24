"use client";

import { useState } from "react";
import {
  Download,
  ExternalLink,
  Monitor,
  RotateCw,
  Smartphone,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import type { Fragment } from "@/db/schema";
import { cn } from "@/lib/utils";

const DEVICES = [
  { value: "desktop", label: "Desktop", icon: Monitor, width: null },
  { value: "mobile", label: "Mobile", icon: Smartphone, width: 420 },
] as const;

type Device = (typeof DEVICES)[number]["value"];

function PreviewToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-3">
      {children}
    </div>
  );
}

export function PreviewPanel({
  fragment,
  projectId,
  leading,
}: {
  fragment: Fragment | null;
  projectId: string;
  leading?: React.ReactNode;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const [device, setDevice] = useState<Device>("desktop");

  if (!fragment) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-muted/20">
        <PreviewToolbar>
          {leading}
          <span className="h-7 flex-1 rounded-lg bg-muted/50" />
        </PreviewToolbar>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <Logo className="size-12 opacity-15" />
          <p className="text-sm text-muted-foreground">
            Your preview will appear here.
          </p>
        </div>
      </div>
    );
  }

  const width = DEVICES.find((entry) => entry.value === device)?.width ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/20">
      <PreviewToolbar>
        {leading}

        <div className="flex items-center rounded-lg bg-muted/60 p-0.5">
          {DEVICES.map((entry) => (
            <button
              key={entry.value}
              type="button"
              onClick={() => setDevice(entry.value)}
              aria-pressed={device === entry.value}
              aria-label={entry.label}
              title={entry.label}
              className={cn(
                "flex size-6 items-center justify-center rounded-md transition-colors",
                device === entry.value
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <entry.icon className="size-3.5" />
            </button>
          ))}
        </div>

        <span className="min-w-0 flex-1 truncate rounded-lg border border-border/60 bg-background/60 px-3 py-1 text-center font-mono text-[11px] text-muted-foreground">
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
      </PreviewToolbar>

      <div
        className={cn(
          "flex min-h-0 flex-1",
          width && "justify-center overflow-auto p-4",
        )}
      >
        <iframe
          key={`${reloadKey}-${device}`}
          src={fragment.sandboxUrl}
          title={fragment.title}
          style={width ? { width, maxWidth: "100%" } : undefined}
          className={cn(
            "min-h-0 flex-1 border-0 bg-background",
            width && "flex-none rounded-xl border border-border/60 shadow-2xl",
          )}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

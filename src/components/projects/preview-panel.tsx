"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Monitor,
  RotateCw,
  Smartphone,
  TimerOff,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import type { Fragment } from "@/db/schema";
import { SANDBOX_TTL_MS } from "@/features/inngest/constants";
import { formatRelativeTime } from "@/lib/format";
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

/** Click to copy, because the URL is the one thing here worth taking away. */
function AddressBar({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 1500);

    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(url).then(() => setCopied(true));
      }}
      title="Copy preview URL"
      className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-1 text-left transition-colors hover:border-border"
    >
      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
        {url.replace(/^https?:\/\//, "")}
      </span>
      {copied ? (
        <Check className="size-3 shrink-0 text-emerald-500" />
      ) : (
        <Copy className="size-3 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" />
      )}
    </button>
  );
}

/**
 * The sandbox behind a preview URL is torn down on a timer, but the fragment
 * keeps that URL forever. Embedding it afterwards renders E2B's own red
 * "Sandbox Not Found" page inside the product, which reads as a crash rather
 * than the expected end of a temporary machine.
 *
 * The clock is an external mutable source, so it is read through a store rather
 * than during render: the server snapshot is always `false`, which keeps
 * hydration stable, and a tab left open flips over on its own instead of
 * showing a dead frame until someone reloads.
 */
function useSandboxExpired(createdAt: Date | string | null) {
  const expiresAt = useMemo(
    () =>
      createdAt ? new Date(createdAt).getTime() + SANDBOX_TTL_MS : Infinity,
    [createdAt],
  );

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (expiresAt === Infinity) return () => {};

      const timer = setInterval(onChange, 30_000);

      return () => clearInterval(timer);
    },
    [expiresAt],
  );

  return useSyncExternalStore(
    subscribe,
    () => Date.now() > expiresAt,
    () => false,
  );
}

function PanelMessage({
  icon,
  title,
  children,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      {icon}
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        {children}
      </p>
      {actions ? <div className="mt-1 flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function PreviewPanel({
  fragment,
  projectId,
  leading,
  onViewCode,
}: {
  fragment: Fragment | null;
  projectId: string;
  leading?: React.ReactNode;
  onViewCode?: () => void;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const [device, setDevice] = useState<Device>("desktop");
  const isExpired = useSandboxExpired(fragment?.createdAt ?? null);

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

  const downloadButton = (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Download source as ZIP"
      title="Download source as ZIP"
      nativeButton={false}
      render={<a href={`/api/projects/${projectId}/download`} download />}
    >
      <Download />
    </Button>
  );

  if (isExpired) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-muted/20">
        <PreviewToolbar>
          {leading}
          <span className="min-w-0 flex-1" />
          {downloadButton}
        </PreviewToolbar>

        <PanelMessage
          icon={
            <span className="flex size-11 items-center justify-center rounded-full border border-border/70 bg-card/60">
              <TimerOff className="size-4.5 text-muted-foreground" />
            </span>
          }
          title="This preview has expired"
          actions={
            <>
              {onViewCode ? (
                <Button variant="outline" size="sm" onClick={onViewCode}>
                  <Code2 data-icon="inline-start" />
                  View the code
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <a href={`/api/projects/${projectId}/download`} download />
                }
              >
                <Download data-icon="inline-start" />
                Download ZIP
              </Button>
            </>
          }
        >
          Sandboxes shut down about 15 minutes after a build, and this one ran{" "}
          {formatRelativeTime(fragment.createdAt)}. Every file it wrote is still
          here — ask for a change in the chat to build and run it again.
        </PanelMessage>
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

        <AddressBar url={fragment.sandboxUrl} />

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Reload preview"
          title="Reload preview"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          <RotateCw />
        </Button>

        {downloadButton}

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Open preview in a new tab"
          title="Open preview in a new tab"
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

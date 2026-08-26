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
import { Spinner } from "@/components/ui/spinner";
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
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 bg-elevated/40 px-3">
      {children}
    </div>
  );
}

/**
 * Stand-in for the address bar before there is a URL to show.
 *
 * The empty state used to render a filled grey pill here, which reads as a
 * skeleton that never resolved. A dashed outline reads as a slot waiting to be
 * filled, which is what it actually is.
 */
function AddressBarPlaceholder({ label }: { label: string }) {
  return (
    <span className="flex h-7 items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-2.5 font-mono text-[11px] text-muted-foreground">
      <Spinner className="size-3" />
      {label}
    </span>
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

/**
 * A suggestion of the browser window the app will eventually render in.
 *
 * The empty state used to be a 12px logo at 15% opacity centred in whatever
 * space the pane had, which on a wide monitor is an enormous emptiness holding
 * one grey sentence. Giving the copy a frame to sit inside bounds it, and the
 * frame doubles as a picture of what the pane is for.
 */
function BrowserFrame({
  isBuilding,
  children,
}: {
  isBuilding?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-elevated shadow-xl shadow-black/10">
      <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-2.5">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            aria-hidden
            className="size-2 rounded-full bg-muted-foreground/30"
          />
        ))}
        <span
          aria-hidden
          className={cn(
            "ml-1.5 h-2 flex-1 rounded-full",
            isBuilding
              ? "animate-pulse bg-muted-foreground/25"
              : "bg-muted-foreground/10",
          )}
        />
      </div>

      <div className="flex flex-col items-center gap-2.5 px-6 py-10 text-center">
        {children}
      </div>
    </div>
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
  isBuilding,
  onViewCode,
}: {
  fragment: Fragment | null;
  projectId: string;
  leading?: React.ReactNode;
  isBuilding?: boolean;
  onViewCode?: () => void;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const [device, setDevice] = useState<Device>("desktop");
  const isExpired = useSandboxExpired(fragment?.createdAt ?? null);

  if (!fragment) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-background">
        <PreviewToolbar>
          {leading}
          {isBuilding ? (
            <AddressBarPlaceholder label="starting the sandbox…" />
          ) : null}
        </PreviewToolbar>

        {/* Same grid language as the marketing pages, centred on the frame, so
            an idle pane reads as a prepared surface rather than a void. */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 75%)",
            }}
          />

          <BrowserFrame isBuilding={isBuilding}>
            {isBuilding ? (
              <>
                <Spinner className="size-5 text-muted-foreground" />
                <p className="text-sm font-medium">Building your app</p>
                <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                  The agent is writing files in a sandbox. The preview loads
                  here the moment it serves a page — follow along in the chat.
                </p>
              </>
            ) : (
              <>
                <Logo className="size-7 opacity-40" />
                <p className="text-sm font-medium">No preview yet</p>
                <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
                  Describe what you want to build in the chat. Zivo runs it in a
                  live sandbox and renders it right here.
                </p>
              </>
            )}
          </BrowserFrame>
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
      <div className="flex h-full min-h-0 flex-col bg-background">
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
    <div className="flex h-full min-h-0 flex-col bg-background">
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

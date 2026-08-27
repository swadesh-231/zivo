"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The landing page's one job is to show what comes out, so this is a miniature
 * of the real deliverable: the overview canvas, at the scale the product shows
 * it. It used to render a desktop dashboard, which advertised a different
 * product entirely.
 */

/** Fixed rather than themed — this is a designed app, not the site's chrome. */
const ACCENT = "oklch(0.62 0.16 62)";

/**
 * Mixed with the accent rather than pinned to a light value: the mini phone
 * follows the site's scheme, and a fixed pale fill read as a hole punched in
 * the screen once the frame went dark.
 */
const ACCENT_WEAK = `color-mix(in oklch, ${ACCENT} 16%, transparent)`;

const SCREENS = [
  {
    id: "today",
    label: "Today",
    title: "Today",
    kind: "summary" as const,
  },
  {
    id: "history",
    label: "History",
    title: "History",
    kind: "list" as const,
  },
  {
    id: "settings",
    label: "Settings",
    title: "Settings",
    kind: "grouped" as const,
  },
];

const ROWS = [
  { time: "07:42", label: "Walk to the station", value: "14m" },
  { time: "09:15", label: "Coffee on the step", value: "9m" },
  { time: "12:30", label: "Lunch in the park", value: "41m" },
  { time: "17:04", label: "Bins out", value: "3m" },
];

const GROUPS = [
  { caption: "Daily goal", rows: ["Target", "Location"] },
  { caption: "Reminders", rows: ["Nudge at midday", "Golden hour"] },
];

function StatusBar() {
  return (
    <div className="flex h-3 shrink-0 items-center justify-between px-2">
      <span className="text-[3.5px] font-semibold">9:41</span>
      <div className="flex items-center gap-[1.5px]">
        <span className="h-[3px] w-[4px] rounded-[0.5px] bg-current opacity-70" />
        <span className="h-[3px] w-[3px] rounded-full bg-current opacity-70" />
        <span className="h-[3px] w-[5px] rounded-[1px] border border-current opacity-70" />
      </div>
    </div>
  );
}

function TabBar({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="mt-auto flex shrink-0 items-center gap-1 border-t border-black/[0.07] px-2 pt-1.5 pb-1 dark:border-white/10">
      {[0, 1, 2, 3].map((tab) => (
        <div key={tab} className="flex flex-1 flex-col items-center gap-[2px]">
          <span
            className="size-[5px] rounded-[1px]"
            style={{
              background: tab === activeIndex ? ACCENT : "currentColor",
              opacity: tab === activeIndex ? 1 : 0.28,
            }}
          />
          <span
            className="h-[2px] w-[7px] rounded-full"
            style={{
              background: tab === activeIndex ? ACCENT : "currentColor",
              opacity: tab === activeIndex ? 1 : 0.22,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ScreenBody({ kind }: { kind: "summary" | "list" | "grouped" }) {
  if (kind === "summary") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-2.5">
        <div className="relative mx-auto mt-1.5 size-[42px]">
          <svg viewBox="0 0 40 40" className="size-full -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              strokeWidth="4"
              stroke="currentColor"
              opacity="0.1"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              stroke={ACCENT}
              strokeDasharray="66 100"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold tabular-nums">
            78
          </span>
        </div>

        <div className="mt-2 flex rounded-[3px] border border-black/[0.07] dark:border-white/10">
          {["06:58", "19:24", "48.2k"].map((stat, index) => (
            <div
              key={stat}
              className={cn(
                "flex-1 py-1 text-center",
                index > 0 && "border-l border-black/[0.07] dark:border-white/10",
              )}
            >
              <p className="text-[4px] font-semibold tabular-nums">{stat}</p>
              <p className="mt-[1px] text-[3px] opacity-45">Label</p>
            </div>
          ))}
        </div>

        <div className="mt-2 space-y-[3px]">
          {ROWS.slice(0, 3).map((row) => (
            <div key={row.time} className="flex items-center gap-1.5">
              <span className="text-[3.5px] tabular-nums opacity-45">
                {row.time}
              </span>
              <span className="h-[3px] flex-1 rounded-full bg-current opacity-[0.13]" />
              <span className="text-[3.5px] font-semibold tabular-nums">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "list") {
    return (
      <div className="min-h-0 flex-1 space-y-[5px] px-2.5">
        {ROWS.map((row) => (
          <div
            key={row.time}
            className="flex items-center gap-1.5 border-b border-black/[0.06] pb-[5px] dark:border-white/[0.08]"
          >
            <span className="text-[3.5px] tabular-nums opacity-45">
              {row.time}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[4px]">{row.label}</span>
              <span className="mt-[1px] block h-[2px] w-2/3 rounded-full bg-current opacity-[0.12]" />
            </span>
            <span className="text-[3.5px] font-semibold tabular-nums">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 px-2.5">
      <div
        className="flex items-center gap-1.5 rounded-[3px] p-1.5"
        style={{ background: ACCENT_WEAK }}
      >
        <span
          className="flex size-[13px] items-center justify-center rounded-full text-[4px] font-bold"
          style={{ background: ACCENT, color: "white" }}
        >
          RM
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[4px] font-semibold">Rosa Meyer</span>
          <span className="mt-[1px] block h-[2px] w-1/2 rounded-full bg-current opacity-20" />
        </span>
      </div>

      {GROUPS.map((group) => (
        <div key={group.caption} className="mt-2">
          <p className="mb-[3px] text-[3px] tracking-wide uppercase opacity-40">
            {group.caption}
          </p>
          <div className="overflow-hidden rounded-[3px] border border-black/[0.07] dark:border-white/10">
            {group.rows.map((row, index) => (
              <div
                key={row}
                className={cn(
                  "flex items-center justify-between px-1.5 py-[5px]",
                  index > 0 && "border-t border-black/[0.06] dark:border-white/[0.08]",
                )}
              >
                <span className="text-[4px]">{row}</span>
                <span className="h-[2px] w-[10px] rounded-full bg-current opacity-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniPhone({
  screen,
  activeIndex,
}: {
  screen: (typeof SCREENS)[number];
  activeIndex: number;
}) {
  return (
    <div className="w-[86px] shrink-0 sm:w-[104px]">
      <div className="rounded-[11px] bg-[oklch(0.19_0.004_285)] p-[3px] shadow-lg shadow-black/15">
        <div className="relative flex aspect-[393/852] flex-col overflow-hidden rounded-[9px] bg-white text-black dark:bg-[oklch(0.16_0.008_62)] dark:text-white">
          <span
            aria-hidden
            className="absolute top-[4px] left-1/2 z-10 h-[6px] w-[24px] -translate-x-1/2 rounded-full bg-[oklch(0.14_0.004_285)]"
          />
          <StatusBar />
          <p className="shrink-0 px-2.5 pt-1 pb-1.5 text-[7px] font-bold tracking-tight">
            {screen.title}
          </p>
          <ScreenBody kind={screen.kind} />
          <TabBar activeIndex={activeIndex} />
        </div>
      </div>

      <p className="mt-2 text-center text-[10px] font-medium text-muted-foreground">
        <span className="mr-1 tabular-nums opacity-40">
          0{activeIndex + 1}
        </span>
        {screen.label}
      </p>
    </div>
  );
}

function BrowserChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/70 shadow-2xl shadow-black/5 backdrop-blur-sm dark:shadow-black/40">
      <div className="flex items-center gap-3 border-b border-border/60 px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="flex-1 truncate rounded-md bg-muted/60 px-2.5 py-1 text-center font-mono text-[11px] text-muted-foreground">
          3000-swift-lagoon.e2b.app
        </div>
      </div>
      {children}
    </div>
  );
}

function MockCanvas() {
  return (
    <div className="relative flex min-h-[22rem] flex-col items-center justify-center overflow-hidden bg-background px-5 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          color: "var(--color-border)",
        }}
      />

      <div className="relative text-center">
        <span
          className="mx-auto mb-2 block size-1.5 rounded-full"
          style={{ background: ACCENT }}
        />
        <p className="text-sm font-semibold tracking-tight">Lumen</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Track how much daylight you actually get
        </p>
      </div>

      <div className="relative mt-6 flex items-start justify-center gap-4 sm:gap-6">
        {SCREENS.map((screen, index) => (
          <MiniPhone key={screen.id} screen={screen} activeIndex={index} />
        ))}
      </div>
    </div>
  );
}

const SNIPPET = [
  { text: "export function", tone: "keyword" },
  { text: " TodayScreen", tone: "fn" },
  { text: "() {", tone: "plain" },
  { text: "\n  return (", tone: "plain" },
  { text: "\n    <Screen>", tone: "tag" },
  { text: "\n      <NavBar title=", tone: "tag" },
  { text: '"Today"', tone: "string" },
  { text: " large />", tone: "tag" },
  { text: "\n      <ScreenBody className=", tone: "tag" },
  { text: '"px-5 pb-8"', tone: "string" },
  { text: ">", tone: "tag" },
  { text: "\n        <DaylightRing value={78} goal={120} />", tone: "plain" },
  { text: "\n        <SessionList sessions={SESSIONS} />", tone: "plain" },
  { text: "\n      </ScreenBody>", tone: "tag" },
  { text: "\n      <TabBar items={TABS} />", tone: "tag" },
  { text: "\n    </Screen>", tone: "tag" },
  { text: "\n  )", tone: "plain" },
  { text: "\n}", tone: "plain" },
];

const TONE_CLASS: Record<string, string> = {
  keyword: "text-violet-500 dark:text-violet-400",
  fn: "text-sky-600 dark:text-sky-400",
  string: "text-emerald-600 dark:text-emerald-400",
  tag: "text-foreground/70",
  plain: "text-muted-foreground",
};

const FILES = [
  "design/app-meta.ts",
  "design/screens.ts",
  "app/screens/today.tsx",
  "app/screens/history.tsx",
  "app/screens/settings.tsx",
];

function MockCode() {
  return (
    <div className="flex min-h-[22rem] bg-background text-[11px]">
      <div className="hidden w-52 shrink-0 flex-col gap-0.5 border-r border-border/60 p-3 sm:flex">
        {FILES.map((file, index) => (
          <div
            key={file}
            className={cn(
              "truncate rounded-md px-2 py-1.5 font-mono",
              index === 2 ? "bg-muted text-foreground" : "text-muted-foreground",
            )}
          >
            {file}
          </div>
        ))}
      </div>
      <pre className="min-w-0 flex-1 overflow-x-auto p-4 font-mono leading-relaxed">
        <code>
          {SNIPPET.map((token, index) => (
            <span key={index} className={TONE_CLASS[token.tone]}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function PreviewShowcase() {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-24">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Showcase view"
          className="inline-flex rounded-lg border border-border/70 bg-card/50 p-0.5"
        >
          {(["preview", "code"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                tab === value
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value === "preview" ? "Design" : "Source"}
            </button>
          ))}
        </div>

        <p className="hidden text-xs text-muted-foreground sm:block">
          Six screens, one direction, every file yours
        </p>
      </div>

      <BrowserChrome>{tab === "preview" ? <MockCanvas /> : <MockCode />}</BrowserChrome>
    </section>
  );
}

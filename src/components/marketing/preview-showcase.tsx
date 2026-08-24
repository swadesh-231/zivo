"use client";

import { useState } from "react";
import { Check, Circle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const FILES = [
  "app/page.tsx",
  "app/components/stat-card.tsx",
  "app/components/revenue-chart.tsx",
  "app/components/orders-table.tsx",
  "lib/data.ts",
];

const SNIPPET = [
  { text: "export function", tone: "keyword" },
  { text: " StatCard", tone: "fn" },
  { text: "({ label, value, delta }: StatCardProps) {", tone: "plain" },
  { text: "\n  return (", tone: "plain" },
  { text: "\n    <div className=", tone: "plain" },
  { text: '"rounded-xl border p-4"', tone: "string" },
  { text: ">", tone: "plain" },
  { text: "\n      <p className=", tone: "plain" },
  { text: '"text-xs text-muted-foreground"', tone: "string" },
  { text: ">{label}</p>", tone: "plain" },
  { text: "\n      <p className=", tone: "plain" },
  { text: '"mt-2 text-2xl font-semibold"', tone: "string" },
  { text: ">{value}</p>", tone: "plain" },
  { text: "\n      <Delta value={delta} />", tone: "plain" },
  { text: "\n    </div>", tone: "plain" },
  { text: "\n  )", tone: "plain" },
  { text: "\n}", tone: "plain" },
];

const TONE_CLASS: Record<string, string> = {
  keyword: "text-violet-500 dark:text-violet-400",
  fn: "text-sky-600 dark:text-sky-400",
  string: "text-emerald-600 dark:text-emerald-400",
  plain: "text-muted-foreground",
};

const BARS = [42, 58, 35, 71, 64, 88, 76, 95, 61, 83, 70, 100];

const ROWS = [
  { id: "#4021", customer: "Ada Ellis", total: "$248.00", state: "Paid" },
  { id: "#4020", customer: "Miles Okafor", total: "$96.00", state: "Refunded" },
  { id: "#4019", customer: "Rin Takeda", total: "$1,204.00", state: "Paid" },
];

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

function MockApp() {
  return (
    <div className="flex min-h-[22rem] bg-background text-[11px]">
      <aside className="hidden w-40 shrink-0 flex-col gap-1 border-r border-border/60 p-3 sm:flex">
        <div className="mb-3 h-2 w-16 rounded-full bg-foreground/80" />
        {["Overview", "Orders", "Customers", "Payouts", "Settings"].map(
          (item, index) => (
            <div
              key={item}
              className={cn(
                "rounded-md px-2 py-1.5",
                index === 0
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item}
            </div>
          ),
        )}
      </aside>

      <div className="min-w-0 flex-1 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Overview</p>
            <p className="text-muted-foreground">Last 30 days</p>
          </div>
          <div className="rounded-md border border-border/70 px-2 py-1 text-muted-foreground">
            Export
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Revenue", value: "$48,210", delta: "+12.4%" },
            { label: "Orders", value: "1,284", delta: "+3.1%" },
            { label: "Refunds", value: "$1,940", delta: "-0.8%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/60 p-2.5"
            >
              <p className="text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-sm font-semibold">{stat.value}</p>
              <p className="text-muted-foreground">{stat.delta}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-border/60 p-3">
          <div className="flex h-24 items-end gap-1.5">
            {BARS.map((height, index) => (
              <div
                key={index}
                style={{ height: `${height}%` }}
                className="flex-1 rounded-sm bg-foreground/75"
              />
            ))}
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
          {ROWS.map((row, index) => (
            <div
              key={row.id}
              className={cn(
                "flex items-center justify-between px-3 py-2",
                index > 0 && "border-t border-border/60",
              )}
            >
              <span className="font-mono text-muted-foreground">{row.id}</span>
              <span className="truncate">{row.customer}</span>
              <span className="tabular-nums">{row.total}</span>
              <span className="text-muted-foreground">{row.state}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockCode() {
  return (
    <div className="flex min-h-[22rem] bg-background text-[11px]">
      <div className="hidden w-52 shrink-0 flex-col gap-0.5 border-r border-border/60 p-3 sm:flex">
        {FILES.map((file, index) => (
          <div
            key={file}
            className={cn(
              "truncate rounded-md px-2 py-1.5 font-mono",
              index === 1
                ? "bg-muted text-foreground"
                : "text-muted-foreground",
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

const STEPS = [
  { label: "Read the prompt", state: "done" },
  { label: "Install dependencies", state: "done" },
  { label: "Write 5 files", state: "running" },
  { label: "Boot the preview", state: "pending" },
];

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
              {value}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          {STEPS.map((step) => (
            <span
              key={step.label}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              {step.state === "done" ? (
                <Check className="size-3 text-emerald-500" />
              ) : step.state === "running" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Circle className="size-3 opacity-40" />
              )}
              {step.label}
            </span>
          ))}
        </div>
      </div>

      <BrowserChrome>
        {tab === "preview" ? <MockApp /> : <MockCode />}
      </BrowserChrome>
    </section>
  );
}

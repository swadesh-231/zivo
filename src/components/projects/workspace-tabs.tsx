"use client";

import { Code2, MonitorPlay } from "lucide-react";

import { cn } from "@/lib/utils";

export type WorkspacePane = "preview" | "code";

const PANES = [
  { value: "code", label: "Code", icon: Code2 },
  { value: "preview", label: "Preview", icon: MonitorPlay },
] as const;

/**
 * Segmented switch between the running preview and the generated source.
 *
 * Rendered inside whichever panel is showing, so the two never fight for width
 * and each gets the full pane.
 */
export function WorkspaceTabs({
  value,
  onChange,
}: {
  value: WorkspacePane;
  onChange: (pane: WorkspacePane) => void;
}) {
  return (
    <div className="flex shrink-0 items-center rounded-lg bg-muted/60 p-0.5">
      {PANES.map((pane) => (
        <button
          key={pane.value}
          type="button"
          onClick={() => onChange(pane.value)}
          aria-pressed={value === pane.value}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === pane.value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <pane.icon className="size-3.5" />
          {pane.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

function splitPath(path: string) {
  const parts = path.split("/");
  const name = parts.pop() ?? path;

  return { dir: parts.join("/"), name };
}

export function CodeViewer({ files }: { files: Record<string, string> }) {
  const paths = useMemo(() => Object.keys(files).sort(), [files]);
  const [selected, setSelected] = useState<string | null>(paths[0] ?? null);
  const [copied, setCopied] = useState(false);

  const activePath = selected && files[selected] ? selected : (paths[0] ?? null);
  const content = activePath ? files[activePath] : "";
  const lines = useMemo(() => content.split("\n"), [content]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (paths.length === 0) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileCode2 />
          </EmptyMedia>
          <EmptyTitle>No files yet</EmptyTitle>
          <EmptyDescription>
            The generated source appears here once a build finishes.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
      <div className="scrollbar-thin hidden min-h-0 overflow-y-auto border-r border-border/60 p-2 md:block">
        {paths.map((path) => {
          const { dir, name } = splitPath(path);
          const isActive = path === activePath;

          return (
            <button
              key={path}
              type="button"
              onClick={() => setSelected(path)}
              className={cn(
                "block w-full truncate rounded-md px-2 py-1.5 text-left font-mono text-xs transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
              title={path}
            >
              {dir ? <span className="opacity-60">{dir}/</span> : null}
              {name}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
          <span className="truncate font-mono text-xs text-muted-foreground">
            {activePath}
          </span>
          <Button variant="ghost" size="icon-xs" onClick={() => void copy()} aria-label="Copy file">
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 font-mono text-xs">
            <tbody>
              {lines.map((line, index) => (
                <tr key={index}>
                  <td className="w-10 shrink-0 select-none border-r border-border/50 bg-muted/20 px-2 py-px text-right align-top text-muted-foreground/60">
                    {index + 1}
                  </td>
                  <td className="px-3 py-px whitespace-pre">{line || " "}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border/60 px-3 py-1.5 md:hidden">
          <select
            value={activePath ?? ""}
            onChange={(event) => setSelected(event.target.value)}
            aria-label="Select file"
            className="w-full bg-transparent font-mono text-xs text-muted-foreground outline-none"
          >
            {paths.map((path) => (
              <option key={path} value={path}>
                {path}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { TOKEN_CLASS, tokenizeLines } from "@/components/projects/syntax";
import { cn } from "@/lib/utils";

function splitPath(path: string) {
  const parts = path.split("/");
  const name = parts.pop() ?? path;

  return { dir: parts.join("/"), name };
}

/** Groups files under their directory, root files first, each group sorted. */
function groupByDirectory(paths: string[]) {
  const groups = new Map<string, string[]>();

  for (const path of paths) {
    const { dir } = splitPath(path);
    const existing = groups.get(dir);

    if (existing) {
      existing.push(path);
    } else {
      groups.set(dir, [path]);
    }
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function CodeViewer({
  files,
  leading,
}: {
  files: Record<string, string>;
  leading?: React.ReactNode;
}) {
  const paths = useMemo(() => Object.keys(files).sort(), [files]);
  const groups = useMemo(() => groupByDirectory(paths), [paths]);
  const [selected, setSelected] = useState<string | null>(paths[0] ?? null);
  const [copied, setCopied] = useState(false);

  // Test for the key, not the value: a file whose contents are an empty string
  // is still a real, selectable file.
  const activePath =
    selected !== null && Object.hasOwn(files, selected)
      ? selected
      : (paths[0] ?? null);
  const content = activePath ? files[activePath] : "";
  const lines = useMemo(() => tokenizeLines(content), [content]);

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
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-12 shrink-0 items-center border-b border-border/60 px-3">
          {leading}
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <Logo className="size-12 opacity-15" />
          <p className="text-sm text-muted-foreground">
            Generated source will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="scrollbar-thin flex w-44 shrink-0 flex-col overflow-y-auto border-r border-border/60">
        <div className="sticky top-0 z-10 flex h-12 shrink-0 items-center bg-background px-3 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {paths.length} {paths.length === 1 ? "file" : "files"}
        </div>

        <div className="flex flex-col gap-3 px-2 pb-3">
          {groups.map(([dir, groupPaths]) => (
            <div key={dir || "/"}>
              <p className="truncate px-2 pb-1 font-mono text-[10px] tracking-wide text-muted-foreground/50">
                {dir || "root"}
              </p>

              {groupPaths.map((path) => {
                const { name } = splitPath(path);
                const isActive = path === activePath;

                return (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setSelected(path)}
                    aria-current={isActive ? "true" : undefined}
                    title={path}
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left font-mono text-xs transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <FileCode2 className="size-3 shrink-0 opacity-50" />
                    <span className="truncate">{name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border/60 px-3">
          {leading}

          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
            {activePath}
          </span>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => void copy()}
            aria-label="Copy file contents"
          >
            {copied ? <Check className="text-emerald-500" /> : <Copy />}
          </Button>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-auto">
          <table className="w-full border-separate border-spacing-0 font-mono text-xs">
            <tbody>
              {lines.map((line, index) => (
                <tr key={index} className="group/line">
                  <td className="sticky left-0 w-11 shrink-0 border-r border-border/40 bg-background px-2 py-px text-right align-top text-muted-foreground/40 select-none group-hover/line:text-muted-foreground/70">
                    {index + 1}
                  </td>
                  <td className="px-3 py-px whitespace-pre">
                    {line.length === 0
                      ? " "
                      : line.map((token, tokenIndex) => (
                          <span
                            key={tokenIndex}
                            className={TOKEN_CLASS[token.kind]}
                          >
                            {token.text}
                          </span>
                        ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

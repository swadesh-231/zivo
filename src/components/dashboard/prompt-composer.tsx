"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  CalendarDays,
  ChartLine,
  Newspaper,
  SquareKanban,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { MAX_PROMPT_LENGTH } from "@/features/inngest/constants";
import { useCreateProject } from "@/features/projects/hooks/projects";
import { cn } from "@/lib/utils";

/**
 * Ragged pills wrapping over two rows read as an accident. A fixed grid of
 * equal tiles gives the row a shape, and the short label carries the scan while
 * the full sentence goes into the composer.
 */
const SUGGESTIONS = [
  {
    icon: SquareKanban,
    label: "Project tracker",
    prompt: "A project tracker with a board view and filters",
  },
  {
    icon: ChartLine,
    label: "Finance dashboard",
    prompt: "A finance dashboard with charts and a transactions table",
  },
  {
    icon: Newspaper,
    label: "Blog",
    prompt: "A blog with a post list, tags, and a reading view",
  },
  {
    icon: CalendarDays,
    label: "Booking form",
    prompt: "A booking form with a date picker and confirmation",
  },
] as const;

/** Only worth showing once the limit is actually in reach. */
const COUNTER_THRESHOLD = MAX_PROMPT_LENGTH - 500;

const PROMPT_INPUT_ID = "dashboard-prompt";

export function PromptComposer({
  initialPrompt = "",
}: {
  initialPrompt?: string;
}) {
  const router = useRouter();
  const createProject = useCreateProject();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(initialPrompt);

  const isPending = createProject.isPending;
  const trimmed = value.trim();
  const isOverLimit = value.length > MAX_PROMPT_LENGTH;
  const canSubmit = Boolean(trimmed) && !isPending && !isOverLimit;

  const submit = async () => {
    if (!canSubmit) return;

    setValue("");

    try {
      const project = await createProject.mutateAsync(trimmed);
      router.push(`/projects/${project.id}`);
    } catch (error) {
      setValue(trimmed);
      toast.add({
        type: "error",
        title: "Could not start the build",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const applySuggestion = (prompt: string) => {
    setValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "rounded-2xl border border-border/70 bg-card/60 shadow-sm backdrop-blur-sm transition-colors",
          "focus-within:border-foreground/25 focus-within:bg-card",
          isOverLimit && "border-destructive/50",
        )}
      >
        <Textarea
          ref={inputRef}
          id={PROMPT_INPUT_ID}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          disabled={isPending}
          autoFocus
          placeholder="Describe the app you want to build…"
          aria-label="Describe the app you want to build"
          // field-sizing grows the box with the text, so it starts at two lines
          // instead of holding open an empty third one.
          className="max-h-64 min-h-12 resize-none border-0 bg-transparent px-4 pt-3.5 pb-0 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-3 pl-4">
          <span className="text-[11px] text-muted-foreground/70">
            {isOverLimit ? (
              <span className="text-destructive">
                {value.length.toLocaleString()} /{" "}
                {MAX_PROMPT_LENGTH.toLocaleString()} characters
              </span>
            ) : value.length > COUNTER_THRESHOLD ? (
              `${value.length.toLocaleString()} / ${MAX_PROMPT_LENGTH.toLocaleString()}`
            ) : (
              <>
                <kbd className="font-sans font-medium">Enter</kbd> to build ·{" "}
                <kbd className="font-sans font-medium">Shift</kbd> +{" "}
                <kbd className="font-sans font-medium">Enter</kbd> for a new line
              </>
            )}
          </span>

          <Button
            size="icon"
            onClick={() => void submit()}
            disabled={!canSubmit}
            aria-label="Start building"
            className="size-8 shrink-0 rounded-full"
          >
            {isPending ? <Spinner /> : <ArrowUp />}
          </Button>
        </div>
      </div>

      {isPending ? (
        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-3.5" />
          <span className="shimmer-text">
            Spinning up a sandbox and briefing the agents…
          </span>
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
            <button
              key={label}
              type="button"
              onClick={() => applySuggestion(prompt)}
              title={prompt}
              className="group flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-card"
            >
              <Icon className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              <span className="truncate text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

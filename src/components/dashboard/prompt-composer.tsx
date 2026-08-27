"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { MAX_PROMPT_LENGTH } from "@/features/inngest/constants";
import { useCreateProject } from "@/features/projects/hooks/projects";
import { cn } from "@/lib/utils";

/**
 * Deliberately uneven.
 *
 * Two are a bare name, two name a product, two name a look. The field takes all
 * three and the examples have to say so — a row of matching sentences teaches
 * people that a full spec is required, and a row of bare words teaches them that
 * describing the look is not allowed. Both are wrong.
 */
const SUGGESTIONS = [
  { label: "Lumen", prompt: "Lumen" },
  {
    label: "A sleep tracker, dark and calm",
    prompt: "A sleep tracker. Dark, calm, one glowing accent, lots of space.",
  },
  {
    label: "Split — editorial, serif",
    prompt:
      "Split, an app for settling shared bills. Editorial feel, serif titles, monochrome with one ink accent.",
  },
  { label: "Fieldnote", prompt: "Fieldnote" },
  {
    label: "A trading app, dense and precise",
    prompt:
      "A trading app. Dense, precise, tabular numbers everywhere, near-black on white.",
  },
  {
    label: "A plant care app, warm and soft",
    prompt: "A plant care app. Warm, soft, rounded, gentle.",
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
          placeholder="Describe the app and the design you want…"
          aria-label="Describe the app and the design you want"
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
                <kbd className="font-sans font-medium">Enter</kbd> to design · a
                name alone works, a look you want works better
              </>
            )}
          </span>

          <Button
            size="icon"
            onClick={() => void submit()}
            disabled={!canSubmit}
            aria-label="Start designing"
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
            Scoping the product and designing the screens…
          </span>
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground/70">Try</span>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => applySuggestion(suggestion.prompt)}
              title={suggestion.prompt}
              className="rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

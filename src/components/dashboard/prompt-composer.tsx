"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateProject } from "@/features/projects/hooks/projects";

const SUGGESTIONS = [
  "A project tracker with a board view and filters",
  "A finance dashboard with charts and a transactions table",
  "A blog with a post list, tags, and a reading view",
  "A booking form with a date picker and confirmation",
];

export function PromptComposer({
  initialPrompt = "",
}: {
  initialPrompt?: string;
}) {
  const router = useRouter();
  const createProject = useCreateProject();
  const [value, setValue] = useState(initialPrompt);

  const isPending = createProject.isPending;
  const canSubmit = Boolean(value.trim()) && !isPending;

  const submit = async () => {
    if (!canSubmit) return;

    const prompt = value.trim();
    setValue("");

    try {
      const project = await createProject.mutateAsync(prompt);
      router.push(`/projects/${project.id}`);
    } catch (error) {
      setValue(prompt);
      toast.add({
        type: "error",
        title: "Could not start the build",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border/70 bg-card/60 shadow-sm backdrop-blur-sm transition-colors focus-within:border-foreground/25 focus-within:bg-card">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          rows={3}
          disabled={isPending}
          autoFocus
          placeholder="Describe the app you want to build…"
          aria-label="Describe the app you want to build"
          className="min-h-24 resize-none border-0 bg-transparent p-4 text-[15px] shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <div className="flex items-center justify-between gap-3 px-4 pb-3">
          <span className="text-[11px] text-muted-foreground/60">
            Enter to build · Shift + Enter for a new line
          </span>

          <Button
            size="icon"
            onClick={() => void submit()}
            disabled={!canSubmit}
            aria-label="Start building"
            className="rounded-full"
          >
            {isPending ? <Spinner /> : <ArrowUp />}
          </Button>
        </div>
      </div>

      {isPending ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-3.5" />
          <span className="shimmer-text">
            Spinning up a sandbox and briefing the agents…
          </span>
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setValue(suggestion)}
              className="rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:-translate-y-px hover:border-border hover:bg-card hover:text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

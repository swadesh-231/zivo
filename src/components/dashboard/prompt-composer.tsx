"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Sparkles } from "lucide-react";

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
      <div className="relative rounded-2xl border border-border/70 bg-card/60 shadow-xs transition-colors focus-within:border-foreground/25">
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
          className="min-h-28 resize-none border-0 bg-transparent p-4 pr-14 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <Button
          size="icon"
          onClick={() => void submit()}
          disabled={!canSubmit}
          aria-label="Start building"
          className="absolute right-3 bottom-3"
        >
          {isPending ? <Spinner /> : <ArrowUp />}
        </Button>
      </div>

      {isPending ? (
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-3.5" />
          Spinning up a sandbox and briefing the agents…
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setValue(suggestion)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              <Sparkles className="size-3" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

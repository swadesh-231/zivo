"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateMessage } from "@/features/messages/hooks/messages";
import { cn } from "@/lib/utils";

export function MessageComposer({
  projectId,
  disabled,
}: {
  projectId: string;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const createMessage = useCreateMessage(projectId);

  const isPending = createMessage.isPending;
  const canSubmit = Boolean(value.trim()) && !isPending && !disabled;

  const submit = async () => {
    if (!canSubmit) return;

    const prompt = value.trim();
    setValue("");

    try {
      await createMessage.mutateAsync(prompt);
    } catch (error) {
      setValue(prompt);
      toast.add({
        type: "error",
        title: "Could not send that",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <div className="shrink-0 border-t border-border/60 p-3">
      <div
        // While a build is running the field cannot take input, so the whole
        // composer recedes rather than inviting a click that does nothing.
        className={cn(
          "rounded-2xl border bg-elevated/60 transition-all",
          disabled
            ? "border-border/50 opacity-60"
            : "border-border/70 focus-within:border-foreground/25 focus-within:bg-elevated focus-within:ring-[3px] focus-within:ring-foreground/10",
        )}
      >
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          disabled={disabled}
          placeholder={
            disabled ? "Waiting for the current build…" : "Ask for a change…"
          }
          aria-label="Ask for a change"
          // Same as the dashboard composer: let field-sizing grow the box
          // rather than holding an empty second line open.
          className="max-h-48 min-h-10 resize-none border-0 bg-transparent px-3 pt-2.5 pb-0 text-[13px] leading-relaxed shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <div className="flex items-center justify-between gap-2 px-2.5 pt-1.5 pb-2 pl-3">
          <span className="truncate text-[11px] text-muted-foreground/70">
            <kbd className="font-sans font-medium">Enter</kbd> to send ·{" "}
            <kbd className="font-sans font-medium">Shift</kbd> +{" "}
            <kbd className="font-sans font-medium">Enter</kbd> for a new line
          </span>

          <Button
            size="icon-sm"
            onClick={() => void submit()}
            disabled={!canSubmit}
            aria-label="Send message"
            className="rounded-full"
          >
            {isPending ? <Spinner /> : <ArrowUp />}
          </Button>
        </div>
      </div>
    </div>
  );
}

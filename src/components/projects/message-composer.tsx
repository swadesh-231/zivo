"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useCreateMessage } from "@/features/messages/hooks/messages";

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
      <div className="rounded-2xl border border-border/70 bg-card/50 transition-colors focus-within:border-foreground/25 focus-within:bg-card">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          rows={2}
          disabled={disabled}
          placeholder={
            disabled ? "Waiting for the current build…" : "Ask for a change…"
          }
          aria-label="Ask for a change"
          className="min-h-14 resize-none border-0 bg-transparent p-3 text-[13px] shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <div className="flex items-center justify-between gap-2 px-3 pb-2.5">
          <span className="text-[11px] text-muted-foreground/60">
            Enter to send · Shift + Enter for a new line
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

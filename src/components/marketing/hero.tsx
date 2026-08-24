"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SIGN_IN_PATH } from "@/lib/auth-config";
import { withPrompt } from "@/lib/prompt-handoff";

const EXAMPLES = [
  "An analytics dashboard with filters and a revenue chart",
  "A Kanban board with drag-and-drop columns",
  "A pricing page for a developer tool",
  "A recipe app with search and saved favourites",
];

export function Hero() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const start = (prompt: string) => {
    router.push(withPrompt(SIGN_IN_PATH, prompt));
  };

  return (
    <section className="mx-auto w-full max-w-3xl px-5 pt-20 pb-16 text-center sm:pt-28">
      <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Agents build in a live sandbox
      </p>

      <h1 className="text-balance-pretty text-4xl font-medium tracking-tight sm:text-6xl">
        Describe the interface.
        <span className="block text-muted-foreground">Get the app.</span>
      </h1>

      <p className="text-balance-pretty mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Zivo hands your prompt to a team of coding agents. They scaffold the
        pages, install the packages, and hand back a live URL and every file
        they wrote.
      </p>

      <div className="mt-10 text-left">
        <div className="relative rounded-2xl border border-border/70 bg-card/60 shadow-xs backdrop-blur-sm transition-colors focus-within:border-foreground/25">
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                start(value);
              }
            }}
            rows={3}
            placeholder="Build a customer support inbox with a message list, filters, and a reply composer…"
            aria-label="Describe the app you want to build"
            className="min-h-28 resize-none border-0 bg-transparent p-4 pr-14 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Button
            size="icon"
            className="absolute right-3 bottom-3"
            aria-label="Start building"
            onClick={() => start(value)}
          >
            <ArrowUp />
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => start(example)}
              className="rounded-full border border-border/70 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

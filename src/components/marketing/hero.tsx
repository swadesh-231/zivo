"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SIGN_IN_PATH } from "@/lib/auth-config";
import { withPrompt } from "@/prompt/handoff";

/** A bare name, and three that describe a look — the field takes both. */
const EXAMPLES = [
  "Lumen",
  "A sleep tracker, dark and calm",
  "A trading app, dense and precise",
  "A recipe app, editorial with serif titles",
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
        Eight design directions, six screens
      </p>

      <h1 className="text-balance-pretty text-4xl font-medium tracking-tight sm:text-6xl">
        Describe the app.
        <span className="block text-muted-foreground">Get the design.</span>
      </h1>

      <p className="text-balance-pretty mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
Zivo commits to a design direction — editorial, precision, nocturne — then
        designs six mobile screens in it, on a palette derived from one hue. Tap
        through them in the browser, then take the whole thing away as code.
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
            rows={2}
            placeholder="A sleep tracker. Dark, calm, one glowing accent."
            aria-label="Name your app"
            className="min-h-28 resize-none border-0 bg-transparent p-4 pr-14 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Button
            size="icon"
            className="absolute right-3 bottom-3"
            aria-label="Start designing"
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

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SIGN_IN_PATH } from "@/lib/auth-config";

export function CallToAction() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 px-6 py-14 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-foreground/[0.06] blur-3xl"
        />
        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
          Your first build takes about two minutes
        </h2>
        <p className="text-balance-pretty mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Sign in with Google or GitHub, describe a screen, and watch the agents
          work.
        </p>
        <Button
          size="lg"
          className="mt-7"
          nativeButton={false}
          render={<Link href={SIGN_IN_PATH} />}
        >
          Start building
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}

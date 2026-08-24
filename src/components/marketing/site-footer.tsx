import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-4" />
          <span className="text-sm font-medium">Zivo</span>
        </Link>

        <p className="text-xs text-muted-foreground">
          Built with Next.js, Inngest agents, and E2B sandboxes.
        </p>
      </div>
    </footer>
  );
}

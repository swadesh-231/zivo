import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import { SIGN_IN_PATH } from "@/lib/auth-config";

const LINKS = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#workflow", label: "How it works" },
  { href: "#models", label: "Models" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-6 px-5">
        <Link href="/" className="flex items-center gap-2" aria-label="Zivo home">
          <Logo className="size-5" />
          <span className="text-sm font-semibold tracking-tight">Zivo</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ModeToggle />
          <Button size="sm" nativeButton={false} render={<Link href={SIGN_IN_PATH} />}>
            Sign in
          </Button>
        </div>
      </div>
    </header>
  );
}

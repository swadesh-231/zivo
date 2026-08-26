import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/app/user-menu";
import { ModeToggle } from "@/components/theme/mode-toggle";

type HeaderUser = {
  name: string;
  email: string;
  image?: string | null;
};

export function AppHeader({ user }: { user: HeaderUser }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          aria-label="Zivo projects"
        >
          <Logo className="size-5" />
          <span className="text-sm font-semibold tracking-tight">Zivo</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <ModeToggle />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}

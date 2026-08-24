import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-5 text-center">
      <Logo className="size-8" />
      <div>
        <p className="font-mono text-xs text-muted-foreground">404</p>
        <h1 className="mt-2 text-lg font-medium">This page does not exist</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          The link may be broken, or the project may have been deleted.
        </p>
      </div>
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        Back to projects
      </Button>
    </div>
  );
}

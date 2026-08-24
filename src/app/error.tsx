"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-5 text-center">
      <span className="flex size-10 items-center justify-center rounded-full border border-border/70">
        <TriangleAlert className="size-4 text-muted-foreground" />
      </span>
      <h1 className="text-lg font-medium">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page hit an unexpected error. Trying again usually clears it.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground/70">
          {error.digest}
        </p>
      ) : null}
      <Button variant="outline" onClick={reset}>
        <RotateCw data-icon="inline-start" />
        Try again
      </Button>
    </div>
  );
}

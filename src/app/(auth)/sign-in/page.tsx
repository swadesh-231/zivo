import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Logo } from "@/components/brand/logo";
import { GridBackdrop } from "@/components/marketing/grid-backdrop";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Zivo to start building apps from a prompt.",
};

export default function SignInPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-5 py-16">
      <GridBackdrop />

      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo className="size-8" />
          <h1 className="mt-6 text-2xl font-medium tracking-tight">
            Sign in to Zivo
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your projects, previews, and generated source live in one place.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-sm">
          <Suspense fallback={<Skeleton className="h-9 w-full rounded-lg" />}>
            <GoogleSignInButton />
          </Suspense>

          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
            Zivo uses Google only to identify your account. We never post on
            your behalf.
          </p>
        </div>
      </div>
    </div>
  );
}

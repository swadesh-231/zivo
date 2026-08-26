import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { SocialSignIn } from "@/components/auth/social-sign-in";
import { Logo } from "@/components/brand/logo";
import { GridBackdrop } from "@/components/marketing/grid-backdrop";
import { Skeleton } from "@/components/ui/skeleton";
import { listProviderLabels } from "@/lib/auth-config";
import { configuredSocialProviders } from "@/lib/auth-providers";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Zivo to start building apps from a prompt.",
};

export default async function SignInPage() {
  // The provider list comes from env, so it has to be read per request rather
  // than baked into a prerender at build time.
  await connection();

  const providers = configuredSocialProviders();

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
          <Suspense
            fallback={
              <div className="flex flex-col gap-2.5">
                {providers.map((provider) => (
                  <Skeleton key={provider} className="h-11 w-full rounded-lg" />
                ))}
              </div>
            }
          >
            <SocialSignIn providers={providers} />
          </Suspense>

          {providers.length > 0 ? (
            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              Zivo uses {listProviderLabels(providers)} only to identify your
              account. We never post on your behalf.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

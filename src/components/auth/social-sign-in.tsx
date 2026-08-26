"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { ProviderMark } from "@/components/auth/provider-mark";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  AFTER_SIGN_IN_PATH,
  SOCIAL_PROVIDER_LABELS,
  type SocialProvider,
} from "@/lib/auth-config";
import { signInWithProvider } from "@/lib/auth-client";
import { PROMPT_PARAM, withPrompt } from "@/prompt/handoff";

export function SocialSignIn({ providers }: { providers: SocialProvider[] }) {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<SocialProvider | null>(null);

  const requested = searchParams.get("callbackURL");
  const prompt = searchParams.get(PROMPT_PARAM) ?? "";

  // Only same-origin paths: the value arrives in the URL, so an absolute one
  // would turn sign-in into an open redirect.
  const destination =
    requested?.startsWith("/") && !requested.startsWith("//")
      ? requested
      : AFTER_SIGN_IN_PATH;

  const start = async (provider: SocialProvider) => {
    setPending(provider);

    const { error } = await signInWithProvider(
      provider,
      withPrompt(destination, prompt),
    );

    if (error) {
      setPending(null);
      toast.add({
        type: "error",
        title: "Sign in failed",
        description: error.message ?? "Try again in a moment.",
      });
    }
  };

  if (providers.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Sign-in is not configured on this deployment. Set{" "}
        <code className="font-mono text-xs">GOOGLE_CLIENT_ID</code> or{" "}
        <code className="font-mono text-xs">GITHUB_CLIENT_ID</code> and their
        matching secrets.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {providers.map((provider) => (
        <Button
          key={provider}
          size="lg"
          variant="outline"
          className="w-full"
          disabled={pending !== null}
          onClick={() => void start(provider)}
        >
          {pending === provider ? (
            <Spinner />
          ) : (
            <ProviderMark provider={provider} />
          )}
          Continue with {SOCIAL_PROVIDER_LABELS[provider]}
        </Button>
      ))}
    </div>
  );
}

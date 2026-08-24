"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { AFTER_SIGN_IN_PATH } from "@/lib/auth-config";
import { signInWithGoogle } from "@/lib/auth-client";
import { PROMPT_PARAM, withPrompt } from "@/prompt/handoff";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.93l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.27a7.2 7.2 0 0 1 0-4.54V6.64H1.28a12 12 0 0 0 0 10.72l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.18 15.23 0 12 0A12 12 0 0 0 1.28 6.64l4.01 3.09C6.23 6.86 8.88 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  const requested = searchParams.get("callbackURL");
  const prompt = searchParams.get(PROMPT_PARAM) ?? "";
  const destination =
    requested?.startsWith("/") && !requested.startsWith("//")
      ? requested
      : AFTER_SIGN_IN_PATH;

  const start = async () => {
    setIsPending(true);

    const { error } = await signInWithGoogle(withPrompt(destination, prompt));

    if (error) {
      setIsPending(false);
      toast.add({
        type: "error",
        title: "Sign in failed",
        description: error.message ?? "Try again in a moment.",
      });
    }
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="w-full"
      disabled={isPending}
      onClick={start}
    >
      {isPending ? <Spinner /> : <GoogleMark />}
      Continue with Google
    </Button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, LogOut } from "lucide-react";

import { ProviderMark } from "@/components/auth/provider-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { signOut } from "@/lib/auth-client";
import {
  listProviderLabels,
  SOCIAL_PROVIDER_LABELS,
  type SocialProvider,
} from "@/lib/auth-config";

export function AccountCard({
  email,
  emailVerified,
  createdAt,
  providers,
}: {
  email: string;
  emailVerified: boolean;
  createdAt: string;
  providers: SocialProvider[];
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    setIsPending(true);

    const { error } = await signOut();

    if (error) {
      setIsPending(false);
      toast.add({
        type: "error",
        title: "Could not sign out",
        description: error.message ?? "Try again in a moment.",
      });
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          {providers.length > 0
            ? `Zivo signs you in with ${listProviderLabels(providers)}, so your email address lives there. Change it with your provider and it updates here on your next sign-in.`
            : "Zivo signs you in with a connected provider, so your email address lives there."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-sm text-muted-foreground">Email</span>
          <span className="text-sm font-medium">{email}</span>
          {emailVerified ? (
            <Badge variant="secondary">
              <BadgeCheck data-icon="inline-start" />
              Verified
            </Badge>
          ) : null}
        </div>

        {providers.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-sm text-muted-foreground">Signed in with</span>
            {providers.map((provider) => (
              <Badge key={provider} variant="secondary">
                <ProviderMark
                  provider={provider}
                  className="size-3.5"
                  data-icon="inline-start"
                />
                {SOCIAL_PROVIDER_LABELS[provider]}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-sm text-muted-foreground">Member since</span>
          <span className="text-sm font-medium">{createdAt}</span>
        </div>

        <div>
          <Button
            variant="outline"
            onClick={() => void handleSignOut()}
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <LogOut data-icon="inline-start" />}
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

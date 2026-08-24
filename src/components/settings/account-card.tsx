"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, LogOut } from "lucide-react";

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

export function AccountCard({
  email,
  emailVerified,
  createdAt,
}: {
  email: string;
  emailVerified: boolean;
  createdAt: string;
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
          Zivo signs you in with Google, so Google owns your email address.
          Change it there and it updates here on your next sign-in.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-sm text-muted-foreground">Email</span>
          <span className="text-sm font-medium">{email}</span>
          {emailVerified ? (
            <Badge variant="secondary">
              <BadgeCheck data-icon="inline-start" />
              Verified by Google
            </Badge>
          ) : null}
        </div>

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

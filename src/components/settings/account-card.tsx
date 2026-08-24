"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

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
  createdAt,
  provider,
}: {
  createdAt: string;
  provider: string;
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
          Signed in with {provider}. Member since {createdAt}.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Button
          variant="outline"
          onClick={() => void handleSignOut()}
          disabled={isPending}
        >
          {isPending ? <Spinner /> : <LogOut data-icon="inline-start" />}
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}

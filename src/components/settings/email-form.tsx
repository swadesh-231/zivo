"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, MailWarning } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient, useSession } from "@/lib/auth-client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EmailUser = {
  email: string;
  emailVerified: boolean;
};

export function EmailForm({
  user: initialUser,
  mailConfigured,
}: {
  user: EmailUser;
  mailConfigured: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user ?? initialUser;

  const [email, setEmail] = useState(initialUser.email);
  const [isPending, setIsPending] = useState(false);

  const nextEmail = email.trim().toLowerCase();
  const changed = nextEmail !== user.email.toLowerCase();
  const isValid = EMAIL_PATTERN.test(nextEmail);

  const submit = async () => {
    if (!changed || !isValid || isPending) return;

    setIsPending(true);

    const { error } = await authClient.changeEmail({
      newEmail: nextEmail,
      callbackURL: "/settings",
    });

    setIsPending(false);

    if (error) {
      toast.add({
        type: "error",
        title: "Could not change your email",
        description: error.message ?? "Please try again.",
      });
      return;
    }

    router.refresh();

    toast.add({
      type: "success",
      title: mailConfigured ? "Check your inbox" : "Confirmation link created",
      description: mailConfigured
        ? `We sent a link to ${user.email}. Follow it to move your account to ${nextEmail}.`
        : `Email delivery is not configured, so the link to move your account to ${nextEmail} was written to the server console.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email address</CardTitle>
        <CardDescription>
          For security, the confirmation link goes to your current address. The
          change lands once you follow it.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current</span>
          <span className="text-sm font-medium">{user.email}</span>
          {user.emailVerified ? (
            <Badge variant="secondary">
              <BadgeCheck data-icon="inline-start" />
              Verified
            </Badge>
          ) : (
            <Badge variant="outline">
              <MailWarning data-icon="inline-start" />
              Unverified
            </Badge>
          )}
        </div>

        <Field>
          <FieldLabel htmlFor="account-email">New email address</FieldLabel>
          <Input
            id="account-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submit();
              }
            }}
            aria-invalid={changed && !isValid}
            className="max-w-sm"
          />
          <FieldDescription>
            You keep signing in with Google. This is where Zivo emails you.
            {mailConfigured
              ? null
              : " Email delivery is not configured, so the confirmation link is logged to the server console."}
          </FieldDescription>
        </Field>
      </CardContent>

      <CardFooter className="justify-end border-t">
        <Button
          onClick={() => void submit()}
          disabled={!changed || !isValid || isPending}
        >
          {isPending ? <Spinner /> : null}
          Send confirmation
        </Button>
      </CardFooter>
    </Card>
  );
}

import type { Metadata } from "next";

import { AccountCard } from "@/components/settings/account-card";
import { AppearanceCard } from "@/components/settings/appearance-card";
import { ProfileForm } from "@/components/settings/profile-form";
import { requireUser } from "@/features/auth/session";
import { isImageKitConfigured } from "@/lib/imagekit";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Zivo profile and appearance.",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en", {
  month: "long",
  year: "numeric",
});

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage how you appear in Zivo.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <ProfileForm
          user={{ name: user.name, email: user.email, image: user.image }}
          uploadsEnabled={isImageKitConfigured()}
        />
        <AppearanceCard />
        <AccountCard
          email={user.email}
          emailVerified={user.emailVerified}
          createdAt={DATE_FORMAT.format(new Date(user.createdAt))}
        />
      </div>
    </div>
  );
}

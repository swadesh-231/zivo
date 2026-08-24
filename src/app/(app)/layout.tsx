import { AppHeader } from "@/components/app/app-header";
import { requireUser } from "@/features/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader
        user={{ name: user.name, email: user.email, image: user.image }}
      />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

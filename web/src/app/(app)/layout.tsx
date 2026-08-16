import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace, ensureEmailMember } from "@/lib/data/workspace";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (session.email && !session.email.endsWith("@example.com")) {
    await ensureEmailMember(session);
  }
  const { workspace, meta } = await ensureDemoWorkspace();

  return (
    <AppShell
      userName={session.name}
      coupleNames={meta.coupleNames}
      weddingDate={meta.weddingDate}
      location={meta.location}
      coverUrl={meta.coverUrl}
    >
      {children}
    </AppShell>
  );
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace, ensureEmailMember } from "@/lib/data/workspace";
import { AppNav } from "@/components/layout/AppNav";

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
    <div className="min-h-screen">
      <AppNav
        userName={session.name}
        weddingName={workspace.name}
        weddingDate={meta.weddingDate}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

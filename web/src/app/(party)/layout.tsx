import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { PartyNav } from "@/components/party/PartyNav";

export default async function PartyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen bg-paper pb-20 text-ink">
      {children}
      <PartyNav />
    </div>
  );
}

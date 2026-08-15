import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function PartyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}

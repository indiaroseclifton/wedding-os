import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace, ensureEmailMember, getWorkspaceGuests } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { loadThisWeek } from "@/lib/this-week";
import { nextShapeDate } from "@/lib/shape";
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
  const countDate = nextShapeDate(meta.weddingDate, meta.gatheringDate) || meta.weddingDate;
  const [guests, vendors, week] = await Promise.all([
    getWorkspaceGuests(workspace.id),
    listVendors(workspace.id),
    loadThisWeek(workspace.id, countDate),
  ]);
  const kick = week.items[0];

  return (
    <AppShell
      userName={session.name}
      coupleNames={meta.coupleNames}
      weddingDate={meta.weddingDate}
      location={meta.location}
      coverUrl={meta.coverUrl || "/brand/flowers.jpg"}
      shape={meta.shape}
      guestCount={guests.length}
      vendorCount={vendors.length}
      kickTitle={kick?.title}
      kickWhen={kick?.urgency === "now" ? "Now" : kick?.urgency === "week" ? "This week" : kick ? "Soon" : undefined}
      kickHref={kick?.href}
      alerts={week.items.filter((i) => i.urgency === "now").length}
    >
      {children}
    </AppShell>
  );
}

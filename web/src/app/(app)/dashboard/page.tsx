import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { getBudget } from "@/lib/data/budget-store";
import { listPayments } from "@/lib/data/payments-store";
import { listVendors } from "@/lib/data/vendors-store";
import { loadThisWeek } from "@/lib/this-week";
import { HomeDashboard } from "@/components/this-week/HomeDashboard";
import { nextShapeDate } from "@/lib/shape";
import { firstNames, prettyWeddingDate } from "@/lib/visual-rooms";
import { isPendingRsvp } from "@/lib/data/guest-mail";
import { isBooked } from "@/lib/send/status";
import { getThanks } from "@/lib/data/thanks-store";
import { buildAfterDesk } from "@/lib/after-desk";
import { getStudio } from "@/lib/data/studio-store";
import { projectCost, projectProgress } from "@/lib/studio-project";

export default async function DashboardPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const countDate = nextShapeDate(meta.weddingDate, meta.gatheringDate) || meta.weddingDate;
  const [week, budget, payments, guests, vendors, thanks, studio] = await Promise.all([
    loadThisWeek(workspace.id, countDate),
    getBudget(workspace.id),
    listPayments(workspace.id),
    getWorkspaceGuests(workspace.id),
    listVendors(workspace.id),
    getThanks(workspace.id),
    getStudio(workspace.id),
  ]);

  const spent = budget.lines.reduce((s, l) => s + (l.actual || 0), 0);
  const cap = budget.overallLimit || budget.lines.reduce((s, l) => s + (l.planned || 0), 0);
  const booked = vendors.filter((v) => isBooked(v.status)).length;
  const pending = vendors.filter((v) => !isBooked(v.status) && v.status !== "PASSED").length;
  const dateLine = [prettyWeddingDate(countDate).toUpperCase(), meta.location?.toUpperCase()].filter(Boolean).join("  ·  ");
  const nextPayment = payments
    .filter((payment) => payment.status !== "PAID")
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))[0];
  const activeProject = [...studio.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const projectHref = activeProject?.kind === "floral"
    ? "/diy/studio/floral"
    : activeProject?.kind === "table"
      ? "/diy/studio/table"
      : "/studio";

  const nextUp = week.items.slice(0, 2).map((item) => ({
    when: item.urgency === "now" ? "Today" : item.urgency === "week" ? "This week" : "Soon",
    title: item.title,
    href: item.href,
  }));

  const after = week.days != null && week.days < 0;
  const desk = after
    ? buildAfterDesk({
        weddingDate: meta.weddingDate,
        guests,
        vendors,
        items: thanks.items || [],
        names: meta.coupleNames || meta.name,
      })
    : null;
  const afterItems = desk
    ? desk.nextWrite.map((c) => ({
        id: c.id,
        urgency: "now" as const,
        title: `Write ${c.guestName}`,
        detail: c.missingAddress ? "Need an address" : c.gift || "Thank them",
        href: "/after",
        cta: "Open After",
      }))
    : [];

  return (
    <HomeDashboard
      days={week.days}
      names={firstNames(meta.coupleNames, "Alex & Jordan")}
      dateLine={dateLine}
      tagline={after ? desk?.pace || "The three months." : "The adventure begins…"}
      weekItems={after && afterItems.length ? afterItems : week.items}
      spent={spent}
      cap={cap}
      guestTotal={guests.length}
      guestResponded={guests.filter((g) => !isPendingRsvp(g.rsvp)).length}
      vendorBooked={booked}
      vendorPending={pending}
      nextUp={nextUp}
      nextPayment={nextPayment ? {
        label: nextPayment.label || "Wedding payment",
        amount: nextPayment.amount || 0,
        dueDate: nextPayment.dueDate,
      } : null}
      activeProject={activeProject ? {
        title: activeProject.title,
        stage: activeProject.stage,
        progress: projectProgress(activeProject),
        cost: projectCost(activeProject),
        href: projectHref,
      } : null}
      season={after ? "after" : "planning"}
      coverUrl={meta.coverUrl || "/brand/tablescape.jpg"}
    />
  );
}

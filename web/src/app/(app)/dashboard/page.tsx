import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { getBudget } from "@/lib/data/budget-store";
import { listPayments } from "@/lib/data/payments-store";
import { getMedia } from "@/lib/data/media-store";
import { getMoodboard } from "@/lib/data/moodboard-store";
import { listVendors } from "@/lib/data/vendors-store";
import { listSends } from "@/lib/data/sends-store";
import { loadThisWeek } from "@/lib/this-week";
import { HomeDashboard } from "@/components/this-week/HomeDashboard";
import { nextShapeDate } from "@/lib/shape";
import { buildSpotlight } from "@/lib/home-spotlight";

export default async function DashboardPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const countDate = nextShapeDate(meta.weddingDate, meta.gatheringDate) || meta.weddingDate;
  const [week, budget, payments, media, mood, guests, vendors, sends] = await Promise.all([
    loadThisWeek(workspace.id, countDate),
    getBudget(workspace.id),
    listPayments(workspace.id),
    getMedia(workspace.id),
    getMoodboard(workspace.id),
    getWorkspaceGuests(workspace.id),
    listVendors(workspace.id),
    listSends(workspace.id),
  ]);

  const fromLibrary =
    media.items.find((i) => i.kind === "PHOTO" && i.url)?.url || mood.items.find((i) => i.url)?.url;
  const coverUrl = meta.coverUrl || fromLibrary || "/brand/tablescape.jpg";
  const spent =
    budget.lines.reduce((s, l) => s + (l.actual || 0), 0) +
    payments.filter((p) => p.status === "PAID").reduce((s, p) => s + (p.amount || 0), 0);
  const cap = budget.overallLimit || budget.lines.reduce((s, l) => s + (l.planned || 0), 0);
  const spot = buildSpotlight({
    guests,
    vendors,
    payments,
    sends,
    weekItems: week.items,
    spent,
    cap,
    weddingDate: countDate,
    gatheringDate: meta.gatheringDate,
    shape: meta.shape,
    coverUrl,
  });

  return (
    <HomeDashboard
      days={week.days}
      coverUrl={coverUrl}
      dateLabel={spot.dateLabel}
      shapeTitle={spot.shapeTitle}
      cards={spot.cards}
      alsoOpen={spot.alsoOpen}
      spent={spent}
      cap={cap}
      replies={spot.replies}
      onboarded={meta.onboarded === true}
      firstWalkDone={meta.firstWalkDone === true}
    />
  );
}

import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getBudget } from "@/lib/data/budget-store";
import { listPayments } from "@/lib/data/payments-store";
import { getMedia } from "@/lib/data/media-store";
import { getMoodboard } from "@/lib/data/moodboard-store";
import { loadThisWeek } from "@/lib/this-week";
import { HomeDashboard } from "@/components/this-week/HomeDashboard";

export default async function DashboardPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const [week, budget, payments, media, mood] = await Promise.all([
    loadThisWeek(workspace.id, meta.weddingDate),
    getBudget(workspace.id),
    listPayments(workspace.id),
    getMedia(workspace.id),
    getMoodboard(workspace.id),
  ]);

  const fromLibrary =
    media.items.find((i) => i.kind === "PHOTO" && i.url)?.url ||
    mood.items.find((i) => i.url)?.url;
  const coverUrl = meta.coverUrl || fromLibrary || "/brand/tablescape.jpg";
  const spent =
    budget.lines.reduce((s, l) => s + (l.actual || 0), 0) +
    payments.filter((p) => p.status === "PAID").reduce((s, p) => s + (p.amount || 0), 0);
  const cap = budget.overallLimit || budget.lines.reduce((s, l) => s + (l.planned || 0), 0);

  return (
    <HomeDashboard
      days={week.days}
      coverUrl={coverUrl}
      weekItems={week.items}
      spent={spent}
      cap={cap}
    />
  );
}

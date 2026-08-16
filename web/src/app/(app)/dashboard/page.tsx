import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace, getWorkspaceDecisions } from "@/lib/data/workspace";
import { getMedia } from "@/lib/data/media-store";
import { getMoodboard } from "@/lib/data/moodboard-store";
import { SeedButton } from "./SeedButton";
import { loadThisWeek } from "@/lib/this-week";
import { CinematicDash } from "@/components/this-week/CinematicDash";

export default async function DashboardPage() {
  const session = await getSessionUser();
  const { workspace, meta } = await ensureDemoWorkspace();
  const [decisions, week, media, mood] = await Promise.all([
    getWorkspaceDecisions(workspace.id),
    loadThisWeek(workspace.id, meta.weddingDate),
    getMedia(workspace.id),
    getMoodboard(workspace.id),
  ]);

  const fromLibrary =
    media.items.find((i) => i.kind === "PHOTO" && i.url)?.url ||
    mood.items.find((i) => i.url)?.url;
  const coverUrl = meta.coverUrl || fromLibrary || "/brand/tablescape.jpg";
  const hello = session?.name ? `Hi, ${session.name.split(" ")[0]}` : "This week";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <SeedButton />
      </div>
      <CinematicDash
        hello={hello}
        coupleNames={meta.coupleNames}
        location={meta.location}
        days={week.days}
        date={meta.weddingDate}
        weekCount={week.now + week.week}
        coverUrl={coverUrl}
        items={week.items}
      />
      <p className="text-xs text-muted">
        {decisions.length} decisions logged. Put your photo in Settings if this still looks like ours.
      </p>
    </div>
  );
}

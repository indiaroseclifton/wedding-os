import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { Icon } from "@/components/icons";
import { ensureDemoWorkspace, getWorkspaceDecisions } from "@/lib/data/workspace";
import { getChecklist } from "@/lib/data/checklist-store";
import { getPath, PATH_CATEGORIES } from "@/lib/data/path-store";
import { listTimeline } from "@/lib/data/timeline-store";
import { relativeToWedding } from "@/lib/timeline-dates";

export default async function PlanningPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const [list, path, timeline, decisions] = await Promise.all([
    getChecklist(workspace.id),
    getPath(workspace.id),
    listTimeline(workspace.id),
    getWorkspaceDecisions(workspace.id),
  ]);

  const done = list.items.filter((i) => i.done).length;
  const pct = list.items.length ? Math.round((done / list.items.length) * 100) : 0;
  const nextCheck = list.items.find((i) => !i.done);
  const nextMile = timeline.find((t) => !t.done);
  const vision = decisions.find((d) => d.type === "STYLE_VIBE");
  const vibe = (vision?.payload?.vibe as string) || "";
  const colors = (vision?.payload?.colors as string) || "";
  const formal = (vision?.payload?.formal as string) || meta.formality || "";
  const decided = PATH_CATEGORIES.filter((c) => path.choices[c.id] && path.choices[c.id] !== "undecided");
  const openLanes = PATH_CATEGORIES.length - decided.length;
  const openCalls = decisions.filter((d) => d.status !== "DECIDED").length;

  return (
    <div>
      <RoomSubnav room="planning" />
      <h1 className="font-serif text-4xl">Planning</h1>
      <p className="mt-1 text-sm text-muted">
        {meta.coupleNames || "Your wedding"}
        {meta.weddingDate ? ` · ${meta.weddingDate}` : ""}
        {meta.location ? ` · ${meta.location}` : ""}
      </p>

      <div className="mt-8 grid gap-3 lg:grid-cols-3">
        <Link href="/planning/vision" className="rounded-2xl border border-line bg-surface p-5">
          <p className="flex items-center gap-2 kicker kicker-moss">
            <Icon name="heart" className="h-3.5 w-3.5" /> Vision
          </p>
          <p className="mt-2 font-serif text-2xl">{vibe || "Not decided"}</p>
          <p className="mt-2 text-sm text-muted">
            {[formal, colors].filter(Boolean).join(" · ") || "Vibe, colors, formality."}
          </p>
        </Link>

        <Link href="/checklist" className="rounded-2xl border border-line bg-surface p-5">
          <p className="flex items-center gap-2 kicker kicker-moss">
            <Icon name="check" className="h-3.5 w-3.5" /> Checklist
          </p>
          <p className="mt-2 font-serif text-2xl">{pct}%</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-moss" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {nextCheck ? `Next: ${nextCheck.title}` : "Everything checked."}
          </p>
        </Link>

        <Link href="/timeline" className="rounded-2xl border border-line bg-surface p-5">
          <p className="flex items-center gap-2 kicker kicker-moss">
            <Icon name="calendar" className="h-3.5 w-3.5" /> Next milestone
          </p>
          <p className="mt-2 font-serif text-2xl leading-tight">{nextMile?.title || "Add dates"}</p>
          <p className="mt-2 text-sm text-muted">
            {nextMile
              ? relativeToWedding(nextMile.when, meta.weddingDate)
              : "Build the arc from the wedding date."}
          </p>
        </Link>
      </div>

      <Link href="/decisions" className="mt-3 block rounded-2xl border border-line bg-surface p-5">
        <p className="kicker kicker-moss">Decisions</p>
        <p className="mt-2 font-serif text-2xl">
          {openCalls ? `${openCalls} still open` : decisions.length ? "All called" : "What a coordinator will ask"}
        </p>
        <p className="mt-1 text-sm text-muted">First look, rain plan, kids, bar — then turn a call into a task.</p>
      </Link>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Hire or make</p>
          <Link href="/decisions/path" className="text-xs underline">
            {openLanes ? `${openLanes} still open` : "All picked"}
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PATH_CATEGORIES.map((c) => {
            const choice = path.choices[c.id] || "undecided";
            return (
              <span
                key={c.id}
                className={`rounded-full px-3 py-1 text-xs ${
                  choice === "undecided" ? "border border-line text-muted" : "bg-moss-soft text-ink"
                }`}
              >
                {c.label}
                {choice !== "undecided" ? ` · ${choice}` : ""}
              </span>
            );
          })}
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/diy" className="rounded-full border border-line px-3 py-1.5 text-xs">
          DIY studio
        </Link>
        <Link href="/planning/party" className="rounded-full border border-line px-3 py-1.5 text-xs">
          Wedding party
        </Link>
        <Link href="/moodboard" className="rounded-full border border-line px-3 py-1.5 text-xs">
          Moodboard
        </Link>
        <Link href="/traditions" className="rounded-full border border-line px-3 py-1.5 text-xs">
          Traditions
        </Link>
      </div>
    </div>
  );
}

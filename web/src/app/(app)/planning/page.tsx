import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace, getWorkspaceDecisions } from "@/lib/data/workspace";
import { getChecklist } from "@/lib/data/checklist-store";
import { getPath, PATH_CATEGORIES } from "@/lib/data/path-store";
import { listTimeline } from "@/lib/data/timeline-store";
import { colorsLine, normalizeVision } from "@/lib/vision";
import { prettyWeddingDate } from "@/lib/visual-rooms";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default async function PlanningPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const [list, path, timeline, decisions] = await Promise.all([
    getChecklist(workspace.id),
    getPath(workspace.id),
    listTimeline(workspace.id),
    getWorkspaceDecisions(workspace.id),
  ]);

  const done = list.items.filter((item) => item.done).length;
  const checklistPct = list.items.length ? (done / list.items.length) * 100 : 0;
  const visionDecision = decisions.find((decision) => decision.type === "STYLE_VIBE");
  const brief = visionDecision ? normalizeVision(visionDecision.payload) : null;
  const swatches = brief?.palette?.hex || [];
  const decidedLanes = PATH_CATEGORIES.filter((category) => path.choices[category.id] && path.choices[category.id] !== "undecided").length;
  const openDecisions = decisions.filter((decision) => decision.status !== "DECIDED");
  const decidedDecisions = decisions.length - openDecisions.length;
  const timelineDone = timeline.filter((item) => item.done).length;

  const readiness = [
    { label: "Vision", value: brief?.vibe || swatches.length ? 100 : 25, detail: brief?.vibe || "Shape the brief", href: "/planning/vision" },
    { label: "Plan", value: checklistPct, detail: `${done} of ${list.items.length} complete`, href: "/checklist" },
    { label: "Hire or make", value: PATH_CATEGORIES.length ? (decidedLanes / PATH_CATEGORIES.length) * 100 : 0, detail: `${decidedLanes} of ${PATH_CATEGORIES.length} called`, href: "/decisions/path" },
    { label: "Schedule", value: timeline.length ? (timelineDone / timeline.length) * 100 : 0, detail: `${timelineDone} of ${timeline.length} milestones`, href: "/timeline" },
    { label: "Decisions", value: decisions.length ? (decidedDecisions / decisions.length) * 100 : 0, detail: `${openDecisions.length} still open`, href: "/decisions" },
  ];

  return (
    <div className="space-y-8">
      <RoomSubnav room="planning" />

      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div>
          <p className="kicker kicker-moss">Wedding brief</p>
          <h1 className="mt-3 font-serif text-[clamp(2.8rem,7vw,4.8rem)] leading-[0.95] tracking-tight">
            {brief?.vibe || meta.coupleNames || "Make the plan feel like you."}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-soft">
            {[brief?.formal || meta.formality, brief ? colorsLine(brief) : "", meta.location].filter(Boolean).join(" · ") ||
              "Choose the feeling, then turn it into five clear workstreams."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            {meta.weddingDate ? <span className="rounded-full border border-line bg-surface px-3 py-2">{prettyWeddingDate(meta.weddingDate)}</span> : null}
            {meta.location ? <span className="rounded-full border border-line bg-surface px-3 py-2">{meta.location}</span> : null}
            <Link href="/planning/vision" className="rounded-full bg-ink px-4 py-2 text-ivory">Edit the brief</Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-line bg-surface">
          {brief?.feel[0]?.url ? <img src={brief.feel[0].url} alt="" className="aspect-[16/9] w-full object-cover" /> : <div className="aspect-[16/9] bg-moss-soft" />}
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="kicker">Palette</p>
              <p className="mt-1 text-sm text-muted">{brief ? colorsLine(brief) || "Still open" : "Still open"}</p>
            </div>
            <div className="flex gap-1.5" aria-label="Wedding color palette">
              {swatches.length ? swatches.slice(0, 6).map((color) => <span key={color} className="h-8 w-8 rounded-full border border-line" style={{ background: color }} title={color} />) : <span className="text-sm text-muted">Add colors</span>}
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="readiness-heading">
        <div>
          <p className="kicker">Readiness by workstream</p>
          <h2 id="readiness-heading" className="mt-2 font-serif text-3xl">The whole plan, without the maze</h2>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {readiness.map((item) => {
            const value = clamp(item.value);
            return (
              <Link key={item.label} href={item.href} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-baseline justify-between gap-2"><p className="kicker">{item.label}</p><span className="text-sm tabular-nums text-muted">{value}%</span></div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full bg-sage" style={{ width: `${value}%` }} /></div>
                <p className="mt-3 text-sm text-ink-soft">{item.detail}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="rounded-[1.5rem] border border-line bg-surface p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="kicker kicker-moss">Next five</p><h2 className="mt-2 font-serif text-3xl">Decisions that unlock work</h2></div>
            <Link href="/decisions" className="text-sm underline underline-offset-4">All decisions</Link>
          </div>
          {openDecisions.length ? (
            <ol className="mt-5 divide-y divide-line">
              {openDecisions.slice(0, 5).map((decision, index) => (
                <li key={decision.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <span className="font-serif text-xl text-muted">{String(index + 1).padStart(2, "0")}</span>
                  <div><p className="font-medium">{decision.title}</p><p className="mt-0.5 text-sm text-muted">{decision.summary || "Needs a call"}</p></div>
                  <Link href="/decisions" className="rounded-full border border-line px-3 py-2 text-xs">Make the call</Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-5 rounded-2xl bg-moss-soft p-5 text-sm">No open decisions. The plan is ready to move.</p>
          )}
        </div>

        <aside className="space-y-3">
          <Link href="/together" className="block rounded-2xl bg-ink p-5 text-ivory">
            <p className="text-xs uppercase tracking-[0.16em] text-champagne">Together</p>
            <p className="mt-2 font-serif text-2xl">Resolve the differences</p>
            <p className="mt-2 text-sm text-white/70">Owners, approvals and the choices that need both of you.</p>
          </Link>
          <Link href="/studio" className="block rounded-2xl border border-line bg-surface p-5">
            <p className="kicker">Studio</p>
            <p className="mt-2 font-serif text-2xl">Turn the brief into a build</p>
          </Link>
        </aside>
      </section>
    </div>
  );
}


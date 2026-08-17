import Link from "next/link";

const STEPS = [
  {
    n: 1,
    title: "Load sample data",
    body: "On the dashboard, click Load sample data. This creates guests (with dietary notes), vendors, tasks, tables, music, and a draft DJ package.",
    href: "/dashboard",
    cta: "Dashboard",
  },
  {
    n: 2,
    title: "See guided decisions",
    body: "Open Decisions. Priorities should already be decided; Style can still be exploring. Optionally create a Follow-up task from a decision.",
    href: "/decisions",
    cta: "Decisions",
  },
  {
    n: 3,
    title: "Guest list & dietary",
    body: "Open Guests — filter RSVPs, try bulk select. Then open Dietary for the catering rollup.",
    href: "/guests",
    cta: "Guests",
  },
  {
    n: 4,
    title: "Catering handoff",
    body: "Handoffs → New → Catering. Keep prefill on. You should see headcount and dietary notes from the guest list. Share link or Download .txt.",
    href: "/handoffs/new",
    cta: "New handoff",
  },
  {
    n: 5,
    title: "DJ handoff from music",
    body: "Open Music (sample must-play / do-not-play). Then create a DJ handoff with prefill on — or open the draft DJ package from seed.",
    href: "/music",
    cta: "Music",
  },
  {
    n: 6,
    title: "Party portal",
    body: "People → create an invite link (or open Party view as the couple). Check Day-of board and My tasks. This is the bridesmaids / party surface.",
    href: "/people",
    cta: "People",
  },
  {
    n: 7,
    title: "Day-of board",
    body: "Update check-ins and post a status note. Party members can update status from their portal too.",
    href: "/day-of",
    cta: "Day-of",
  },
];

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Milestone A · Happy path
        </p>
        <h1 className="mt-1 title">Demo walkthrough</h1>
        <p className="mt-2 text-sm text-muted">
          This is the core product story: decisions → guests → handoffs → party coordination.
          Other modules can wait for Phase 2 depth.
        </p>
      </div>

      <ol className="space-y-4">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="glass-panel rounded-2xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-400">Step {s.n}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{s.title}</p>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </div>
              <Link
                href={s.href}
                className="shrink-0 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                {s.cta}
              </Link>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
        <p className="font-medium text-ink">What this proves</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Couple can decide and turn choices into work</li>
          <li>Guest data feeds vendor handoffs (catering + DJ)</li>
          <li>Wedding party has a simpler portal for day-of and tasks</li>
          <li>No spreadsheet required for the core coordination loop</li>
        </ul>
      </div>
    </div>
  );
}

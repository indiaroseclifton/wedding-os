import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ensureDemoWorkspace, getWorkspaceDecisions } from "@/lib/data/workspace";
import { FollowUpButton } from "./FollowUpButton";

const FLOWS = [
  {
    href: "/decisions/priorities",
    title: "Priorities",
    body: "Rank what matters and what you will protect under pressure.",
  },
  {
    href: "/decisions/style",
    title: "Style & vibe",
    body: "Agree on the feel before shopping or briefing vendors.",
  },
  {
    href: "/decisions/venue",
    title: "Venue type",
    body: "Choose the kind of place, not every listing yet.",
  },
];

export default async function DecisionsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const decisions = await getWorkspaceDecisions(workspace.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Decisions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Guided choices with a clear record — create a follow-up task when ready.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {FLOWS.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
          >
            <p className="text-sm font-semibold text-slate-900">{f.title}</p>
            <p className="mt-1 text-xs text-slate-600">{f.body}</p>
          </Link>
        ))}
      </div>

      {decisions.length === 0 ? (
        <EmptyState
          title="No saved decisions yet"
          body="Start with priorities, style, or venue type. You can mark them exploring or decided."
        />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {decisions.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{d.title}</p>
                <p className="text-xs text-slate-500">{d.summary}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={d.status} />
                <FollowUpButton decisionId={d.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

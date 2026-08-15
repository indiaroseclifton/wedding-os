import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ensureDemoWorkspace, getWorkspaceDecisions } from "@/lib/data/workspace";

export default async function DecisionsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const decisions = await getWorkspaceDecisions(workspace.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Decisions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Priorities, style, and venue choices with a clear record.
        </p>
      </div>

      {decisions.length === 0 ? (
        <EmptyState
          title="No decisions yet"
          body="Guided decision flows will land in the next upload batches. For now the list is ready."
        />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {decisions.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{d.title}</p>
                <p className="text-xs text-slate-500">{d.summary}</p>
              </div>
              <StatusBadge status={d.status} />
            </li>
          ))}
        </ul>
      )}

      <Link href="/dashboard" className="text-sm font-medium text-slate-900 underline">
        Back to dashboard
      </Link>
    </div>
  );
}

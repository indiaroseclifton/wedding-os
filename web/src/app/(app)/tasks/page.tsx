import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ensureDemoWorkspace, getWorkspaceTasks } from "@/lib/data/workspace";

export default async function TasksPage() {
  const { workspace } = await ensureDemoWorkspace();
  const tasks = await getWorkspaceTasks(workspace.id);
  const open = tasks.filter((t) => t.status !== "DONE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-slate-600">
            Shared to-dos linked to decisions when useful.
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          body="Create a task and assign it to you or your partner."
          primaryHref="/tasks/new"
          primaryLabel="Add task"
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">{open.length} open · {tasks.length} total</p>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{t.title}</p>
                  <p className="text-xs text-slate-500">
                    {t.ownerName || "Unassigned"}
                    {t.dueDate ? ` · due ${t.dueDate}` : ""}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

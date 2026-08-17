import Link from "next/link";
import { ensureDemoWorkspace, getWorkspaceTasks } from "@/lib/data/workspace";

export default async function WorkloadPage() {
  const { workspace } = await ensureDemoWorkspace();
  const tasks = await getWorkspaceTasks(workspace.id);
  const open = tasks.filter((t) => t.status !== "DONE");

  const byOwner = new Map<string, { name: string; total: number; open: number; done: number }>();
  for (const t of tasks) {
    const key = t.ownerId || "unassigned";
    const name = t.ownerName || "Unassigned";
    const row = byOwner.get(key) || { name, total: 0, open: 0, done: 0 };
    row.total += 1;
    if (t.status === "DONE") row.done += 1;
    else row.open += 1;
    byOwner.set(key, row);
  }

  const rows = Array.from(byOwner.values()).sort((a, b) => b.open - a.open);
  const maxOpen = Math.max(1, ...rows.map((r) => r.open));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title">Workload</h1>
        <p className="mt-1 text-sm text-muted">
          Who is carrying open tasks — a gentle check against planning resentment.
        </p>
      </div>

      <p className="text-xs text-muted">
        {open.length} open tasks across {rows.length} people
      </p>

      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.name} className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{r.name}</span>
              <span className="text-xs text-muted">
                {r.open} open · {r.done} done
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${Math.round((r.open / maxOpen) * 100)}%` }}
              />
            </div>
          </li>
        ))}
        {!rows.length && (
          <li className="py-8 text-center text-sm text-muted">
            No tasks yet.{" "}
            <Link href="/tasks/new" className="underline">
              Add one
            </Link>
          </li>
        )}
      </ul>

      {rows.length >= 2 && rows[0].open >= rows[rows.length - 1].open + 3 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          One person has noticeably more open work. Consider reassigning a few tasks.
        </div>
      )}
    </div>
  );
}

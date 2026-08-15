import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  getWorkspaceTasks,
} from "@/lib/data/workspace";

export default async function DashboardPage() {
  const session = await getSessionUser();
  const { workspace } = await ensureDemoWorkspace();
  const [tasks, guests] = await Promise.all([
    getWorkspaceTasks(workspace.id),
    getWorkspaceGuests(workspace.id),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "DONE").length;
  const headcount = guests.reduce((sum, g) => {
    if (g.rsvp === "NO") return sum;
    return sum + 1 + (g.plusOnes || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome{session ? `, ${session.name}` : ""}. {workspace.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link href="/tasks" className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
          <p className="text-2xl font-semibold">{openTasks}</p>
          <p className="text-xs text-slate-500">Open tasks</p>
        </Link>
        <Link href="/guests" className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
          <p className="text-2xl font-semibold">{guests.length}</p>
          <p className="text-xs text-slate-500">Guests</p>
        </Link>
        <Link href="/guests" className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
          <p className="text-2xl font-semibold">{headcount}</p>
          <p className="text-xs text-slate-500">Headcount</p>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Quick links</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
          <li>
            <Link href="/guests/new" className="underline">
              Add a guest
            </Link>
          </li>
          <li>
            <Link href="/tasks/new" className="underline">
              Add a task
            </Link>
          </li>
          <li>
            <Link href="/seating" className="underline">
              Seating overview
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

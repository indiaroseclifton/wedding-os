import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace, getWorkspaceTasks } from "@/lib/data/workspace";

export default async function PartyTasksPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { workspace } = await ensureDemoWorkspace();
  const tasks = await getWorkspaceTasks(workspace.id);
  const mine = tasks.filter((t) => t.ownerId === session.userId);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My tasks</h1>
        <Link href="/party" className="text-xs underline">
          Portal home
        </Link>
      </div>
      {mine.length === 0 ? (
        <p className="text-sm text-slate-600">No tasks assigned to you yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {mine.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-slate-500">{t.description}</p>
                )}
              </div>
              <StatusBadge status={t.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ensureDemoWorkspace, getWorkspaceTasks } from "@/lib/data/workspace";
import { TasksClient } from "./TasksClient";

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
            Shared to-dos — update status without leaving the list.
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
          <p className="text-xs text-slate-500">
            {open.length} open · {tasks.length} total
          </p>
          <TasksClient
            tasks={tasks.map((t) => ({
              id: t.id,
              title: t.title,
              ownerName: t.ownerName,
              status: t.status,
              dueDate: t.dueDate,
            }))}
          />
        </div>
      )}
    </div>
  );
}

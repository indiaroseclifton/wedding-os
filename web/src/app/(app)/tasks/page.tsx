import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ensureDemoWorkspace,
  getWorkspaceMembers,
  getWorkspaceTasks,
} from "@/lib/data/workspace";
import { TasksClient } from "./TasksClient";

export default async function TasksPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [tasks, members] = await Promise.all([
    getWorkspaceTasks(workspace.id),
    getWorkspaceMembers(workspace.id),
  ]);
  const open = tasks.filter((t) => t.status !== "DONE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-slate-600">
            Select multiple tasks to change status, reassign, or delete.
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
          body="Create a task and assign it to you, your partner, or the wedding party."
          primaryHref="/tasks/new"
          primaryLabel="Add task"
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            {open.length} open · {tasks.length} total
          </p>
          <TasksClient
            members={members.map((m) => ({ userId: m.userId, name: m.name }))}
            tasks={tasks.map((t) => ({
              id: t.id,
              title: t.title,
              ownerId: t.ownerId,
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

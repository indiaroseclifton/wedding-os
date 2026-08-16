import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace, getWorkspaceTasks } from "@/lib/data/workspace";
import { PartyMyTasks } from "../PartyMyTasks";

export default async function PartyTasksPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { workspace } = await ensureDemoWorkspace();
  const tasks = await getWorkspaceTasks(workspace.id);
  const mine = tasks.filter((t) => t.ownerId === session.userId);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">My tasks</h1>
        <Link href="/party" className="text-xs underline">
          Portal home
        </Link>
      </div>
      <PartyMyTasks
        initial={mine.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          dueDate: t.dueDate,
        }))}
      />
    </div>
  );
}

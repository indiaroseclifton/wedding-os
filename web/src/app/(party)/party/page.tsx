import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import {
  ensureDemoWorkspace,
  getCurrentMembership,
  getWorkspaceTasks,
} from "@/lib/data/workspace";
import { getDayOf } from "@/lib/data/dayof-store";
import { getAttire } from "@/lib/data/attire-store";

function isOverdue(dueDate?: string, status?: string) {
  if (!dueDate || status === "DONE") return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function withinDays(dueDate: string | undefined, days: number) {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + days);
  return due >= today && due <= end;
}

export default async function PartyHomePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const membership = await getCurrentMembership(session.userId);
  const { workspace } = await ensureDemoWorkspace();
  const [tasks, dayOf, attire] = await Promise.all([
    getWorkspaceTasks(workspace.id),
    getDayOf(workspace.id),
    getAttire(workspace.id),
  ]);

  const mine = tasks.filter((t) => t.ownerId === session.userId);
  const openMine = mine.filter((t) => t.status !== "DONE");
  const overdue = openMine.filter((t) => isOverdue(t.dueDate, t.status));
  const dueSoon = openMine.filter(
    (t) => !isOverdue(t.dueDate, t.status) && withinDays(t.dueDate, 7)
  );
  const myAttire = attire.members.find(
    (m) => m.name.toLowerCase() === session.name.toLowerCase()
  );

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Wedding party
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Hi, {session.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {membership?.role === "WEDDING_PARTY"
            ? "Your week for this wedding."
            : "Couple preview of the party portal."}
        </p>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">My week</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-50 px-2 py-2">
            <p className="text-lg font-semibold">{openMine.length}</p>
            <p className="text-[10px] text-slate-500">Open tasks</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-2 py-2">
            <p className="text-lg font-semibold">{dueSoon.length}</p>
            <p className="text-[10px] text-slate-500">Due in 7 days</p>
          </div>
          <div className="rounded-lg bg-rose-50 px-2 py-2">
            <p className="text-lg font-semibold text-rose-800">{overdue.length}</p>
            <p className="text-[10px] text-rose-700">Overdue</p>
          </div>
        </div>

        {openMine.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">No open tasks assigned to you.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {openMine.slice(0, 5).map((t) => (
              <li key={t.id} className="text-sm">
                <span className="font-medium">{t.title}</span>
                <span className="text-xs text-slate-500">
                  {" "}
                  · {t.status.replaceAll("_", " ")}
                  {t.dueDate ? ` · due ${t.dueDate}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/party/tasks" className="mt-3 inline-block text-xs font-medium underline">
          All my tasks
        </Link>
      </section>

      <div className="space-y-3">
        <Link
          href="/party/tasks"
          className="block rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
        >
          <p className="text-sm font-semibold">My tasks</p>
          <p className="text-xs text-slate-500">{mine.length} assigned to you</p>
        </Link>
        <Link
          href="/party/attire"
          className="block rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
        >
          <p className="text-sm font-semibold">Attire</p>
          <p className="text-xs text-slate-500">
            {myAttire
              ? `${myAttire.status.replaceAll("_", " ")}${myAttire.color ? ` · ${myAttire.color}` : ""}`
              : "Colors, links, status"}
          </p>
        </Link>
        <Link
          href="/party/day-of"
          className="block rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
        >
          <p className="text-sm font-semibold">Day-of board</p>
          <p className="text-xs text-slate-500">
            {dayOf.checkIns.filter((c) => c.status === "READY").length}/
            {dayOf.checkIns.length} ready · check-ins & updates
          </p>
        </Link>
      </div>

      {membership?.role !== "WEDDING_PARTY" && (
        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/dashboard" className="underline">
            Back to full couple dashboard
          </Link>
        </p>
      )}
    </div>
  );
}

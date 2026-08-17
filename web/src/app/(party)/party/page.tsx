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
        <p className="kicker kicker-moss">Wedding party</p>
        <h1 className="mt-1 font-serif text-4xl">{session.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {membership?.role === "WEDDING_PARTY"
            ? "Your week for this wedding."
            : "Couple preview of the party portal."}
        </p>
      </div>

      <section className="glass-panel mb-6 rounded-2xl p-5">
        <p className="text-sm font-semibold text-ink">My week</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-moss-soft px-2 py-2">
            <p className="font-serif text-lg">{openMine.length}</p>
            <p className="text-[10px] text-muted">Open tasks</p>
          </div>
          <div className="rounded-lg bg-moss-soft px-2 py-2">
            <p className="font-serif text-lg">{dueSoon.length}</p>
            <p className="text-[10px] text-muted">Due in 7 days</p>
          </div>
          <div className="rounded-lg bg-clay-soft px-2 py-2">
            <p className="font-serif text-lg text-clay">{overdue.length}</p>
            <p className="text-[10px] text-clay">Overdue</p>
          </div>
        </div>

        {openMine.length === 0 ? (
          <p className="mt-3 text-xs text-muted">No open tasks assigned to you.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {openMine.slice(0, 5).map((t) => (
              <li key={t.id} className="text-sm">
                <span className="font-medium">{t.title}</span>
                <span className="text-xs text-muted">
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
          className="glass-panel block rounded-2xl p-5 hover:bg-paper"
        >
          <p className="text-sm font-semibold">My tasks</p>
          <p className="text-xs text-muted">{mine.length} assigned to you</p>
        </Link>
        <Link
          href="/party/attire"
          className="glass-panel block rounded-2xl p-5 hover:bg-paper"
        >
          <p className="text-sm font-semibold">Attire</p>
          <p className="text-xs text-muted">
            {myAttire
              ? `${myAttire.status.replaceAll("_", " ")}${myAttire.color ? ` · ${myAttire.color}` : ""}`
              : "Colors, links, status"}
          </p>
        </Link>
        <Link
          href="/party/stay"
          className="glass-panel block rounded-2xl p-5 hover:bg-paper"
        >
          <p className="text-sm font-semibold">Stay</p>
          <p className="text-xs text-muted">Hotel block, shuttle, parking</p>
        </Link>
        <Link
          href="/party/speech"
          className="glass-panel block rounded-2xl p-5 hover:bg-paper"
        >
          <p className="text-sm font-semibold">Speech</p>
          <p className="text-xs text-muted">Draft and mark ready</p>
        </Link>
        <Link
          href="/party/day-of"
          className="glass-panel block rounded-2xl p-5 hover:bg-paper"
        >
          <p className="text-sm font-semibold">Day-of board</p>
          <p className="text-xs text-muted">
            {dayOf.checkIns.filter((c) => c.status === "READY").length}/
            {dayOf.checkIns.length} ready · check-ins & updates
          </p>
        </Link>
      </div>

      {membership?.role !== "WEDDING_PARTY" && (
        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/dashboard" className="underline">
            Back to the desk
          </Link>
        </p>
      )}
    </div>
  );
}

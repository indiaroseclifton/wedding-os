import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import {
  ensureDemoWorkspace,
  getCurrentMembership,
  getWorkspaceTasks,
} from "@/lib/data/workspace";

export default async function PartyHomePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const membership = await getCurrentMembership(session.userId);
  const { workspace } = await ensureDemoWorkspace();
  const tasks = await getWorkspaceTasks(workspace.id);
  const mine = tasks.filter((t) => t.ownerId === session.userId);

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Wedding party
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Hi, {session.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {membership?.role === "WEDDING_PARTY"
            ? "Your tasks and links for this wedding."
            : "Couple view of the party portal."}
        </p>
      </div>

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
          <p className="text-xs text-slate-500">Colors, links, status</p>
        </Link>
        <Link
          href="/party/day-of"
          className="block rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
        >
          <p className="text-sm font-semibold">Day-of board</p>
          <p className="text-xs text-slate-500">Check-ins and updates</p>
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

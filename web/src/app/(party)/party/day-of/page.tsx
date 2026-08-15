import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getDayOf } from "@/lib/data/dayof-store";

export default async function PartyDayOfPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { workspace } = await ensureDemoWorkspace();
  const dayOf = await getDayOf(workspace.id);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Day-of</h1>
        <Link href="/party" className="text-xs underline">
          Portal home
        </Link>
      </div>
      {(dayOf.weatherNote || dayOf.emergencyContact) && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm space-y-2">
          {dayOf.weatherNote && (
            <p>
              <span className="text-xs text-slate-500">Weather</span>
              <br />
              {dayOf.weatherNote}
            </p>
          )}
          {dayOf.emergencyContact && (
            <p>
              <span className="text-xs text-slate-500">Emergency</span>
              <br />
              {dayOf.emergencyContact}
            </p>
          )}
        </div>
      )}
      <ul className="space-y-2">
        {dayOf.checkIns.map((c) => (
          <li
            key={c.id}
            className="flex justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <span>
              {c.name}
              <span className="text-xs text-slate-500"> · {c.role}</span>
            </span>
            <span className="text-xs text-slate-600">{c.status.replaceAll("_", " ")}</span>
          </li>
        ))}
      </ul>
      <ul className="space-y-2">
        {dayOf.updates.slice(0, 10).map((u) => (
          <li key={u.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            {u.body}
          </li>
        ))}
      </ul>
    </div>
  );
}

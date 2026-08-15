import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";

export default async function GuestsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const guests = await getWorkspaceGuests(workspace.id);

  const headcount = guests.reduce((sum, g) => {
    if (g.rsvp === "NO") return sum;
    return sum + 1 + (g.plusOnes || 0);
  }, 0);
  const yes = guests.filter((g) => g.rsvp === "YES").length;
  const pending = guests.filter((g) =>
    ["UNKNOWN", "INVITED", "MAYBE"].includes(g.rsvp)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guests</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage RSVPs, dietary notes, and headcount.
          </p>
        </div>
        <Link
          href="/guests/new"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add guest
        </Link>
      </div>

      {guests.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "People", value: String(guests.length) },
            { label: "Yes", value: String(yes) },
            { label: "Pending", value: String(pending) },
            { label: "Headcount", value: String(headcount) },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center"
            >
              <p className="text-lg font-semibold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {guests.length === 0 ? (
        <EmptyState
          title="No guests yet"
          body="Add people one by one. Headcount excludes declined RSVPs and includes plus-ones."
          primaryHref="/guests/new"
          primaryLabel="Add guest"
        />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {guests.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{g.name}</p>
                <p className="text-xs text-slate-500">
                  {g.rsvp}
                  {g.dietary ? ` · ${g.dietary}` : ""}
                  {g.tableLabel ? ` · ${g.tableLabel}` : ""}
                </p>
              </div>
              <Link href={`/guests/${g.id}`} className="text-xs font-medium text-slate-700 underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

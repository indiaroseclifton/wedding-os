import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  getWorkspaceTables,
} from "@/lib/data/workspace";

export default async function SeatingPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [tables, guests] = await Promise.all([
    getWorkspaceTables(workspace.id),
    getWorkspaceGuests(workspace.id),
  ]);

  const seated = guests.filter((g) => g.tableLabel && g.rsvp !== "NO");
  const unseated = guests.filter((g) => !g.tableLabel && g.rsvp !== "NO");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seating</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tables and guest assignments. Dietary notes stay with each guest.
          </p>
        </div>
        <Link
          href="/guests"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Guest list
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{tables.length}</p>
          <p className="text-xs text-slate-500">Tables</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{seated.length}</p>
          <p className="text-xs text-slate-500">Seated</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{unseated.length}</p>
          <p className="text-xs text-slate-500">Need a table</p>
        </div>
      </div>

      {tables.length === 0 ? (
        <EmptyState
          title="No tables yet"
          body="Tables are created via the tables API for now. Guest table labels can be set when editing a guest."
          primaryHref="/guests"
          primaryLabel="Manage guests"
        />
      ) : (
        <ul className="space-y-3">
          {tables.map((t) => {
            const atTable = guests.filter((g) => g.tableLabel === t.name && g.rsvp !== "NO");
            return (
              <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {atTable.length}/{t.capacity}
                  </p>
                </div>
                {atTable.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {atTable.map((g) => (
                      <li key={g.id} className="text-xs text-slate-600">
                        {g.name}
                        {g.dietary ? ` · ${g.dietary}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">No one assigned yet</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {unseated.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">Need a table</p>
          <ul className="mt-2 space-y-1">
            {unseated.map((g) => (
              <li key={g.id} className="text-xs text-amber-800">
                {g.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

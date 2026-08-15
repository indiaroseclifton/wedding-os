import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  getWorkspaceTables,
} from "@/lib/data/workspace";
import { SeatingClient } from "./SeatingClient";

export default async function SeatingPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [tables, guests] = await Promise.all([
    getWorkspaceTables(workspace.id),
    getWorkspaceGuests(workspace.id),
  ]);

  const activeGuests = guests.filter((g) => g.rsvp !== "NO");
  const seated = activeGuests.filter((g) => g.tableLabel);
  const unseated = activeGuests.filter((g) => !g.tableLabel);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Seating</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create tables and assign guests. Dietary notes stay on each person.
          </p>
        </div>
        <Link
          href="/guests"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Guest list
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
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

      {tables.length === 0 && activeGuests.length === 0 ? (
        <EmptyState
          title="No seating data yet"
          body="Add guests first, then create tables and assign people."
          primaryHref="/guests/new"
          primaryLabel="Add guest"
        />
      ) : (
        <SeatingClient
          initialTables={tables.map((t) => ({
            id: t.id,
            name: t.name,
            capacity: t.capacity,
            shape: t.shape,
          }))}
          initialGuests={activeGuests.map((g) => ({
            id: g.id,
            name: g.name,
            tableLabel: g.tableLabel || null,
            dietary: g.dietary || null,
            rsvp: g.rsvp,
          }))}
        />
      )}
    </div>
  );
}

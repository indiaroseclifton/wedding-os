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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Seating</h1>
          <p className="mt-1 text-sm text-muted">
            Drag a person onto a chair. Plus-ones take the next seats. Print when you’re happy.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/floorplan"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
          >
            Floor plan
          </Link>
          <Link
            href="/guests"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
          >
            Guest list
          </Link>
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
            side: g.side || null,
            partyName: g.partyName || null,
            plusOnes: g.plusOnes || 0,
            seatIndex: g.seatIndex ?? null,
          }))}
        />
      )}
    </div>
  );
}
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  getWorkspaceTables,
} from "@/lib/data/workspace";
import { listEvents } from "@/lib/data/events-store";
import { eventRsvpMap } from "@/lib/data/event-rsvp-store";
import { ExportCsvButton } from "./ExportCsvButton";
import { GuestFilters } from "./GuestFilters";
import { NudgePanel } from "./NudgePanel";
import { hasMailingAddress } from "@/lib/data/guest-mail";

export default async function GuestsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [guests, tables, events, rsvpMap] = await Promise.all([
    getWorkspaceGuests(workspace.id),
    getWorkspaceTables(workspace.id),
    listEvents(workspace.id),
    eventRsvpMap(workspace.id),
  ]);
  const rsvpEvents = events.filter((e) => e.rsvpEnabled);

  const headcount = guests.reduce((sum, g) => {
    if (g.rsvp === "NO") return sum;
    return sum + 1 + (g.plusOnes || 0);
  }, 0);
  const yes = guests.filter((g) => g.rsvp === "YES").length;
  const pending = guests.filter((g) =>
    ["UNKNOWN", "INVITED", "MAYBE"].includes(g.rsvp)
  ).length;

  const tableNames = Array.from(
    new Set([
      ...tables.map((t) => t.name),
      ...guests.map((g) => g.tableLabel).filter(Boolean) as string[],
    ])
  ).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guests</h1>
          <p className="mt-1 text-sm text-slate-600">
            Select multiple guests for bulk RSVP, seating, side, or delete. Or send the{" "}
            <Link href="/site" className="underline">
              guest site
            </Link>{" "}
            so they reply themselves.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportCsvButton
            guests={guests.map((g) => ({
              name: g.name,
              email: g.email,
              side: g.side,
              rsvp: g.rsvp,
              plusOnes: g.plusOnes,
              dietary: g.dietary,
              tableLabel: g.tableLabel,
              notes: g.notes,
              address: g.address,
              city: g.city,
              region: g.region,
              postal: g.postal,
            }))}
          />
          <Link
            href="/guests/import"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Import CSV
          </Link>
          <Link
            href="/guests/new"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add guest
          </Link>
        </div>
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

      {guests.length > 0 && <NudgePanel />}

      {guests.length === 0 ? (
        <EmptyState
          title="No guests yet"
          body="Add people one by one or import a CSV."
          primaryHref="/guests/new"
          primaryLabel="Add guest"
          secondaryHref="/guests/import"
          secondaryLabel="Import CSV"
        />
      ) : (
        <GuestFilters
          tableNames={tableNames}
          eventCols={rsvpEvents.map((e) => ({
            id: e.id,
            short: e.name.split(" ").slice(0, 2).join(" "),
          }))}
          guests={guests.map((g) => ({
            id: g.id,
            name: g.name,
            rsvp: g.rsvp,
            dietary: g.dietary,
            tableLabel: g.tableLabel,
            side: g.side,
            missingAddress: !hasMailingAddress(g),
            eventStatus: Object.fromEntries(
              rsvpEvents.map((e) => [e.id, rsvpMap[e.id]?.[g.id] || ""])
            ),
          }))}
        />
      )}
    </div>
  );
}

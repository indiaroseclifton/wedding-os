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
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ImportContacts } from "@/components/guests/ImportContacts";

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
      <RoomSubnav room="guests" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Guests</h1>
          <p className="mt-1 text-sm text-muted">
            {guests.length} people · {yes} attending · {pending} waiting
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
            className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory"
          >
            Add guest
          </Link>
        </div>
      </div>
      <ImportContacts />

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
            plusOnes: g.plusOnes,
            plusOneNames: g.plusOneNames,
            partyName: g.partyName,
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

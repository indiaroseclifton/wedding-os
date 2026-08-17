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
import { hasMailingAddress, holdingHeads, plateHeads } from "@/lib/data/guest-mail";
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

  const holding = guests.reduce((sum, g) => sum + holdingHeads(g), 0);
  const plates = guests.reduce((sum, g) => sum + plateHeads(g), 0);
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">People</p>
          <h1 className="mt-2 font-serif text-4xl">Guests</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportCsvButton
            guests={guests.map((g) => ({
              name: g.name,
              email: g.email,
              side: g.side,
              rsvp: g.rsvp,
              plusOnes: g.plusOnes,
              plusOneNames: g.plusOneNames,
              dietary: g.dietary,
              meal: g.meal,
              tableLabel: g.tableLabel,
              notes: g.notes,
              address: g.address,
              city: g.city,
              region: g.region,
              postal: g.postal,
              phone: g.phone,
              partyName: g.partyName,
              listTier: g.listTier,
            }))}
          />
          <Link href="/guests/import" className="btn btn-ghost">
            Import CSV
          </Link>
          <Link href="/guests/new" className="btn btn-primary">
            Add guest
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="panel p-4 text-center">
          <p className="font-serif text-3xl tabular-nums">{guests.length}</p>
          <p className="kicker mt-1">Invited</p>
        </div>
        <div className="panel p-4 text-center">
          <p className="font-serif text-3xl tabular-nums">{plates}</p>
          <p className="kicker mt-1">RSVP yes</p>
        </div>
        <div className="panel p-4 text-center">
          <p className="font-serif text-3xl tabular-nums">{pending}</p>
          <p className="kicker mt-1">Pending</p>
        </div>
        <div className="panel p-4 text-center">
          <p className="font-serif text-3xl tabular-nums">{holding}</p>
          <p className="kicker mt-1">Holding</p>
        </div>
      </div>
      <ImportContacts />

      {guests.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "People", value: String(guests.length) },
            { label: "Waiting", value: String(pending) },
            { label: "Holding", value: String(holding), hint: "Everyone but no" },
            { label: "Plates", value: String(plates), hint: "Yes + extras" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-line bg-surface px-3 py-3 text-center"
            >
              <p className="font-serif text-2xl text-ink">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
              {"hint" in s && s.hint ? <p className="text-[10px] text-muted">{s.hint}</p> : null}
            </div>
          ))}
        </div>
      )}

      {guests.length > 0 && <NudgePanel />}

      {guests.length === 0 ? (
        <EmptyState
          title="No guests yet"
          body="No one is on the list. A name is enough to start."
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
            meal: g.meal,
            listTier: g.listTier || "A",
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

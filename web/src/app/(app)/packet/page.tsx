import Link from "next/link";
import { ensureDemoWorkspace, getWorkspaceGuests, getWorkspaceTables } from "@/lib/data/workspace";
import { getDayOf } from "@/lib/data/dayof-store";
import { getWorkspaceMeta, listGuests } from "@/lib/data/store";
import { listVendors } from "@/lib/data/vendors-store";
import { dietarySections } from "@/lib/data/dietary";
import { ScheduleView } from "@/components/run-of-show/ScheduleView";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";
import { PacketClient } from "./PacketClient";

export default async function PacketPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [meta, dayOf, guests, tables, vendors] = await Promise.all([
    getWorkspaceMeta(workspace.id, DEMO_WORKSPACE.name),
    getDayOf(workspace.id),
    getWorkspaceGuests(workspace.id),
    getWorkspaceTables(workspace.id),
    listVendors(workspace.id),
  ]);
  const diet = dietarySections(await listGuests(workspace.id));
  const byTable = tables.map((t) => ({
    name: t.name,
    people: guests.filter((g) => g.tableLabel === t.name),
  }));
  const couple = meta.coupleNames || meta.name;
  const text = [
    couple,
    [meta.weddingDate, meta.location].filter(Boolean).join(" · "),
    dayOf.emergencyContact ? `Emergency: ${dayOf.emergencyContact}` : "",
    "",
    "VENDORS",
    ...vendors.map((v) => `${v.category}: ${v.name}${v.phone ? ` · ${v.phone}` : ""}`),
    "",
    "DIETARY",
    diet.dietary_summary,
    diet.dietary_detail,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <PacketClient text={text} couple={couple}>
      <header className="border-b border-line pb-4">
        <p className="text-xs uppercase tracking-wide text-muted">Day-of packet</p>
        <h2 className="font-serif text-2xl">{couple}</h2>
        <p className="text-sm text-muted">{[meta.weddingDate, meta.location].filter(Boolean).join(" · ")}</p>
        {dayOf.emergencyContact && <p className="mt-1 text-sm">Emergency: {dayOf.emergencyContact}</p>}
        {dayOf.weatherNote && <p className="text-sm">Weather: {dayOf.weatherNote}</p>}
      </header>

      <section data-packet="ros" className="print:break-before-page">
        <h3 className="mb-3 text-sm font-semibold">Run of show</h3>
        <ScheduleView slots={dayOf.schedule} view="all" />
      </section>

      <section data-packet="seating" className="print:break-before-page">
        <h3 className="mb-3 text-sm font-semibold">Seating</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {byTable.map((t) => (
            <div key={t.name} className="rounded-xl border border-line p-3">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted">{t.people.map((g) => g.name).join(", ") || "—"}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-packet="vendors" className="print:break-before-page">
        <h3 className="mb-3 text-sm font-semibold">Vendors</h3>
        <ul className="space-y-1 text-sm">
          {vendors.map((v) => (
            <li key={v.id}>
              {v.category}: {v.name}
              {v.phone ? ` · ${v.phone}` : ""}
              {v.email ? ` · ${v.email}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section data-packet="dietary" className="print:break-before-page">
        <h3 className="mb-3 text-sm font-semibold">Dietary · {diet.headcount} plates</h3>
        <p className="whitespace-pre-wrap text-sm">{diet.dietary_summary}</p>
        <p className="mt-2 whitespace-pre-wrap text-xs text-muted">{diet.dietary_detail}</p>
      </section>

      <p className="print:hidden text-xs text-muted">
        <Link href="/run-of-show" className="underline">
          Edit run of show
        </Link>
      </p>
    </PacketClient>
  );
}

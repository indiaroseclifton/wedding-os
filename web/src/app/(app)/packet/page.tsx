import Link from "next/link";
import { PrintButton } from "@/components/ui/PrintButton";
import { ensureDemoWorkspace, getWorkspaceGuests, getWorkspaceTables } from "@/lib/data/workspace";
import { getDayOf } from "@/lib/data/dayof-store";
import { getWorkspaceMeta, listGuests } from "@/lib/data/store";
import { listVendors } from "@/lib/data/vendors-store";
import { dietarySections } from "@/lib/data/dietary";
import { ScheduleView } from "@/components/run-of-show/ScheduleView";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";

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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Day-of packet</h1>
          <p className="mt-1 text-sm text-slate-600">
            Run of show, seating, vendors, dietary — print to PDF.
          </p>
        </div>
        <PrintButton label="Print / PDF" />
      </div>

      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Day-of packet</p>
        <h2 className="text-xl font-semibold">{meta.coupleNames || meta.name}</h2>
        <p className="text-sm text-slate-600">
          {[meta.weddingDate, meta.location].filter(Boolean).join(" · ")}
        </p>
        {dayOf.emergencyContact && (
          <p className="mt-1 text-sm">Emergency: {dayOf.emergencyContact}</p>
        )}
        {dayOf.weatherNote && <p className="text-sm">Weather: {dayOf.weatherNote}</p>}
      </header>

      <section className="print:break-before-page">
        <h3 className="mb-3 text-sm font-semibold">Run of show</h3>
        <ScheduleView slots={dayOf.schedule} view="all" />
      </section>

      <section className="print:break-before-page">
        <h3 className="mb-3 text-sm font-semibold">Seating</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {byTable.map((t) => (
            <div key={t.name} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-slate-600">
                {t.people.map((g) => g.name).join(", ") || "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="print:break-before-page">
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

      <section className="print:break-before-page">
        <h3 className="mb-3 text-sm font-semibold">Dietary · {diet.headcount} heads</h3>
        <p className="whitespace-pre-wrap text-sm">{diet.dietary_summary}</p>
        <p className="mt-2 whitespace-pre-wrap text-xs text-slate-600">{diet.dietary_detail}</p>
      </section>

      <p className="print:hidden text-xs text-slate-500">
        <Link href="/run-of-show" className="underline">
          Edit run of show
        </Link>
      </p>
    </div>
  );
}

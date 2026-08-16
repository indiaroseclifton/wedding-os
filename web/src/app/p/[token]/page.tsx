import { notFound } from "next/navigation";
import { PrintButton } from "@/components/ui/PrintButton";
import { SECTION_LABELS } from "@/lib/data/handoffs-store";
import { ScheduleView } from "@/components/run-of-show/ScheduleView";
import { loadVendorPortal } from "@/lib/data/vendor-portal";

function prettyDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function VendorPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await loadVendorPortal(token);
  if (!data) notFound();
  const { pkg, meta, schedule, emergencyContact, sections, liveKeys } = data;
  const names = meta.coupleNames || meta.name;

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Vendor portal
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{pkg.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {names}
              {prettyDate(meta.weddingDate) ? ` · ${prettyDate(meta.weddingDate)}` : ""}
              {meta.location ? ` · ${meta.location}` : ""}
            </p>
            {pkg.recipientName && (
              <p className="text-sm text-slate-500">For {pkg.recipientName}</p>
            )}
          </div>
          <PrintButton />
        </div>

        {schedule.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 print:break-inside-avoid">
            <h2 className="mb-3 text-sm font-semibold">Run of show</h2>
            <ScheduleView slots={schedule} view="vendor" />
          </section>
        )}

        <div className="space-y-4">
          {Object.entries(sections || {}).map(([key, value]) => (
            <section
              key={key}
              className="rounded-xl border border-slate-200 bg-white p-4 print:break-inside-avoid"
            >
              <h2 className="text-sm font-semibold text-slate-900">
                {SECTION_LABELS[key] || key}
                {liveKeys.includes(key) && (
                  <span className="ml-2 text-xs font-normal text-emerald-700">live</span>
                )}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {value?.trim() ? value : "—"}
              </p>
            </section>
          ))}
        </div>

        {emergencyContact && (
          <p className="text-sm text-slate-600">Day-of contact: {emergencyContact}</p>
        )}

        <p className="text-xs text-slate-400 print:hidden">
          Read-only vendor view. Headcount, dietary, music, and vendor list stay current.
        </p>
      </div>
    </div>
  );
}

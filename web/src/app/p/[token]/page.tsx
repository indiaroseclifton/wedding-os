import { notFound } from "next/navigation";
import {
  getPackageByToken,
  SECTION_LABELS,
} from "@/lib/data/handoffs-store";

export default async function PublicHandoffPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const pkg = await getPackageByToken(token);
  if (!pkg) notFound();

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Handoff package
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{pkg.title}</h1>
          {pkg.recipientName && (
            <p className="mt-1 text-sm text-slate-600">For {pkg.recipientName}</p>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(pkg.sections || {}).map(([key, value]) => (
            <section
              key={key}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <h2 className="text-sm font-semibold text-slate-900">
                {SECTION_LABELS[key] || key}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {value?.trim() ? value : "—"}
              </p>
            </section>
          ))}
        </div>

        <p className="text-xs text-slate-400">Read-only vendor view · Wedding OS</p>
      </div>
    </div>
  );
}

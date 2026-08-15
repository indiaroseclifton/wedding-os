import Link from "next/link";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { PrintButton } from "@/components/ui/PrintButton";

export default async function DietaryPage() {
  const { workspace } = await ensureDemoWorkspace();
  const guests = await getWorkspaceGuests(workspace.id);
  const attending = guests.filter((g) => g.rsvp !== "NO");
  const withDiet = attending.filter((g) => g.dietary && g.dietary.trim());
  const none = attending.length - withDiet.length;

  const counts = new Map<string, number>();
  for (const g of withDiet) {
    const key = g.dietary!.trim().toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1 + (g.plusOnes || 0));
  }
  const summary = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dietary rollup</h1>
          <p className="mt-1 text-sm text-slate-600">
            Auto-built from the guest list for catering handoffs.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <PrintButton />
          <Link
            href="/guests"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
          >
            Guest list
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{attending.length}</p>
          <p className="text-xs text-slate-500">Attending records</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{withDiet.length}</p>
          <p className="text-xs text-slate-500">With dietary notes</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{none}</p>
          <p className="text-xs text-slate-500">No note</p>
        </div>
      </div>

      {summary.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Summary counts
          </p>
          <ul className="mt-3 space-y-2">
            {summary.map((s) => (
              <li key={s.label} className="flex justify-between text-sm">
                <span className="capitalize">{s.label}</span>
                <span className="font-medium">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {withDiet.map((g) => (
          <li key={g.id} className="px-4 py-3 text-sm">
            <p className="font-medium">{g.name}</p>
            <p className="text-xs text-slate-600">
              {g.dietary}
              {g.tableLabel ? ` · ${g.tableLabel}` : ""}
              {g.plusOnes ? ` · +${g.plusOnes}` : ""}
            </p>
          </li>
        ))}
        {!withDiet.length && (
          <li className="px-4 py-8 text-center text-sm text-slate-500">
            No dietary notes yet. Add them on each guest.
          </li>
        )}
      </ul>
    </div>
  );
}

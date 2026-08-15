import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { listPackages } from "@/lib/data/handoffs-store";

export default async function HandoffsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const packages = await listPackages(workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Handoffs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Packages for the DJ, day-of coordinator, or photographer — one link instead of email threads.
          </p>
        </div>
        <Link
          href="/handoffs/new"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New package
        </Link>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          title="No handoff packages yet"
          body="Create a DJ, day-of, or photographer package, fill the sections, then share a link."
          primaryHref="/handoffs/new"
          primaryLabel="New package"
        />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {packages.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{p.title}</p>
                <p className="text-xs text-slate-500">
                  {p.template.replace("_", " ")}
                  {p.recipientName ? ` · ${p.recipientName}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} />
                <Link href={`/handoffs/${p.id}`} className="text-xs font-medium underline">
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

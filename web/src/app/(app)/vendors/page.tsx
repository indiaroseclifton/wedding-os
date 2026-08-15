import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";

export default async function VendorsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const vendors = await listVendors(workspace.id);
  const booked = vendors.filter((v) =>
    ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(v.status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
          <p className="mt-1 text-sm text-slate-600">
            Contacts, status, and notes in one place — no spreadsheet chase.
          </p>
        </div>
        <Link
          href="/vendors/new"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add vendor
        </Link>
      </div>

      {vendors.length > 0 && (
        <p className="text-xs text-slate-500">
          {vendors.length} total · {booked} booked / deposit / done
        </p>
      )}

      {vendors.length === 0 ? (
        <EmptyState
          title="No vendors yet"
          body="Add photographers, venues, florists, and anyone else you are coordinating with."
          primaryHref="/vendors/new"
          primaryLabel="Add vendor"
        />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {vendors.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{v.name}</p>
                <p className="text-xs text-slate-500">
                  {v.category}
                  {v.email ? ` · ${v.email}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={v.status} />
                <Link href={`/vendors/${v.id}`} className="text-xs font-medium underline">
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

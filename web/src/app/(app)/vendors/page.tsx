import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { reviewHint } from "@/lib/data/contract-review";
import { listPayments, paymentsForVendor } from "@/lib/data/payments-store";
import { VendorsClient } from "./VendorsClient";

export default async function VendorsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const vendors = await listVendors(workspace.id);
  const payments = await listPayments(workspace.id);
  const booked = vendors.filter((v) =>
    ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(v.status)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Vendors</h1>
          <p className="mt-1 text-sm text-muted">
            {vendors.length} total · {booked} booked
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/vendors/browse"
            className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory hover:bg-moss/90"
          >
            Browse directory
          </Link>
          <Link
            href="/vendors/new"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
          >
            Add your own
          </Link>
        </div>
      </div>

      {vendors.length > 0 && (
        <p className="text-xs text-slate-500">
          {vendors.length} total · {booked} booked / deposit / done
        </p>
      )}

      {vendors.length === 0 ? (
        <EmptyState
          title="No vendors on this wedding yet"
          body="Browse the directory (florist, photo, venue, DJ…) or add someone you already hired."
          primaryHref="/vendors/browse"
          primaryLabel="Browse vendors"
        />
      ) : (
        <VendorsClient
          vendors={vendors.map((v) => {
            const mine = paymentsForVendor(payments, v);
            const dep = mine.find((p) => p.kind === "DEPOSIT");
            let moneyHint = "";
            if (dep?.status === "PAID") moneyHint = "deposit paid";
            else if (dep?.dueDate) moneyHint = `deposit due ${dep.dueDate}`;
            else if (dep) moneyHint = "deposit logged";
            else if (v.contractUrl) moneyHint = "contract attached";
            const review = reviewHint(v.contractReview);
            if (review) moneyHint = moneyHint ? `${moneyHint} · ${review}` : review;
            return {
              id: v.id,
              name: v.name,
              category: v.category,
              status: v.status,
              email: v.email,
              moneyHint,
            };
          })}
        />
      )}
    </div>
  );
}

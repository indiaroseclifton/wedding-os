import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { reviewHint } from "@/lib/data/contract-review";
import { listPayments, paymentsForVendor, vendorMoneyHint } from "@/lib/data/payments-store";
import { listSends } from "@/lib/data/sends-store";
import { sendStrip } from "@/lib/send/status";
import { faceLine } from "@/lib/vendor-face";
import { VendorsClient } from "./VendorsClient";

export default async function VendorsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const vendors = await listVendors(workspace.id);
  const payments = await listPayments(workspace.id);
  const sends = await listSends(workspace.id);
  const sendBy = new Map(sends.map((s) => [s.vendorId, s]));
  const booked = vendors.filter((v) =>
    ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(v.status)
  ).length;

  return (
    <div className="paper">
      <div className="span-12">
        <RoomSubnav room="vendors" />
      </div>
      <header className="span-8">
        <h1 className="title">Vendors</h1>
        <p className="deck mt-2">
          {vendors.length} total · {booked} booked
        </p>
      </header>
      <div className="span-4 flex flex-wrap gap-2 lg:justify-end">
        <Link
          href="/vendors/browse"
          className="btn btn-primary"
        >
          Browse directory
        </Link>
        <Link
          href="/vendors/new"
          className="btn btn-ghost"
        >
          Add your own
        </Link>
      </div>

      {vendors.length === 0 ? (
        <div className="span-12">
          <EmptyState
            title="No vendors on this wedding yet"
            body="Browse the directory (florist, photo, venue, DJ…) or add someone you already hired."
            primaryHref="/vendors/browse"
            primaryLabel="Browse vendors"
          />
        </div>
      ) : (
        <>
          <div className="span-8">
            <VendorsClient
              vendors={vendors.map((v) => {
                const mine = paymentsForVendor(payments, v);
                let moneyHint = vendorMoneyHint(mine);
                if (!moneyHint && v.contractUrl) moneyHint = "contract attached";
                const review = reviewHint(v.contractReview);
                if (review) moneyHint = moneyHint ? `${moneyHint} · ${review}` : review;
                const strip = sendStrip(sendBy.get(v.id)).line;
                const hint = faceLine(v.face, v.category);
                return {
                  id: v.id,
                  name: v.name,
                  category: v.category,
                  status: v.status,
                  email: v.email,
                  moneyHint,
                  strip,
                  faceHint: hint,
                };
              })}
            />
          </div>
          <aside className="span-4 space-y-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1">
            <p className="kicker">On the books</p>
            <p className="figure">{booked}</p>
            <p className="text-sm text-muted">booked of {vendors.length}</p>
            <Link href="/vendors/contracts" className="inline-block text-sm underline underline-offset-4">
              Contracts
            </Link>
          </aside>
        </>
      )}
    </div>
  );
}

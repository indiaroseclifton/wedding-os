import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { listPayments, paymentsForVendor } from "@/lib/data/payments-store";
import { flagCount } from "@/lib/data/contract-review";
import { ContractsDesk } from "@/components/vendors/ContractsDesk";

export default async function VendorContractsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const vendors = await listVendors(workspace.id);
  const payments = await listPayments(workspace.id);

  const rows = vendors.map((v) => {
    const pay = paymentsForVendor(payments, v);
    const deposit = pay.find((p) => p.kind === "DEPOSIT");
    const flags = flagCount(v.contractReview);
    return {
      id: v.id,
      name: v.name,
      category: v.category,
      status: v.status,
      contractUrl: v.contractUrl || "",
      signedAt: v.contractReview?.signedAt || "",
      reviewedAt: v.contractReview?.reviewedAt || "",
      flags,
      namedLead: v.contractReview?.namedLead || "",
      depositDue: deposit?.dueDate || "",
      depositPaid: deposit?.status === "PAID",
      depositAmt: deposit?.amount || 0,
    };
  });

  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <div>
        <p className="kicker kicker-moss">Vendors</p>
        <h1 className="mt-1 font-serif text-4xl">Contracts</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          One desk for every agreement — who signed, what’s flagged, what’s still just a handshake.
        </p>
      </div>
      <ContractsDesk rows={rows} />
    </div>
  );
}

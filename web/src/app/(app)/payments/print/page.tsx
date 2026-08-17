import Link from "next/link";
import { PrintButton } from "@/components/ui/PrintButton";
import { ensureDemoWorkspace, loadWorkspaceMeta } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import {
  effectiveStatus,
  listPayments,
  paymentRollup,
  paymentVendorKey,
  resolvePaymentVendorName,
} from "@/lib/data/payments-store";
import { money } from "@/lib/budget-envelopes";

export default async function PaymentStatementPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [meta, payments, vendors] = await Promise.all([
    loadWorkspaceMeta(workspace.id, workspace.name),
    listPayments(workspace.id),
    listVendors(workspace.id),
  ]);
  const rows = payments.map((p) => ({
    ...p,
    status: effectiveStatus(p),
    name: resolvePaymentVendorName(p, vendors),
  }));
  const rollup = paymentRollup(rows);
  const groups = new Map<string, typeof rows>();
  for (const p of rows) {
    const key = paymentVendorKey(p);
    const list = groups.get(key) || [];
    list.push(p);
    groups.set(key, list);
  }
  const vendorsOut = Array.from(groups.entries()).sort((a, b) =>
    a[1][0].name.localeCompare(b[1][0].name)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <p className="kicker kicker-moss">Vendor ledger</p>
          <h1 className="mt-1 font-serif text-4xl">Statement</h1>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print statement" />
          <Link href="/payments" className="rounded-full border border-line px-4 py-2 text-sm">
            Back
          </Link>
        </div>
      </div>

      <header className="hidden print:block">
        <p className="kicker kicker-moss">Vendor ledger</p>
        <h1 className="mt-1 font-serif text-4xl">{meta.coupleNames || meta.name || "Wedding"}</h1>
        <p className="mt-1 text-sm text-muted">
          {meta.weddingDate || ""}
          {meta.location ? ` · ${meta.location}` : ""}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <p className="rounded-2xl border border-line bg-surface p-4">
          <span className="block kicker">Paid</span>
          <span className="font-serif text-3xl">{money(rollup.paid)}</span>
        </p>
        <p className="rounded-2xl border border-line bg-surface p-4">
          <span className="block kicker">Still open</span>
          <span className="font-serif text-3xl">{money(rollup.open)}</span>
        </p>
        <p className="rounded-2xl border border-line bg-surface p-4">
          <span className="block kicker">Overdue</span>
          <span className={`font-serif text-3xl ${rollup.overdue ? "text-clay" : ""}`}>
            {money(rollup.overdue)}
          </span>
        </p>
      </section>

      {vendorsOut.map(([key, list]) => {
        const total = list.reduce((s, p) => s + p.amount, 0);
        const settled = list.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
        return (
          <section key={key} className="break-inside-avoid">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-2xl">{list[0].name}</h2>
              <p className="text-xs text-muted">
                {money(settled)} paid of {money(total)}
              </p>
            </div>
            <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
              {list.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.label}</p>
                    <p className="text-xs text-muted">
                      {p.kind || "OTHER"}
                      {p.dueDate ? ` · due ${p.dueDate}` : ""}
                      {p.paidAt ? ` · paid ${p.paidAt.slice(0, 10)}` : ""}
                      {p.status === "OVERDUE" ? " · overdue" : ""}
                    </p>
                  </div>
                  <p className="tabular-nums">
                    {money(p.amount)}
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-muted">{p.status}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {!rows.length && <p className="text-sm text-muted">No payments on the ledger yet.</p>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Vendor = {
  id: string;
  name: string;
  category: string;
  status: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  contractUrl?: string;
};

type Payment = {
  id: string;
  vendorId?: string;
  vendorName: string;
  label: string;
  kind?: string;
  amount: number;
  dueDate?: string;
  status: string;
  contractLink?: string;
};

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [contractUrl, setContractUrl] = useState("");
  const [deposit, setDeposit] = useState("");
  const [depositDue, setDepositDue] = useState("");
  const [depositPaid, setDepositPaid] = useState(false);
  const [finalAmt, setFinalAmt] = useState("");
  const [finalDue, setFinalDue] = useState("");
  const [finalPaid, setFinalPaid] = useState(false);
  const [busy, setBusy] = useState(false);

  function apply(data: { vendor?: Vendor; payments?: Payment[] }) {
    if (data.vendor) {
      setVendor(data.vendor);
      setContractUrl(data.vendor.contractUrl || "");
    }
    if (data.payments) {
      setPayments(data.payments);
      const dep = data.payments.find((p) => p.kind === "DEPOSIT");
      const fin = data.payments.find((p) => p.kind === "FINAL");
      if (dep) {
        setDeposit(String(dep.amount));
        setDepositDue(dep.dueDate || "");
        setDepositPaid(dep.status === "PAID");
        if (!data.vendor?.contractUrl && dep.contractLink) setContractUrl(dep.contractLink);
      }
      if (fin) {
        setFinalAmt(String(fin.amount));
        setFinalDue(fin.dueDate || "");
        setFinalPaid(fin.status === "PAID");
      }
    }
  }

  useEffect(() => {
    fetch(`/api/vendors/${id}`)
      .then(async (vr) => {
        if (!vr.ok) throw new Error("Vendor not found");
        apply(await vr.json());
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function saveMoney(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/vendors/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "money",
        contractUrl,
        deposit,
        depositDue,
        depositPaid,
        final: finalAmt,
        finalDue,
        finalPaid,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Could not save");
      return;
    }
    apply(data);
    setMsg("Saved — also on Payments and Budget");
  }

  async function markPaid(paymentId: string) {
    const res = await fetch(`/api/vendors/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pay", paymentId, status: "PAID" }),
    });
    if (res.ok) apply(await res.json());
  }

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!vendor) return <p className="text-sm text-slate-600">Loading…</p>;

  const openPay = payments.filter((p) => p.status !== "PAID").reduce((s, p) => s + p.amount, 0);
  const depositRow = payments.find((p) => p.kind === "DEPOSIT");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/vendors" className="text-xs underline">
          All vendors
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{vendor.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {vendor.category} · {vendor.status.replaceAll("_", " ")}
          {depositRow
            ? depositRow.status === "PAID"
              ? " · deposit paid"
              : depositRow.dueDate
                ? ` · deposit due ${depositRow.dueDate}`
                : " · deposit logged"
            : ""}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm space-y-2">
        {vendor.email && <p>Email: {vendor.email}</p>}
        {vendor.phone && <p>Phone: {vendor.phone}</p>}
        {vendor.website && (
          <p>
            Site:{" "}
            <a href={vendor.website} className="underline" target="_blank" rel="noreferrer">
              {vendor.website}
            </a>
          </p>
        )}
        {vendor.notes && <p className="text-slate-600">{vendor.notes}</p>}
        {!vendor.email && !vendor.phone && !vendor.notes && !vendor.website && (
          <p className="text-slate-500">No contact details yet.</p>
        )}
      </div>

      <form onSubmit={saveMoney} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold">Contract & money</p>
        <label className="block text-sm">
          Contract link
          <input
            value={contractUrl}
            onChange={(e) => setContractUrl(e.target.value)}
            placeholder="Google Drive, Dropbox, HelloSign…"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            Deposit $
            <input
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Due
            <input
              value={depositDue}
              onChange={(e) => setDepositDue(e.target.value)}
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={depositPaid}
            onChange={(e) => setDepositPaid(e.target.checked)}
          />
          Deposit paid
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            Final $
            <input
              value={finalAmt}
              onChange={(e) => setFinalAmt(e.target.value)}
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Due
            <input
              value={finalDue}
              onChange={(e) => setFinalDue(e.target.value)}
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={finalPaid} onChange={(e) => setFinalPaid(e.target.checked)} />
          Final paid
        </label>
        {msg && <p className="text-xs text-slate-500">{msg}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save contract & payments"}
        </button>
      </form>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Payments</p>
          <Link href="/payments" className="text-xs underline">
            All payments
          </Link>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Open for this vendor: ${openPay.toLocaleString()}
        </p>
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>
                {p.label}
                {p.dueDate ? ` · ${p.dueDate}` : ""}
                {p.contractLink ? (
                  <>
                    {" · "}
                    <a href={p.contractLink} className="underline" target="_blank" rel="noreferrer">
                      contract
                    </a>
                  </>
                ) : null}
              </span>
              <span className="flex items-center gap-2">
                ${p.amount.toLocaleString()} · {p.status}
                {p.status !== "PAID" && (
                  <button type="button" onClick={() => markPaid(p.id)} className="text-xs underline">
                    Mark paid
                  </button>
                )}
              </span>
            </li>
          ))}
          {!payments.length && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">
              Save a deposit above — it stays if you rename this vendor.
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium">Coordination next</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
          <li>
            <Link href="/handoffs" className="underline">
              Build a handoff
            </Link>{" "}
            so they get one package, not a thread.
          </li>
          <li>
            <Link href="/run-of-show" className="underline">
              Put their call time on the run of show
            </Link>
            .
          </li>
        </ul>
      </div>
    </div>
  );
}

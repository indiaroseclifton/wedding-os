"use client";

import { useEffect, useMemo, useState } from "react";

type Payment = {
  id: string;
  vendorId?: string;
  vendorName: string;
  label: string;
  kind?: string;
  amount: number;
  dueDate?: string;
  status: string;
  paidAt?: string;
  contractLink?: string;
};

type Vendor = { id: string; name: string };

function isOverdue(p: Payment) {
  if (p.status === "PAID") return false;
  if (p.status === "OVERDUE") return true;
  if (!p.dueDate) return false;
  const due = new Date(p.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function vendorKey(p: Payment) {
  return p.vendorId || `name:${p.vendorName}`;
}

function vendorLabel(p: Payment, vendors: Vendor[]) {
  if (p.vendorId) {
    const match = vendors.find((v) => v.id === p.vendorId);
    if (match) return match.name;
  }
  return p.vendorName;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [label, setLabel] = useState("Deposit");
  const [kind, setKind] = useState("DEPOSIT");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");

  async function load() {
    const [payRes, venRes] = await Promise.all([
      fetch("/api/payments"),
      fetch("/api/vendors"),
    ]);
    if (payRes.ok) {
      const data = await payRes.json();
      setPayments(data.payments || []);
    }
    if (venRes.ok) {
      const data = await venRes.json();
      setVendors(data.vendors || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId: vendorId || undefined,
        vendorName,
        label,
        amount,
        dueDate,
        kind,
      }),
    });
    if (res.ok) {
      setVendorName("");
      setVendorId("");
      setAmount(0);
      setDueDate("");
      load();
    }
  }

  async function setStatus(id: string, status: string) {
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", id, status }),
    });
    load();
  }

  function addFinalForVendor(rows: Payment[]) {
    const first = rows[0];
    if (!first) return;
    setVendorId(first.vendorId || "");
    setVendorName(vendorLabel(first, vendors));
    setLabel("Final balance");
    setKind("FINAL");
  }

  const outstanding = payments
    .filter((p) => p.status !== "PAID")
    .reduce((s, p) => s + (p.amount || 0), 0);
  const paid = payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const byVendor = useMemo(() => {
    const map = new Map<string, Payment[]>();
    for (const p of payments) {
      const key = vendorKey(p);
      const list = map.get(key) || [];
      list.push(p);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) =>
      vendorLabel(a[1][0], vendors).localeCompare(vendorLabel(b[1][0], vendors)),
    );
  }, [payments, vendors]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-slate-600">
          Deposit → final by vendor. Payments stay with a vendor even if you rename them.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          Outstanding{" "}
          <span className="font-semibold">${outstanding.toLocaleString()}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          Paid <span className="font-semibold">${paid.toLocaleString()}</span>
        </div>
      </div>

      <form
        onSubmit={add}
        className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2"
      >
        <select
          value={vendorId}
          onChange={(e) => {
            const next = e.target.value;
            setVendorId(next);
            const match = vendors.find((v) => v.id === next);
            if (match) setVendorName(match.name);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Vendor (type a name if not listed)</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <input
          value={vendorName}
          onChange={(e) => {
            setVendorName(e.target.value);
            if (vendorId) setVendorId("");
          }}
          required={!vendorId}
          placeholder="Vendor name"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            if (e.target.value === "DEPOSIT") setLabel("Deposit");
            if (e.target.value === "FINAL") setLabel("Final balance");
            if (e.target.value === "OTHER") setLabel("Payment");
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="DEPOSIT">Deposit</option>
          <option value="FINAL">Final</option>
          <option value="OTHER">Other</option>
        </select>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          placeholder="Label"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          placeholder="Amount"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          type="date"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white sm:col-span-2"
        >
          Add payment
        </button>
      </form>

      <div className="space-y-4">
        {byVendor.map(([key, rows]) => {
          const name = vendorLabel(rows[0], vendors);
          const open = rows.filter((p) => p.status !== "PAID");
          const hasFinal = rows.some((p) => p.kind === "FINAL" || /final/i.test(p.label));
          return (
            <div key={key} className="rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-slate-500">
                    {open.length} open · {rows.length} total
                  </p>
                </div>
                {!hasFinal && (
                  <button
                    type="button"
                    onClick={() => addFinalForVendor(rows)}
                    className="text-xs font-medium underline"
                  >
                    + Final balance
                  </button>
                )}
              </div>
              <ul className="divide-y divide-slate-100">
                {rows.map((p) => {
                  const overdue = isOverdue(p);
                  return (
                    <li
                      key={p.id}
                      className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm ${
                        overdue ? "bg-rose-50" : ""
                      }`}
                    >
                      <div>
                        <p className="font-medium">
                          {p.label}
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400">
                            {p.kind || "OTHER"}
                          </span>
                        </p>
                        <p
                          className={`text-xs ${
                            overdue ? "font-medium text-rose-700" : "text-slate-500"
                          }`}
                        >
                          ${p.amount.toLocaleString()}
                          {p.dueDate ? ` · due ${p.dueDate}` : ""}
                          {p.paidAt ? ` · paid ${p.paidAt.slice(0, 10)}` : ""}
                          {overdue ? " · overdue" : ""}
                          {p.contractLink ? (
                            <>
                              {" · "}
                              <a href={p.contractLink} className="underline" target="_blank" rel="noreferrer">
                                contract
                              </a>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <select
                        value={p.status}
                        onChange={(e) => setStatus(p.id, e.target.value)}
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                      >
                        <option value="UPCOMING">Upcoming</option>
                        <option value="DUE">Due</option>
                        <option value="PAID">Paid</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {!payments.length && (
          <p className="text-center text-sm text-slate-500">No payments yet</p>
        )}
      </div>
    </div>
  );
}

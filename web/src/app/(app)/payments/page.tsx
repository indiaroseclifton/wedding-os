"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  vendorName: string;
  label: string;
  amount: number;
  dueDate?: string;
  status: string;
  contractLink?: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [vendorName, setVendorName] = useState("");
  const [label, setLabel] = useState("Deposit");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");

  async function load() {
    const res = await fetch("/api/payments");
    if (res.ok) {
      const data = await res.json();
      setPayments(data.payments || []);
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
      body: JSON.stringify({ vendorName, label, amount, dueDate }),
    });
    if (res.ok) {
      setVendorName("");
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

  const outstanding = payments
    .filter((p) => p.status !== "PAID")
    .reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-slate-600">
          Deposits, final balances, and contract links by vendor.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
        Outstanding (not paid): <span className="font-semibold">${outstanding.toLocaleString()}</span>
      </div>

      <form onSubmit={add} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <input value={vendorName} onChange={(e) => setVendorName(e.target.value)} required placeholder="Vendor" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input value={label} onChange={(e) => setLabel(e.target.value)} required placeholder="Deposit / final" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} placeholder="Amount" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="Due date" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white sm:col-span-2">
          Add payment
        </button>
      </form>

      <ul className="space-y-2">
        {payments.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{p.vendorName} · {p.label}</p>
              <p className="text-xs text-slate-500">
                ${p.amount.toLocaleString()}
                {p.dueDate ? ` · due ${p.dueDate}` : ""}
              </p>
            </div>
            <select value={p.status} onChange={(e) => setStatus(p.id, e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
              <option value="UPCOMING">Upcoming</option>
              <option value="DUE">Due</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}

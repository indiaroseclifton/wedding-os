"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { FileUpload } from "@/components/ui/FileUpload";
import { money } from "@/lib/budget-envelopes";

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
  receiptUrl?: string;
};

type Vendor = { id: string; name: string; category?: string };
type Filter = "all" | "overdue" | "due" | "paid";

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
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editAmt, setEditAmt] = useState("");
  const [editDue, setEditDue] = useState("");

  async function load() {
    const res = await fetch("/api/payments");
    if (!res.ok) return;
    const data = await res.json();
    setPayments(data.payments || []);
    setVendors(data.vendors || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId: vendorId || undefined,
        vendorName,
        label,
        amount: Number(amount) || 0,
        dueDate,
        kind,
      }),
    });
    if (res.ok) {
      setVendorName("");
      setVendorId("");
      setAmount("");
      setDueDate("");
      setMsg("Added to the ledger");
      load();
    } else setMsg("Could not add");
  }

  async function setStatus(id: string, status: string) {
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", id, status }),
    });
    load();
  }

  async function attachReceipt(id: string, url: string) {
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "receipt", id, receiptUrl: url }),
    });
    setMsg("Receipt attached");
    load();
  }

  function startEdit(p: Payment) {
    setEditing(p.id);
    setEditAmt(String(p.amount));
    setEditDue(p.dueDate || "");
  }

  async function saveEdit(id: string) {
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, amount: Number(editAmt) || 0, dueDate: editDue }),
    });
    setEditing(null);
    setMsg("Updated");
    load();
  }

  async function remove(id: string) {
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    setMsg("Removed");
    load();
  }

  const visible = useMemo(() => {
    return payments.filter((p) => {
      if (filter === "overdue") return p.status === "OVERDUE";
      if (filter === "due") return p.status === "DUE" || p.status === "UPCOMING";
      if (filter === "paid") return p.status === "PAID";
      return true;
    });
  }, [payments, filter]);

  const byVendor = useMemo(() => {
    const map = new Map<string, Payment[]>();
    for (const p of visible) {
      const key = vendorKey(p);
      const list = map.get(key) || [];
      list.push(p);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) =>
      vendorLabel(a[1][0], vendors).localeCompare(vendorLabel(b[1][0], vendors))
    );
  }, [visible, vendors]);

  const paid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const open = payments.filter((p) => p.status !== "PAID").reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter((p) => p.status === "OVERDUE").reduce((s, p) => s + p.amount, 0);
  const next = payments
    .filter((p) => p.status !== "PAID" && p.dueDate)
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))[0];

  return (
    <div className="space-y-6">
      <RoomSubnav room="vendors" />
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <p className="kicker kicker-moss">Vendor ledger</p>
          <h1 className="mt-1 font-serif text-4xl">Payments</h1>
          <p className="mt-1 text-sm text-muted">
            Deposit, progress, final — by vendor. Paid rolls into the budget. Due dates land on the calendar.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/payments/print"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm"
          >
            Print statement
          </Link>
          <Link href="/budget" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm">
            Budget
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <p className="glass-panel rounded-2xl p-4">
          <span className="block kicker">Paid</span>
          <span className="font-serif text-3xl">{money(paid)}</span>
        </p>
        <p className="glass-panel rounded-2xl p-4">
          <span className="block kicker">Still open</span>
          <span className="font-serif text-3xl">{money(open)}</span>
        </p>
        <p className="glass-panel rounded-2xl p-4">
          <span className="block kicker">Overdue</span>
          <span className={`font-serif text-3xl ${overdue ? "text-clay" : ""}`}>{money(overdue)}</span>
        </p>
        <p className="glass-panel rounded-2xl p-4">
          <span className="block kicker">Next due</span>
          <span className="font-serif text-2xl leading-tight">
            {next ? next.dueDate : "—"}
          </span>
          {next && <span className="mt-1 block text-xs text-muted">{next.label} · {vendorLabel(next, vendors)}</span>}
        </p>
      </div>

      <form onSubmit={add} className="glass-panel grid gap-2 rounded-2xl p-4 sm:grid-cols-2 print:hidden">
        <select
          value={vendorId}
          onChange={(e) => {
            const nextId = e.target.value;
            setVendorId(nextId);
            const match = vendors.find((v) => v.id === nextId);
            if (match) setVendorName(match.name);
          }}
          className="min-h-11 rounded-xl border border-line px-3 text-sm"
        >
          <option value="">Pick a vendor</option>
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
          placeholder="Or type a name"
          className="min-h-11 rounded-xl border border-line px-3 text-sm"
        />
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            if (e.target.value === "DEPOSIT") setLabel("Deposit");
            if (e.target.value === "PROGRESS") setLabel("Progress");
            if (e.target.value === "FINAL") setLabel("Final balance");
            if (e.target.value === "OTHER") setLabel("Payment");
          }}
          className="min-h-11 rounded-xl border border-line px-3 text-sm"
        >
          <option value="DEPOSIT">Deposit</option>
          <option value="PROGRESS">Progress</option>
          <option value="FINAL">Final</option>
          <option value="OTHER">Other</option>
        </select>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          placeholder="Label"
          className="min-h-11 rounded-xl border border-line px-3 text-sm"
        />
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="min-h-11 rounded-xl border border-line px-3 text-sm"
        />
        <input
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          type="date"
          className="min-h-11 rounded-xl border border-line px-3 text-sm"
        />
        <button type="submit" className="min-h-11 rounded-full bg-moss px-4 text-sm text-ivory sm:col-span-2">
          Add to ledger
        </button>
        {msg && (
          <p role="status" className="text-xs text-moss sm:col-span-2">
            {msg}
          </p>
        )}
      </form>

      <div className="flex flex-wrap gap-2 print:hidden">
        {(
          [
            ["all", "All"],
            ["overdue", "Overdue"],
            ["due", "Open"],
            ["paid", "Paid"],
          ] as const
        ).map(([id, name]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`min-h-11 rounded-full px-3 text-xs ${
              filter === id ? "bg-moss text-ivory" : "border border-line"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {byVendor.map(([key, rows]) => {
          const name = vendorLabel(rows[0], vendors);
          const all = payments.filter((p) => vendorKey(p) === key);
          const total = all.reduce((s, p) => s + p.amount, 0);
          const settled = all.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
          const pct = total ? Math.round((settled / total) * 100) : 0;
          const href = rows[0].vendorId ? `/vendors/${rows[0].vendorId}` : "/vendors";
          return (
            <section key={key} className="overflow-hidden rounded-2xl border border-line bg-surface/70">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                <div>
                  <Link href={href} scroll={false} className="font-serif text-2xl">
                    {name}
                  </Link>
                  <p className="text-xs text-muted">
                    {money(settled)} paid of {money(total)} · {pct}%
                  </p>
                </div>
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line">
                  <div className="h-full bg-moss" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <ul className="divide-y divide-line">
                {rows.map((p) => (
                  <li
                    key={p.id}
                    className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm ${
                      p.status === "OVERDUE" ? "bg-clay/10" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium">
                        {p.label}
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-muted">
                          {p.kind || "OTHER"}
                        </span>
                      </p>
                      <p className={`text-xs ${p.status === "OVERDUE" ? "font-medium text-clay" : "text-muted"}`}>
                        {money(p.amount)}
                        {p.dueDate ? ` · due ${p.dueDate}` : ""}
                        {p.paidAt ? ` · paid ${p.paidAt.slice(0, 10)}` : ""}
                        {p.status === "OVERDUE" ? " · overdue" : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                      {editing === p.id ? (
                        <>
                          <input
                            type="number"
                            min={0}
                            value={editAmt}
                            onChange={(e) => setEditAmt(e.target.value)}
                            className="w-24 min-h-11 rounded-xl border border-line px-2 text-sm"
                          />
                          <input
                            type="date"
                            value={editDue}
                            onChange={(e) => setEditDue(e.target.value)}
                            className="min-h-11 rounded-xl border border-line px-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(p.id)}
                            className="min-h-11 rounded-full bg-moss px-3 text-xs text-ivory"
                          >
                            Save
                          </button>
                          <button type="button" onClick={() => setEditing(null)} className="text-xs underline">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {p.receiptUrl ? (
                            <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="text-xs underline">
                              Receipt
                            </a>
                          ) : (
                            <FileUpload
                              label="Receipt"
                              accept="image/jpeg,image/png,application/pdf"
                              onUploaded={(url) => attachReceipt(p.id, url)}
                            />
                          )}
                          {p.status !== "PAID" ? (
                            <button
                              type="button"
                              onClick={() => setStatus(p.id, "PAID")}
                              className="min-h-11 rounded-full bg-moss px-3 text-xs text-ivory"
                            >
                              Mark paid
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setStatus(p.id, "UPCOMING")}
                              className="text-xs underline"
                            >
                              Undo
                            </button>
                          )}
                          <button type="button" onClick={() => startEdit(p)} className="text-xs underline">
                            Edit
                          </button>
                          <button type="button" onClick={() => remove(p.id)} className="text-xs underline">
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {!payments.length && (
          <p className="text-center text-sm text-muted">No payments yet. Add a deposit from a booked vendor.</p>
        )}
      </div>
    </div>
  );
}

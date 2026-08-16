"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { WeekItem } from "@/lib/this-week";

export function ThisWeekWidget({ items }: { items: WeekItem[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(items);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setRows(items);
  }, [items]);

  async function done(id: string) {
    setBusy(id);
    setRows((prev) => prev.filter((i) => i.id !== id));
    await fetch("/api/this-week", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <article className="glass-panel rounded-2xl p-5">
      <h2 className="text-sm font-semibold">This Week</h2>
      <ul className="mt-4 space-y-3">
        {rows.slice(0, 5).map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm">
            <button
              type="button"
              disabled={busy === item.id}
              onClick={() => done(item.id)}
              aria-label={`Done: ${item.title}`}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border border-line hover:border-moss hover:bg-moss-soft disabled:opacity-40"
            />
            <a href={item.href} className="min-w-0 flex-1">
              {item.title}
            </a>
            <span className="shrink-0 text-[11px] text-muted">
              {item.urgency === "now" ? "Today" : item.urgency === "week" ? "This week" : "Soon"}
            </span>
          </li>
        ))}
        {!rows.length && <li className="text-sm text-muted">You’re clear this week.</li>}
      </ul>
    </article>
  );
}

export function RsvpWidget() {
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/guests/nudge");
    if (!res.ok) return;
    const data = await res.json();
    setCount((data.rsvp || []).length);
  }

  useEffect(() => {
    load();
  }, []);

  async function send() {
    if (!count) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/guests/nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "rsvp" }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Could not send");
      return;
    }
    setMsg(`Sent ${data.sent}${data.failed ? `, ${data.failed} failed` : ""}`);
    load();
  }

  return (
    <article className="glass-panel rounded-2xl p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-moss">RSVP</p>
      <p className="mt-2 font-serif text-3xl">{count == null ? "—" : count}</p>
      <p className="text-sm text-muted">waiting on a reply</p>
      <button
        type="button"
        disabled={busy || !count}
        onClick={send}
        className="mt-4 rounded-full bg-moss px-4 py-2 text-xs font-medium text-ivory disabled:opacity-40"
      >
        {busy ? "Sending…" : "Nudge them"}
      </button>
      {msg && <p className="mt-2 text-xs text-muted">{msg}</p>}
    </article>
  );
}

export function PayWidget() {
  const [vendor, setVendor] = useState("");
  const [label, setLabel] = useState("Deposit");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorName: vendor,
        label,
        amount: Number(amount) || 0,
        kind: label.toLowerCase().includes("final") ? "FINAL" : "DEPOSIT",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setMsg(data.error || "Could not save");
      return;
    }
    if (paid && data.payment?.id) {
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", id: data.payment.id, status: "PAID" }),
      });
    }
    setBusy(false);
    setVendor("");
    setAmount("");
    setMsg("Logged.");
  }

  return (
    <article className="glass-panel rounded-2xl p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-moss">Money</p>
      <h2 className="mt-1 text-sm font-semibold">Log a payment</h2>
      <form onSubmit={submit} className="mt-3 space-y-2">
        <input
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          required
          placeholder="Vendor"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Deposit"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            inputMode="decimal"
            placeholder="800"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
          Already paid
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-moss px-4 py-2 text-xs font-medium text-ivory disabled:opacity-40"
        >
          {busy ? "Saving…" : "Log it"}
        </button>
        {msg && <p className="text-xs text-muted">{msg}</p>}
      </form>
    </article>
  );
}

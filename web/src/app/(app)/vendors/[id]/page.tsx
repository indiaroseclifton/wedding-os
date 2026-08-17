"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CONTRACT_CLAUSES,
  flagCount,
  type ClauseId,
  type ClauseMark,
  type ContractReview,
} from "@/lib/data/contract-review";
import { VendorLog } from "@/components/send/VendorLog";
import { VendorHero } from "@/components/vendors/VendorHero";
import { VendorFace } from "@/components/vendors/VendorFace";
import { VendorGut } from "@/components/vendors/VendorGut";
import { sendStrip } from "@/lib/send/status";
import type { GutMark } from "@/lib/vendor-gut";
import type { VendorSend } from "@/lib/data/sends-store";

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
  contractReview?: ContractReview;
  inquiries?: { id: string; at: string; direction: "out" | "in"; body: string; emailedAt?: string }[];
  checklist?: { id: string; title: string; done: boolean }[];
  contactName?: string;
  face?: Record<string, string>;
  gutMark?: GutMark;
  gutNote?: string;
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
  const [progress, setProgress] = useState("");
  const [progressDue, setProgressDue] = useState("");
  const [progressPaid, setProgressPaid] = useState(false);
  const [finalAmt, setFinalAmt] = useState("");
  const [finalDue, setFinalDue] = useState("");
  const [finalPaid, setFinalPaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<ContractReview>({
    depositRefundable: "unknown",
    clauses: {},
    coiReceived: false,
  });
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [strip, setStrip] = useState("");

  function setClause(id: ClauseId, mark: ClauseMark) {
    setReview((r) => ({ ...r, clauses: { ...r.clauses, [id]: mark } }));
  }

  function apply(data: { vendor?: Vendor; payments?: Payment[] }) {
    if (data.vendor) {
      setVendor(data.vendor);
      setContractUrl(data.vendor.contractUrl || "");
      if (data.vendor.contractReview) {
        setReview({
          depositRefundable: "unknown",
          clauses: {},
          coiReceived: false,
          ...data.vendor.contractReview,
        });
      }
    }
    if (data.payments) {
      setPayments(data.payments);
      const dep = data.payments.find((p) => p.kind === "DEPOSIT");
      const mid = data.payments.find((p) => p.kind === "PROGRESS");
      const fin = data.payments.find((p) => p.kind === "FINAL");
      if (dep) {
        setDeposit(String(dep.amount));
        setDepositDue(dep.dueDate || "");
        setDepositPaid(dep.status === "PAID");
        if (!data.vendor?.contractUrl && dep.contractLink) setContractUrl(dep.contractLink);
      }
      if (mid) {
        setProgress(String(mid.amount));
        setProgressDue(mid.dueDate || "");
        setProgressPaid(mid.status === "PAID");
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
    fetch("/api/send")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const send = (d?.sends || []).find((s: VendorSend) => s.vendorId === id);
        setStrip(sendStrip(send).line);
      })
      .catch(() => {});
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
        progress,
        progressDue,
        progressPaid,
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

  async function saveReview(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setReviewMsg(null);
    const res = await fetch(`/api/vendors/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review", review }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setReviewMsg(data.error || "Could not save");
      return;
    }
    apply(data);
    setReviewMsg("Saved on this vendor");
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
  if (!vendor) return <p className="text-sm text-muted">Loading…</p>;

  const openPay = payments.filter((p) => p.status !== "PAID").reduce((s, p) => s + p.amount, 0);
  const paidPay = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const flags = flagCount(vendor.contractReview);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href="/vendors" className="text-xs underline">
        All vendors
      </Link>

      <VendorHero
        vendor={vendor}
        paid={paidPay}
        open={openPay}
        flags={flags}
        strip={strip}
        onSaved={(v) => setVendor((cur) => (cur ? { ...cur, ...v } : v))}
      />

      <section className="rounded-[1.6rem] border border-line bg-surface p-5 sm:p-6">
        <p className="kicker kicker-moss">After you met</p>
        <p className="mt-1 font-serif text-2xl">Would we hire them?</p>
        <p className="mt-1 text-sm text-muted">Private. Find never sees this.</p>
        <div className="mt-4">
          <VendorGut
            vendorId={vendor.id}
            mark={vendor.gutMark}
            note={vendor.gutNote}
            onSaved={(next) => setVendor((cur) => (cur ? { ...cur, ...next } : cur))}
          />
        </div>
      </section>

      <VendorFace
        vendorId={vendor.id}
        category={vendor.category}
        initial={vendor.face}
        onSaved={(face) => setVendor((cur) => (cur ? { ...cur, face } : cur))}
      />

      <VendorChecklist
        items={vendor.checklist || []}
        category={vendor.category}
        onToggle={async (toggleId) => {
          const res = await fetch(`/api/vendors/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "checklist", toggleId }),
          });
          if (res.ok) apply(await res.json());
        }}
        onApply={async () => {
          const res = await fetch(`/api/vendors/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "checklist", apply: true }),
          });
          if (res.ok) apply(await res.json());
        }}
        onAdd={async (add) => {
          const res = await fetch(`/api/vendors/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "checklist", add }),
          });
          if (res.ok) apply(await res.json());
        }}
      />

      <form onSubmit={saveMoney} className="space-y-3 rounded-[1.6rem] border border-line bg-surface p-5 sm:p-6">
        <p className="font-serif text-2xl">Contract & money</p>
        <label className="block text-sm">
          Contract link
          <input
            value={contractUrl}
            onChange={(e) => setContractUrl(e.target.value)}
            placeholder="Google Drive, Dropbox, HelloSign…"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
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
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Due
            <input
              value={depositDue}
              onChange={(e) => setDepositDue(e.target.value)}
              type="date"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
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
            Progress $
            <input
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Due
            <input
              value={progressDue}
              onChange={(e) => setProgressDue(e.target.value)}
              type="date"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={progressPaid}
            onChange={(e) => setProgressPaid(e.target.checked)}
          />
          Progress paid
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            Final $
            <input
              value={finalAmt}
              onChange={(e) => setFinalAmt(e.target.value)}
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Due
            <input
              value={finalDue}
              onChange={(e) => setFinalDue(e.target.value)}
              type="date"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={finalPaid} onChange={(e) => setFinalPaid(e.target.checked)} />
          Final paid
        </label>
        {msg && <p className="text-xs text-muted">{msg}</p>}
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 rounded-full bg-moss px-5 text-sm font-medium text-moss-fg disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save contract & payments"}
        </button>
      </form>

      <form onSubmit={saveReview} className="space-y-3 rounded-[1.6rem] border border-line bg-surface p-5 sm:p-6">
        <p className="text-sm font-semibold">Review the contract</p>
        <p className="text-xs text-muted">
          Not legal advice — five minutes so the PDF is more than a link. Mark what looks good and flag what
          you’d ask about before you pay.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            Signed
            <input
              type="date"
              value={review.signedAt || ""}
              onChange={(e) => setReview((r) => ({ ...r, signedAt: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Deposit refundable?
            <select
              value={review.depositRefundable || "unknown"}
              onChange={(e) =>
                setReview((r) => ({
                  ...r,
                  depositRefundable: e.target.value as ContractReview["depositRefundable"],
                }))
              }
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            >
              <option value="unknown">Not sure</option>
              <option value="yes">Yes</option>
              <option value="partial">Partial / tiered</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="col-span-2 block text-sm">
            Named person on site
            <input
              value={review.namedLead || ""}
              onChange={(e) => setReview((r) => ({ ...r, namedLead: e.target.value }))}
              placeholder="Who actually shows up"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Hours
            <input
              value={review.hours || ""}
              onChange={(e) => setReview((r) => ({ ...r, hours: e.target.value }))}
              placeholder="2pm–10pm"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Overtime
            <input
              value={review.overtimeRate || ""}
              onChange={(e) => setReview((r) => ({ ...r, overtimeRate: e.target.value }))}
              placeholder="$200/hr"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Delivery date
            <input
              type="date"
              value={review.deliveryDate || ""}
              onChange={(e) => setReview((r) => ({ ...r, deliveryDate: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(review.coiReceived)}
              onChange={(e) => setReview((r) => ({ ...r, coiReceived: e.target.checked }))}
            />
            COI received
          </label>
        </div>
        <ul className="space-y-3">
          {CONTRACT_CLAUSES.map((c) => {
            const mark = review.clauses?.[c.id] || "skip";
            return (
              <li key={c.id} className="rounded-lg bg-surface px-3 py-2">
                <p className="text-sm font-medium">{c.label}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Good: {c.good}. Flag: {c.flag}.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  {(["good", "flag", "skip"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setClause(c.id, m)}
                      className={`rounded-full px-2.5 py-1 ${
                        mark === m
                          ? m === "flag"
                            ? "bg-rose-700 text-white"
                            : m === "good"
                              ? "bg-emerald-800 text-white"
                              : "bg-slate-900 text-white"
                          : "border border-line"
                      }`}
                    >
                      {m === "good" ? "Looks good" : m === "flag" ? "Flag" : "Skip"}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
        <label className="block text-sm">
          Notes
          <textarea
            value={review.notes || ""}
            onChange={(e) => setReview((r) => ({ ...r, notes: e.target.value }))}
            rows={2}
            placeholder="What you’ll ask before you pay…"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>
        {reviewMsg && <p className="text-xs text-muted">{reviewMsg}</p>}
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 rounded-full bg-moss px-5 text-sm font-medium text-moss-fg disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save review"}
        </button>
      </form>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Payments</p>
          <Link href="/payments" className="text-xs underline">
            All payments
          </Link>
        </div>
        <p className="mt-1 text-xs text-muted">
          Open for this vendor: ${openPay.toLocaleString()}
        </p>
        <ul className="mt-3 divide-y divide-line glass-panel rounded-2xl">
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
            <li className="px-4 py-6 text-center text-sm text-muted">
              Save a deposit, progress, or final above — it stays if you rename this vendor.
            </li>
          )}
        </ul>
      </div>

      {vendor && (
        <VendorLog vendorId={vendor.id} sendHref={`/send/${vendor.id}`} initial={vendor.inquiries || []} />
      )}

      <div className="rounded-[1.4rem] border border-line bg-surface p-5 text-sm">
        <p className="font-medium">Coordination next</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
          <li>
            <Link href={vendor ? `/send/${vendor.id}` : "/send"} className="underline">
              Send their live page
            </Link>{" "}
            — they write back there.
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

function VendorChecklist({
  items,
  category,
  onToggle,
  onApply,
  onAdd,
}: {
  items: { id: string; title: string; done: boolean }[];
  category: string;
  onToggle: (id: string) => void;
  onApply: () => void;
  onAdd: (title: string) => void;
}) {
  const done = items.filter((i) => i.done).length;
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-serif text-2xl">Checklist</p>
          <p className="text-xs text-muted">
            {category} · {done}/{items.length}
          </p>
        </div>
        <button type="button" onClick={onApply} className="text-xs underline">
          Reset to template
        </button>
      </div>
      <ul className="mt-3 space-y-1.5">
        {items.map((i) => (
          <li key={i.id}>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={i.done} onChange={() => onToggle(i.id)} className="mt-1" />
              <span className={i.done ? "text-muted line-through" : ""}>{i.title}</span>
            </label>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const title = String(fd.get("title") || "").trim();
          if (title) onAdd(title);
          e.currentTarget.reset();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          name="title"
          placeholder="Add a line"
          className="flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <button type="submit" className="text-xs underline">
          Add
        </button>
      </form>
    </section>
  );
}

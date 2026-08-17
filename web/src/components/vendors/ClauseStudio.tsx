"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CONTRACT_CLAUSES,
  composeChangeEmail,
  flagCount,
  type ClauseId,
  type ClauseMark,
  type ContractReview,
} from "@/lib/data/contract-review";

export function ClauseStudio({
  vendorId,
  name,
  email,
  contractUrl,
  initial,
}: {
  vendorId: string;
  name: string;
  email?: string;
  contractUrl?: string;
  initial?: ContractReview;
}) {
  const [review, setReview] = useState<ContractReview>({
    depositRefundable: "unknown",
    clauses: {},
    coiReceived: false,
    ...initial,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const flags = flagCount(review);
  const letter = composeChangeEmail(name, review);

  function mark(id: ClauseId, m: ClauseMark) {
    setReview((r) => ({ ...r, clauses: { ...r.clauses, [id]: m } }));
  }

  async function save() {
    setMsg(null);
    const res = await fetch(`/api/vendors/${vendorId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "review", review }),
    });
    setMsg(res.ok ? "Review saved" : "Could not save");
  }

  async function sendAsk() {
    setMsg(null);
    const res = await fetch(`/api/vendors/${vendorId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "email", body: draft || letter.body }),
    });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? (data.emailedVendor ? "Sent to the vendor" : "Saved on the thread") : data.error || "Could not send");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="kicker kicker-moss">Clause studio</p>
        <h1 className="mt-1 font-serif text-4xl">{name}</h1>
        <p className="mt-1 text-sm text-muted">
          Mark each clause. Flagged ones write the email for you.
          {contractUrl ? (
            <>
              {" "}
              <a href={contractUrl} target="_blank" rel="noreferrer" className="underline">
                Open file
              </a>
            </>
          ) : null}
        </p>
      </div>

      <ul className="space-y-3">
        {CONTRACT_CLAUSES.map((c) => {
          const m = review.clauses?.[c.id];
          return (
            <li key={c.id} className="glass-panel rounded-2xl p-4">
              <p className="font-medium">{c.label}</p>
              <p className="mt-1 text-xs text-muted">Good: {c.good}</p>
              <p className="text-xs text-clay">Flag: {c.flag}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["good", "flag", "skip"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => mark(c.id, opt)}
                    className={`min-h-11 rounded-full px-3 text-xs ${
                      m === opt ? "bg-moss text-moss-fg" : "border border-line"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} className="min-h-11 rounded-full bg-moss px-4 text-sm text-ivory">
          Save review
        </button>
        <Link href="/vendors/contracts" scroll={false} className="inline-flex min-h-11 items-center text-sm underline">
          All contracts
        </Link>
      </div>

      {flags > 0 && (
        <section className="glass-panel space-y-3 rounded-2xl p-5">
          <p className="font-medium">Ask about {flags} flag{flags === 1 ? "" : "s"}</p>
          <p className="text-xs text-muted">{letter.subject}{email ? ` · ${email}` : " · no vendor email — we'll save the thread"}</p>
          <textarea
            value={draft || letter.body}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-line bg-surface/70 p-3 text-sm"
          />
          <button type="button" onClick={sendAsk} className="min-h-11 rounded-full bg-moss px-4 text-sm text-ivory">
            Send the ask
          </button>
        </section>
      )}
      {msg && (
        <p role="status" className="text-xs text-moss">
          {msg}
        </p>
      )}
    </div>
  );
}

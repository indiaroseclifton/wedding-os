"use client";

import { useState } from "react";

type Ask = { id: string; body: string; at: string; answer?: string; answeredAt?: string };

export function FirstAsk({
  vendorId,
  starters,
  asks,
  quoteLow,
  quoteNote,
}: {
  vendorId: string;
  starters: string[];
  asks: Ask[];
  quoteLow?: string;
  quoteNote?: string;
  city?: string;
}) {
  const [rows, setRows] = useState(asks);
  const [floor, setFloor] = useState(quoteLow || "");
  const [note, setNote] = useState(quoteNote || "");
  const [busy, setBusy] = useState(false);

  async function send(body: string) {
    setBusy(true);
    const next = [...rows, { id: `a${Date.now()}`, body, at: new Date().toISOString() }];
    const res = await fetch(`/api/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asks: next }),
    });
    setBusy(false);
    if (res.ok) setRows(next);
  }

  async function saveQuote() {
    await fetch(`/api/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteLow: floor, quoteNote: note }),
    });
  }

  const stale = rows.filter((a) => !a.answer && Date.now() - new Date(a.at).getTime() > 7 * 86400000);

  return (
    <div className="mt-4 space-y-3">
      {stale.length ? <p className="text-xs text-clay">{stale.length} unanswered for over a week.</p> : null}
      <div className="flex flex-wrap gap-2">
        {starters.map((s) => (
          <button key={s} type="button" disabled={busy} onClick={() => send(s)} className="btn btn-ghost min-h-10 text-xs">
            Ask: {s.slice(0, 42)}…
          </button>
        ))}
      </div>
      {rows.length ? (
        <ul className="space-y-2 text-sm">
          {rows.map((a) => (
            <li key={a.id}>
              <p>{a.body}</p>
              <p className="text-xs text-muted">{a.answer || (stale.includes(a) ? "Silent" : "Waiting")}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          onBlur={saveQuote}
          placeholder="Their floor — $2,400"
          className="field"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveQuote}
          placeholder="Without a venue they said…"
          className="field"
        />
      </div>
    </div>
  );
}

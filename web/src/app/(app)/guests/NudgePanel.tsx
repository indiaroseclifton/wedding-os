"use client";

import { useEffect, useState } from "react";

type Ready = { id: string; name: string; email?: string };
type Lists = { rsvp: Ready[]; address: Ready[]; saveTheDate: Ready[]; invited: Ready[] };

export function NudgePanel() {
  const [lists, setLists] = useState<Lists>({ rsvp: [], address: [], saveTheDate: [], invited: [] });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/guests/nudge");
    if (res.ok) setLists(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function send(kind: string, count: number) {
    if (!count) return;
    if (!confirm(`Email ${count} ${count === 1 ? "person" : "people"}?`)) return;
    setBusy(kind);
    setMsg(null);
    const res = await fetch("/api/guests/nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setMsg(data.error || "Could not send");
      return;
    }
    setMsg(`Sent ${data.sent}${data.failed ? `, ${data.failed} failed` : ""}`);
    load();
  }

  const rows = [
    { kind: "save_the_date", label: "Save the date", list: lists.saveTheDate, hint: "A-list only" },
    { kind: "invited", label: "You’re invited", list: lists.invited },
    { kind: "rsvp", label: "RSVP nudge", list: lists.rsvp, hint: "Waiting, maybe, and silent yes · second send waits 10 days" },
    { kind: "address", label: "Need address", list: lists.address },
  ];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 print:hidden">
      <p className="text-sm font-medium">Guest email</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.kind} className="rounded-lg border border-slate-100 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium">{row.label}</p>
                <p className="text-[11px] text-slate-500">
                  {row.list.length
                    ? `${row.list.length} ready${row.hint ? ` · ${row.hint}` : ""}`
                    : "None waiting"}
                </p>
              </div>
              <button
                type="button"
                disabled={Boolean(busy) || !row.list.length}
                onClick={() => send(row.kind, row.list.length)}
                className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {busy === row.kind ? "…" : "Send"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {msg && <p className="text-xs text-slate-600">{msg}</p>}
    </div>
  );
}

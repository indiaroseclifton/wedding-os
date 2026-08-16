"use client";

import { useEffect, useState } from "react";

type Ready = { id: string; name: string; email?: string };

export function NudgePanel() {
  const [ready, setReady] = useState<Ready[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/guests/nudge");
    if (res.ok) {
      const data = await res.json();
      setReady(data.ready || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function send() {
    if (!ready.length) return;
    if (!confirm(`Email ${ready.length} ${ready.length === 1 ? "person" : "people"} who have not RSVP’d?`)) {
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/guests/nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">RSVP nudge</p>
          <p className="text-xs text-slate-500">
            {ready.length
              ? `${ready.length} with an email who have not replied. Won’t re-email anyone for 5 days.`
              : "No one to nudge — they replied, have no email, or were emailed recently."}
          </p>
        </div>
        <button
          type="button"
          disabled={busy || !ready.length}
          onClick={send}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Sending…" : "Email them"}
        </button>
      </div>
      {ready.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          e.g. {ready.slice(0, 3).map((g) => g.name).join(", ")}
          {ready.length > 3 ? "…" : ""}
        </p>
      )}
      {msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}
    </div>
  );
}

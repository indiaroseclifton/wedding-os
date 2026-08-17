"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

type Ready = { id: string; name: string; email?: string };
type Lists = { rsvp: Ready[]; address: Ready[]; saveTheDate: Ready[]; invited: Ready[] };

export function NudgePanel() {
  const [lists, setLists] = useState<Lists>({ rsvp: [], address: [], saveTheDate: [], invited: [] });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [mailOn, setMailOn] = useState<boolean | null>(null);
  const [siteUrl, setSiteUrl] = useState("");

  async function load() {
    const [nudge, health, site] = await Promise.all([
      fetch("/api/guests/nudge"),
      fetch("/api/health"),
      fetch("/api/site"),
    ]);
    if (nudge.ok) setLists(await nudge.json());
    if (health.ok) {
      const h = await health.json();
      setMailOn(Boolean(h.email));
    }
    if (site.ok) {
      const d = await site.json();
      if (d.site?.siteToken) setSiteUrl(`${window.location.origin}/w/${d.site.siteToken}`);
    }
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
    { kind: "invited", label: "You're invited", list: lists.invited },
    { kind: "rsvp", label: "RSVP nudge", list: lists.rsvp, hint: "Waiting, maybe, and silent yes · second send waits 10 days" },
    { kind: "address", label: "Need address", list: lists.address },
  ];

  return (
    <div className="glass-panel space-y-3 rounded-2xl p-4 print:hidden">
      <p className="kicker">Guest email</p>
      {mailOn === false ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <p>Mail is not connected. Copy the site and send it yourself.</p>
          {siteUrl ? <CopyButton value={siteUrl} label="Copy guest site" /> : null}
        </div>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.kind} className="rounded-xl border border-line bg-surface px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium">{row.label}</p>
                <p className="text-[11px] text-muted">
                  {row.list.length
                    ? `${row.list.length} ready${row.hint ? ` · ${row.hint}` : ""}`
                    : "None waiting"}
                </p>
              </div>
              {mailOn ? (
                <button
                  type="button"
                  disabled={Boolean(busy) || !row.list.length}
                  onClick={() => send(row.kind, row.list.length)}
                  className="btn btn-primary !min-h-9 px-3 text-xs"
                >
                  {busy === row.kind ? "…" : "Send"}
                </button>
              ) : (
                <span className="text-[11px] text-muted">Copy the link</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {msg && <p className="text-xs text-muted">{msg}</p>}
    </div>
  );
}

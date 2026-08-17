"use client";

import { useState } from "react";

type Member = {
  id: string;
  name: string;
  role: string;
  color?: string;
  size?: string;
  dressLink?: string;
  notes?: string;
  status: string;
};

const STATUSES = ["NOT_STARTED", "ORDERED", "ALTERING", "READY"] as const;

export function PartyMyAttire({
  mine,
  others,
  palette,
}: {
  mine?: Member;
  others: Member[];
  palette?: string;
}) {
  const [row, setRow] = useState(mine);
  const [size, setSize] = useState(mine?.size || "");
  const [status, setStatus] = useState(mine?.status || "NOT_STARTED");
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    const res = await fetch("/api/attire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_mine", size, status }),
    });
    setMsg(res.ok ? "Saved" : "Could not save");
    if (res.ok) {
      const data = await res.json();
      const next = data.attire?.members?.find(
        (m: Member) => m.name.toLowerCase() === (mine?.name || "").toLowerCase()
      );
      if (next) setRow(next);
    }
  }

  return (
    <div className="space-y-6">
      {palette && (
        <div className="rounded-2xl border border-line bg-surface p-4 text-sm">
          <p className="kicker">Palette</p>
          <p className="mt-1 whitespace-pre-wrap">{palette}</p>
        </div>
      )}

      {row ? (
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted">
            {row.role}
            {row.color ? ` · ${row.color}` : ""}
          </p>
          {row.dressLink && (
            <a href={row.dressLink} className="block text-xs underline" target="_blank" rel="noreferrer">
              Open the look
            </a>
          )}
          <label className="block text-sm">
            Size
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={save} className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
            Save my row
          </button>
          {msg && <p className="text-xs text-muted">{msg}</p>}
        </div>
      ) : (
        <p className="text-sm text-muted">The couple hasn’t added you to attire yet.</p>
      )}

      {others.length > 0 && (
        <ul className="space-y-2">
          {others.map((m) => (
            <li key={m.id} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
              <p className="font-medium">{m.name}</p>
              <p className="text-xs text-muted">
                {m.role}
                {m.color ? ` · ${m.color}` : ""} · {m.status.replaceAll("_", " ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

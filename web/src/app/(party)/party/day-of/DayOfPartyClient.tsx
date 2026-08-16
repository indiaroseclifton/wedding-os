"use client";

import { useState } from "react";

const STATUSES = ["NOT_STARTED", "ON_THE_WAY", "ARRIVED", "READY", "BLOCKED"] as const;

type CheckIn = {
  id: string;
  name: string;
  role: string;
  status: string;
};

type DayOf = {
  weatherNote?: string;
  emergencyContact?: string;
  checkIns: CheckIn[];
  updates: { id: string; body: string; createdAt: string }[];
  schedule?: { id: string; time: string; title: string; owner?: string }[];
};

export function DayOfPartyClient({ initial }: { initial: DayOf }) {
  const [dayOf, setDayOf] = useState(initial);

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/day-of", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkin", id, status }),
    });
    if (res.ok) {
      const data = await res.json();
      setDayOf(data.dayOf);
    }
  }

  return (
    <div className="space-y-6">
      {(dayOf.schedule || []).filter((s) => !s.owner || s.owner === "All" || s.owner === "Party")
        .length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold">Your hours</p>
          <ol className="mt-3 space-y-2">
            {(dayOf.schedule || [])
              .filter((s) => !s.owner || s.owner === "All" || s.owner === "Party")
              .map((s) => (
                <li key={s.id} className="flex gap-3 text-sm">
                  <span className="w-14 font-medium tabular-nums">{s.time}</span>
                  <span>{s.title}</span>
                </li>
              ))}
          </ol>
        </div>
      )}
      {(dayOf.weatherNote || dayOf.emergencyContact) && (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          {dayOf.weatherNote && (
            <p>
              <span className="text-xs text-slate-500">Weather</span>
              <br />
              {dayOf.weatherNote}
            </p>
          )}
          {dayOf.emergencyContact && (
            <p>
              <span className="text-xs text-slate-500">Emergency</span>
              <br />
              {dayOf.emergencyContact}
            </p>
          )}
        </div>
      )}

      <ul className="space-y-2">
        {dayOf.checkIns.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <span>
              {c.name}
              <span className="text-xs text-slate-500"> · {c.role}</span>
            </span>
            <select
              value={c.status}
              onChange={(e) => setStatus(c.id, e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <ul className="space-y-2">
        {dayOf.updates.slice(0, 10).map((u) => (
          <li key={u.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            {u.body}
          </li>
        ))}
      </ul>
    </div>
  );
}

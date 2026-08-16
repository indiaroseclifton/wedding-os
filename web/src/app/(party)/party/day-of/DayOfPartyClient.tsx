"use client";

import { useState } from "react";
import { ScheduleView } from "@/components/run-of-show/ScheduleView";
import type { RunSlot } from "@/lib/data/run-of-show";

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
  schedule?: RunSlot[];
};

export function DayOfPartyClient({
  initial,
  selfName,
}: {
  initial: DayOf;
  selfName?: string;
}) {
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
      {(dayOf.schedule || []).length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold">Your hours</p>
          <ScheduleView slots={dayOf.schedule || []} view="party" />
        </div>
      )}      {(dayOf.weatherNote || dayOf.emergencyContact) && (
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
        {dayOf.checkIns.map((c) => {
          const mine = selfName && c.name.toLowerCase() === selfName.toLowerCase();
          return (
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
              disabled={!mine}
              onChange={(e) => setStatus(c.id, e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs disabled:opacity-50"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </li>
          );
        })}
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

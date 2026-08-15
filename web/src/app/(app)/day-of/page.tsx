"use client";

import { useEffect, useState } from "react";

const STATUSES = ["NOT_STARTED", "ON_THE_WAY", "ARRIVED", "READY", "BLOCKED"] as const;

type CheckIn = {
  id: string;
  name: string;
  role: string;
  status: string;
  note?: string;
};

type DayOf = {
  weatherNote?: string;
  emergencyContact?: string;
  checkIns: CheckIn[];
  updates: { id: string; body: string; createdAt: string }[];
};

export default function DayOfPage() {
  const [dayOf, setDayOf] = useState<DayOf | null>(null);
  const [update, setUpdate] = useState("");
  const [weather, setWeather] = useState("");
  const [emergency, setEmergency] = useState("");

  async function load() {
    const res = await fetch("/api/day-of");
    if (res.ok) {
      const data = await res.json();
      setDayOf(data.dayOf);
      setWeather(data.dayOf?.weatherNote || "");
      setEmergency(data.dayOf?.emergencyContact || "");
    }
  }

  useEffect(() => {
    load();
  }, []);

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

  async function postUpdate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/day-of", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", body: update }),
    });
    if (res.ok) {
      const data = await res.json();
      setDayOf(data.dayOf);
      setUpdate("");
    }
  }

  async function saveMeta() {
    const res = await fetch("/api/day-of", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "meta",
        weatherNote: weather,
        emergencyContact: emergency,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setDayOf(data.dayOf);
    }
  }

  if (!dayOf) return <p className="text-sm text-slate-600">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Day-of</h1>
        <p className="mt-1 text-sm text-slate-600">
          Live check-ins, weather, and a shared status feed.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm rounded-xl border border-slate-200 bg-white p-4">
          <span className="font-medium">Weather note</span>
          <input
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm rounded-xl border border-slate-200 bg-white p-4">
          <span className="font-medium">Emergency contact</span>
          <input
            value={emergency}
            onChange={(e) => setEmergency(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <button type="button" onClick={saveMeta} className="text-xs font-medium underline">
        Save weather & contact
      </button>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Check-ins</p>
        {dayOf.checkIns.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-slate-500">{c.role}</p>
            </div>
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
          </div>
        ))}
      </div>

      <form onSubmit={postUpdate} className="space-y-2">
        <textarea
          value={update}
          onChange={(e) => setUpdate(e.target.value)}
          required
          rows={2}
          placeholder="Post a day-of update…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Post update
        </button>
      </form>

      <ul className="space-y-2">
        {dayOf.updates.map((u) => (
          <li key={u.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <p>{u.body}</p>
            <p className="mt-1 text-xs text-slate-400">{new Date(u.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

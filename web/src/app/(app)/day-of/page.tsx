"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ScheduleView } from "@/components/run-of-show/ScheduleView";
import type { RunSlot } from "@/lib/data/run-of-show";

type CheckIn = { id: string; name: string; role: string; status: string };
type DayOf = {
  weatherNote?: string;
  emergencyContact?: string;
  checkIns: CheckIn[];
  updates: { id: string; body: string; createdAt: string }[];
  schedule: RunSlot[];
};

const STATUSES = ["NOT_STARTED", "ON_THE_WAY", "ARRIVED", "READY", "BLOCKED"] as const;

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
      setWeather(data.dayOf.weatherNote || "");
      setEmergency(data.dayOf.emergencyContact || "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    await fetch("/api/day-of", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkin", id, status }),
    });
    load();
  }

  async function postUpdate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/day-of", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", body: update }),
    });
    setUpdate("");
    load();
  }

  async function saveMeta() {
    await fetch("/api/day-of", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "meta",
        weatherNote: weather,
        emergencyContact: emergency,
      }),
    });
    load();
  }

  if (!dayOf) return <p className="text-sm text-slate-600">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Day-of board</h1>
          <p className="mt-1 text-sm text-slate-600">
            Live check-ins and notes. The timeline lives on Run of show.
          </p>
        </div>
        <Link
          href="/run-of-show"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Edit run of show
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <ScheduleView slots={dayOf.schedule || []} view="all" showNotes={false} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <span className="font-medium">Weather</span>
          <textarea
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <span className="font-medium">Emergency contact</span>
          <textarea
            value={emergency}
            onChange={(e) => setEmergency(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={saveMeta}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
      >
        Save weather & emergency
      </button>

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

      <form onSubmit={postUpdate} className="flex gap-2">
        <input
          value={update}
          onChange={(e) => setUpdate(e.target.value)}
          placeholder="Live update…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Post
        </button>
      </form>

      <ul className="space-y-2">
        {dayOf.updates.map((u) => (
          <li key={u.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            {u.body}
            <p className="mt-1 text-[10px] text-slate-400">{u.createdAt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

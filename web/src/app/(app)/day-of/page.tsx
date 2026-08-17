"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ScheduleView } from "@/components/run-of-show/ScheduleView";
import type { RunSlot } from "@/lib/data/run-of-show";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

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
  const [weatherMsg, setWeatherMsg] = useState<string | null>(null);

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

  if (!dayOf) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-10">
      <RoomSubnav room="day" />

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker kicker-moss">The day</p>
          <h1 className="mt-2 font-serif text-[clamp(2.4rem,7vw,4rem)] leading-none tracking-tight">
            Call sheet
          </h1>
        </div>
        <Link href="/run-of-show" className="btn btn-ghost">
          Edit the times
        </Link>
      </header>

      <section>
        <ScheduleView slots={dayOf.schedule || []} view="all" showNotes={false} />
      </section>

      <div className="grid gap-6 border-t border-line pt-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div>
          <p className="kicker">Crew</p>
          <ul className="mt-3 divide-y divide-line">
            {dayOf.checkIns.map((c) => (
              <li key={c.id} className="flex min-h-14 flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-serif text-xl leading-tight">{c.name}</span>
                  <span className="ml-2 text-xs text-muted">{c.role}</span>
                </span>
                <select
                  value={c.status}
                  onChange={(e) => setStatus(c.id, e.target.value)}
                  className="field max-w-[10rem] text-xs"
                  aria-label={`${c.name} status`}
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
        </div>

        <aside className="space-y-4">
          <label className="block">
            <span className="kicker">Weather</span>
            <textarea
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              rows={3}
              className="field mt-2"
            />
            <button
              type="button"
              onClick={async () => {
                setWeatherMsg(null);
                const res = await fetch("/api/integrations/weather", { method: "POST" });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  setWeatherMsg(data.error || "Could not pull forecast");
                  return;
                }
                setWeather(data.note || "");
                setWeatherMsg("Pulled from NWS");
              }}
              className="mt-2 text-xs underline"
            >
              Pull forecast
            </button>
            {weatherMsg ? <p className="mt-1 text-xs text-muted">{weatherMsg}</p> : null}
          </label>
          <label className="block">
            <span className="kicker">Emergency</span>
            <textarea
              value={emergency}
              onChange={(e) => setEmergency(e.target.value)}
              rows={2}
              className="field mt-2"
            />
          </label>
          <button type="button" onClick={saveMeta} className="btn btn-primary w-full">
            Save
          </button>
        </aside>
      </div>

      <form onSubmit={postUpdate} className="flex gap-2">
        <label className="sr-only" htmlFor="live-update">
          Live update
        </label>
        <input
          id="live-update"
          value={update}
          onChange={(e) => setUpdate(e.target.value)}
          placeholder="Live update…"
          className="field flex-1"
        />
        <button type="submit" className="btn btn-primary">
          Post
        </button>
      </form>

      {dayOf.updates.length > 0 && (
        <ul className="divide-y divide-line">
          {dayOf.updates.map((u) => (
            <li key={u.id} className="py-3 text-sm">
              {u.body}
              <p className="mt-1 text-[11px] tabular-nums text-muted">{u.createdAt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

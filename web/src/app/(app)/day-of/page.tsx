"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ScheduleView } from "@/components/run-of-show/ScheduleView";
import type { Audience, RunSlot } from "@/lib/data/run-of-show";
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
const VIEWS: { id: Audience | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "couple", label: "Couple" },
  { id: "party", label: "Wedding party" },
  { id: "vendor", label: "Vendors" },
];

function timeToMinutes(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
}

export default function DayOfPage() {
  const [dayOf, setDayOf] = useState<DayOf | null>(null);
  const [update, setUpdate] = useState("");
  const [weather, setWeather] = useState("");
  const [emergency, setEmergency] = useState("");
  const [weatherMsg, setWeatherMsg] = useState<string | null>(null);
  const [view, setView] = useState<Audience | "all">("all");
  const [now, setNow] = useState(() => new Date());

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
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
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
    if (!update.trim()) return;
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
      body: JSON.stringify({ action: "meta", weatherNote: weather, emergencyContact: emergency }),
    });
    load();
  }

  const live = useMemo(() => {
    const slots = dayOf?.schedule || [];
    const minute = now.getHours() * 60 + now.getMinutes();
    const timed = slots.map((slot) => ({ slot, minute: timeToMinutes(slot.time) })).filter((row): row is { slot: RunSlot; minute: number } => row.minute != null).sort((a, b) => a.minute - b.minute);
    const current = [...timed].reverse().find((row) => row.minute <= minute)?.slot || null;
    const next = timed.find((row) => row.minute > minute)?.slot || null;
    return { current, next };
  }, [dayOf, now]);

  if (!dayOf) return <p className="text-sm text-muted" aria-live="polite">Loading the live run…</p>;

  const blocked = dayOf.checkIns.filter((person) => person.status === "BLOCKED");
  const ready = dayOf.checkIns.filter((person) => person.status === "READY" || person.status === "ARRIVED").length;

  return (
    <div className="space-y-8">
      <RoomSubnav room="day" />

      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
        <div>
          <p className="kicker kicker-moss">The day · live</p>
          <h1 className="mt-2 font-serif text-[clamp(2.6rem,7vw,4.6rem)] leading-none tracking-tight">Run the room</h1>
          <p className="mt-3 max-w-xl text-sm text-ink-soft">Now, next, owners and blockers—without asking everyone to read the whole packet.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/packet" className="btn btn-primary">Open packet</Link>
          <Link href="/run-of-show" className="btn btn-ghost">Edit timeline</Link>
        </div>
      </header>

      <section aria-label="Live status" aria-live="polite" className="grid gap-3 md:grid-cols-[1fr_1fr_14rem]">
        <div className="rounded-[1.5rem] bg-ink p-6 text-ivory">
          <p className="text-xs uppercase tracking-[0.18em] text-champagne">Now · {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
          <p className="mt-3 font-serif text-3xl">{live.current?.title || "Before the first call"}</p>
          <p className="mt-2 text-sm text-white/70">{live.current?.location || "No location set"}{live.current?.assignee || live.current?.lead ? ` · ${live.current.assignee || live.current.lead}` : ""}</p>
        </div>
        <div className="rounded-[1.5rem] border border-line bg-surface p-6">
          <p className="kicker">Next</p>
          <p className="mt-3 font-serif text-3xl">{live.next?.title || "The run is clear"}</p>
          <p className="mt-2 text-sm text-muted">{live.next ? `${live.next.time}${live.next.location ? ` · ${live.next.location}` : ""}` : "Nothing else scheduled."}</p>
        </div>
        <div className={`rounded-[1.5rem] border p-6 ${blocked.length ? "border-clay bg-clay-soft" : "border-line bg-surface"}`}>
          <p className="kicker">Team health</p>
          <p className="mt-3 font-serif text-3xl">{blocked.length ? `${blocked.length} blocked` : `${ready} ready`}</p>
          <p className="mt-2 text-sm text-muted">{dayOf.checkIns.length} people on the call sheet</p>
        </div>
      </section>

      <section aria-labelledby="timeline-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="kicker">Role view</p><h2 id="timeline-heading" className="mt-2 font-serif text-3xl">Only what each person needs</h2></div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter timeline by role">
            {VIEWS.map((item) => <button key={item.id} type="button" onClick={() => setView(item.id)} aria-pressed={view === item.id} className={`min-h-11 rounded-full px-4 text-sm ${view === item.id ? "bg-ink text-ivory" : "border border-line bg-surface"}`}>{item.label}</button>)}
          </div>
        </div>
        <div className="mt-5"><ScheduleView slots={dayOf.schedule || []} view={view} showNotes={false} /></div>
      </section>

      <div className="grid gap-6 border-t border-line pt-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section>
          <div className="flex items-end justify-between gap-3"><div><p className="kicker">Team</p><h2 className="mt-2 font-serif text-3xl">Arrivals and blockers</h2></div><Link href="/planning/party" className="text-sm underline underline-offset-4">Team roster</Link></div>
          <ul className="mt-4 divide-y divide-line">
            {dayOf.checkIns.map((person) => (
              <li key={person.id} className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
                <span><span className="font-serif text-xl leading-tight">{person.name}</span><span className="ml-2 text-sm text-muted">{person.role}</span></span>
                <select value={person.status} onChange={(event) => setStatus(person.id, event.target.value)} className="field min-h-11 max-w-[11rem] text-xs" aria-label={`${person.name} status`}>
                  {STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                </select>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <label className="block"><span className="kicker">Weather and fallback</span><textarea value={weather} onChange={(event) => setWeather(event.target.value)} rows={3} className="field mt-2" />
            <button type="button" onClick={async () => {
              setWeatherMsg(null);
              const res = await fetch("/api/integrations/weather", { method: "POST" });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) return setWeatherMsg(data.error || "Could not pull forecast");
              setWeather(data.note || "");
              setWeatherMsg("Forecast updated");
            }} className="mt-2 min-h-11 text-sm underline underline-offset-4">Pull forecast</button>
            {weatherMsg ? <p className="text-sm text-muted" aria-live="polite">{weatherMsg}</p> : null}
          </label>
          <label className="block"><span className="kicker">Emergency contact</span><textarea value={emergency} onChange={(event) => setEmergency(event.target.value)} rows={2} className="field mt-2" /></label>
          <button type="button" onClick={saveMeta} className="btn btn-primary w-full">Save operations notes</button>
        </aside>
      </div>

      <section className="rounded-[1.5rem] border border-line bg-surface p-5">
        <p className="kicker">Live updates</p>
        <form onSubmit={postUpdate} className="mt-3 flex gap-2">
          <label className="sr-only" htmlFor="live-update">Live update</label>
          <input id="live-update" value={update} onChange={(event) => setUpdate(event.target.value)} placeholder="Delay, move or escalation…" className="field flex-1" />
          <button type="submit" className="btn btn-primary">Post</button>
        </form>
        {dayOf.updates.length ? <ul className="mt-4 divide-y divide-line">{dayOf.updates.map((item) => <li key={item.id} className="py-3 text-sm">{item.body}<p className="mt-1 text-xs tabular-nums text-muted">{item.createdAt}</p></li>)}</ul> : <p className="mt-3 text-sm text-muted">No live updates posted.</p>}
      </section>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";

const TYPES = [
  "Engagement party",
  "Bridal shower",
  "Bachelor / bachelorette",
  "Rehearsal dinner",
  "Welcome drinks",
  "Wedding day",
  "After-party",
  "Farewell brunch",
  "Other",
];

type EventRow = {
  id: string;
  name: string;
  type: string;
  date?: string;
  location?: string;
  budgetCap?: number;
  notes?: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  async function load() {
    const res = await fetch("/api/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, date, location }),
    });
    if (res.ok) {
      setName("");
      setDate("");
      setLocation("");
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-slate-600">
          Linked sub-events — shower, rehearsal, brunch — under the main wedding.
        </p>
      </div>

      <form onSubmit={add} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Event name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <div className="grid gap-2 sm:grid-cols-3">
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add event
        </button>
      </form>

      <ul className="space-y-3">
        {events.map((ev) => (
          <li key={ev.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold">{ev.name}</p>
            <p className="text-xs text-slate-500">
              {ev.type}
              {ev.date ? ` · ${ev.date}` : ""}
              {ev.location ? ` · ${ev.location}` : ""}
            </p>
          </li>
        ))}
        {!events.length && <li className="py-8 text-center text-sm text-slate-500">No sub-events yet</li>}
      </ul>
    </div>
  );
}

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
  expectedGuests?: number;
  notes?: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [rollup, setRollup] = useState({ count: 0, budgetTotal: 0, guestsTotal: 0 });
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [budgetCap, setBudgetCap] = useState("");
  const [expectedGuests, setExpectedGuests] = useState("");

  async function load() {
    const res = await fetch("/api/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
      setRollup(data.rollup || { count: 0, budgetTotal: 0, guestsTotal: 0 });
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
      body: JSON.stringify({
        name,
        type,
        date,
        location,
        budgetCap: budgetCap === "" ? undefined : Number(budgetCap),
        expectedGuests: expectedGuests === "" ? undefined : Number(expectedGuests),
      }),
    });
    if (res.ok) {
      setName("");
      setDate("");
      setLocation("");
      setBudgetCap("");
      setExpectedGuests("");
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sub-events under the main wedding with budget and guest rollups.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{rollup.count}</p>
          <p className="text-xs text-slate-500">Events</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">${rollup.budgetTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Budget caps</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{rollup.guestsTotal}</p>
          <p className="text-xs text-slate-500">Expected guests</p>
        </div>
      </div>

      <form onSubmit={add} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Event name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={budgetCap}
            onChange={(e) => setBudgetCap(e.target.value)}
            type="number"
            min={0}
            placeholder="Budget cap $"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={expectedGuests}
            onChange={(e) => setExpectedGuests(e.target.value)}
            type="number"
            min={0}
            placeholder="Expected guests"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          />
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
            <p className="mt-1 text-xs text-slate-600">
              {ev.budgetCap != null ? `Budget $${ev.budgetCap.toLocaleString()}` : "No budget cap"}
              {ev.expectedGuests != null ? ` · ${ev.expectedGuests} guests` : ""}
            </p>
          </li>
        ))}
        {!events.length && (
          <li className="py-8 text-center text-sm text-slate-500">No sub-events yet</li>
        )}
      </ul>
    </div>
  );
}

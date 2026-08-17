"use client";

import Link from "next/link";
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

type Counts = { invited: number; yes: number; no: number; maybe: number; pending: number };
type EventRow = {
  id: string;
  name: string;
  type: string;
  date?: string;
  location?: string;
  budgetCap?: number;
  expectedGuests?: number;
  rsvpEnabled: boolean;
  inviteMode: string;
  rsvpCounts?: Counts;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [rollup, setRollup] = useState({ count: 0, budgetTotal: 0, guestsTotal: 0, rsvpOpen: 0 });
  const [name, setName] = useState("");
  const [type, setType] = useState("Rehearsal dinner");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [budgetCap, setBudgetCap] = useState("");
  const [expectedGuests, setExpectedGuests] = useState("");
  const [rsvpEnabled, setRsvpEnabled] = useState(true);

  async function load() {
    const res = await fetch("/api/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
      setRollup(data.rollup || { count: 0, budgetTotal: 0, guestsTotal: 0, rsvpOpen: 0 });
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
        rsvpEnabled: type !== "Wedding day" && rsvpEnabled,
        inviteMode: "invited",
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

  async function toggleRsvp(ev: EventRow) {
    if (ev.type === "Wedding day") return;
    await fetch(`/api/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rsvpEnabled: !ev.rsvpEnabled }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title">Events</h1>
        <p className="mt-1 text-sm text-muted">
          Rehearsal, brunch, welcome drinks — each can have its own RSVP on the same guest link.
          Wedding day stays the main yes/no.
        </p>
      </div>

      <div className="stat-strip">
        <div>
          <p className="font-serif text-2xl tabular-nums">{rollup.count}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">Events</p>
        </div>
        <div>
          <p className="font-serif text-2xl tabular-nums">{rollup.rsvpOpen || 0}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">On RSVP</p>
        </div>
        <div>
          <p className="font-serif text-2xl tabular-nums">${rollup.budgetTotal.toLocaleString()}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">Caps</p>
        </div>
        <div>
          <p className="font-serif text-2xl tabular-nums">{rollup.guestsTotal}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">Expected</p>
        </div>
      </div>

      <form onSubmit={add} className="space-y-3 glass-panel rounded-2xl p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Event name"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            value={budgetCap}
            onChange={(e) => setBudgetCap(e.target.value)}
            type="number"
            min={0}
            placeholder="Budget cap $"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
        </div>
        {type !== "Wedding day" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rsvpEnabled}
              onChange={(e) => setRsvpEnabled(e.target.checked)}
            />
            Ask on the guest RSVP
          </label>
        )}
        <button type="submit" className="btn btn-primary">
          Add event
        </button>
      </form>

      <ul className="space-y-3">
        {events.map((ev) => (
          <li key={ev.id} className="glass-panel rounded-2xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{ev.name}</p>
                <p className="text-xs text-muted">
                  {ev.type}
                  {ev.date ? ` · ${ev.date}` : ""}
                  {ev.location ? ` · ${ev.location}` : ""}
                </p>
              </div>
              {ev.type !== "Wedding day" && (
                <button
                  type="button"
                  onClick={() => toggleRsvp(ev)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                    ev.rsvpEnabled ? "bg-moss-soft text-moss" : "bg-surface text-ink-soft"
                  }`}
                >
                  {ev.rsvpEnabled ? "On RSVP" : "Not on RSVP"}
                </button>
              )}
            </div>
            {ev.rsvpEnabled && ev.rsvpCounts && (
              <p className="mt-2 text-xs text-muted">
                {ev.rsvpCounts.yes} yes · {ev.rsvpCounts.no} no · {ev.rsvpCounts.pending} pending
                {ev.inviteMode === "everyone" ? " · everyone can answer" : ""}
              </p>
            )}
            <div className="mt-3 flex gap-3 text-xs">
              <Link href={`/events/${ev.id}`} className="font-medium underline">
                {ev.rsvpEnabled ? "Invite list" : "Open"}
              </Link>
            </div>
          </li>
        ))}
        {!events.length && (
          <li className="py-8 text-center text-sm text-muted">No sub-events yet</li>
        )}
      </ul>
    </div>
  );
}

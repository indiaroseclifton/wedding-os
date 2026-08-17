"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Guest = { id: string; name: string; rsvp: string; side?: string };
type Rsvp = { guestId: string; status: string; meal?: string };
type EventRow = {
  id: string;
  name: string;
  type: string;
  date?: string;
  location?: string;
  rsvpEnabled: boolean;
  askMeal: boolean;
  inviteMode: "everyone" | "invited";
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch(`/api/events/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setEvent(data.event);
    setGuests(data.guests || []);
    setRsvps(data.rsvps || []);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function patch(body: Record<string, unknown>) {
    await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  async function post(body: Record<string, unknown>) {
    await fetch(`/api/events/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  async function remove() {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    router.push("/events");
  }

  if (!event) return <p className="text-sm text-muted">Loading…</p>;

  const byGuest = new Map(rsvps.map((r) => [r.guestId, r]));
  const weddingYes = guests.filter((g) => g.rsvp === "YES");
  const filtered = guests.filter((g) =>
    g.name.toLowerCase().includes(q.toLowerCase())
  );
  const weddingDay = event.type === "Wedding day";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/events" className="text-xs underline">
          All events
        </Link>
        <h1 className="mt-2 title">{event.name}</h1>
        <p className="text-sm text-muted">
          {event.type}
          {event.date ? ` · ${event.date}` : ""}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      </div>

      {weddingDay ? (
        <p className="glass-panel rounded-2xl px-4 py-3 text-sm text-muted">
          Wedding day uses the main guest RSVP. Add rehearsal or brunch if you want a second yes/no.
        </p>
      ) : (
        <div className="space-y-3 glass-panel rounded-2xl p-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={event.rsvpEnabled}
              onChange={(e) => patch({ rsvpEnabled: e.target.checked })}
            />
            Ask on the guest RSVP
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={event.askMeal}
              onChange={(e) => patch({ askMeal: e.target.checked })}
            />
            Ask meal for this event
          </label>
          <label className="block text-sm">
            Who can answer
            <select
              value={event.inviteMode}
              onChange={(e) => patch({ inviteMode: e.target.value })}
              className="mt-1 block rounded-lg border border-line px-3 py-2 text-sm"
            >
              <option value="invited">Only people I invite</option>
              <option value="everyone">Everyone on the guest list</option>
            </select>
          </label>
          {event.rsvpEnabled && event.inviteMode === "invited" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => post({ action: "invite", preset: "wedding_yes" })}
                className="btn btn-primary !min-h-9 px-3 text-xs"
              >
                Invite wedding-day yes ({weddingYes.length})
              </button>
              <button
                type="button"
                onClick={() => post({ action: "invite", preset: "all" })}
                className="rounded-lg border border-line px-3 py-1.5 text-xs"
              >
                Invite everyone except nos
              </button>
            </div>
          )}
        </div>
      )}

      {!weddingDay && event.rsvpEnabled && (
        <div className="space-y-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search guests"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
          <ul className="divide-y divide-line glass-panel rounded-2xl">
            {filtered.map((g) => {
              const row = byGuest.get(g.id);
              return (
                <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                  <span>
                    {g.name}
                    <span className="text-xs text-muted"> · wedding {g.rsvp}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {row ? (
                      <>
                        <span className="text-xs text-muted">{row.status}</span>
                        <button
                          type="button"
                          onClick={() => post({ action: "uninvite", guestId: g.id })}
                          className="text-xs text-muted underline"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => post({ action: "invite", guestIds: [g.id] })}
                        className="text-xs underline"
                      >
                        Invite
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button type="button" onClick={remove} className="text-xs text-rose-600 underline">
        Delete event
      </button>
    </div>
  );
}

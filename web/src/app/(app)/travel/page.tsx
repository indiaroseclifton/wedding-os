"use client";

import { useEffect, useState } from "react";

type Hotel = {
  id: string;
  name: string;
  address?: string;
  rate?: string;
  blockCode?: string;
  cutoff?: string;
  rooms?: number;
  bookingUrl?: string;
  kind: string;
  notes?: string;
};

export default function TravelPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [airport, setAirport] = useState("");
  const [shuttle, setShuttle] = useState("");
  const [parking, setParking] = useState("");
  const [honeymoon, setHoneymoon] = useState("");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [blockCode, setBlockCode] = useState("");
  const [cutoff, setCutoff] = useState("");
  const [rooms, setRooms] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [kind, setKind] = useState("courtesy");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/travel");
    if (res.ok) {
      const data = await res.json();
      const t = data.travel || {};
      setHotels(t.hotels || []);
      setAirport(t.airport || "");
      setShuttle(t.shuttle || "");
      setParking(t.parking || "");
      setHoneymoon(t.honeymoon || "");
      setNotes(t.notes || "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/travel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.travel?.hotels) setHotels(data.travel.hotels);
      return data;
    }
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Travel & hotels</h1>
        <p className="mt-1 text-sm text-slate-600">
          Guest room blocks, airport, shuttle, and honeymoon notes. Courtesy blocks
          hold rooms without you paying for unused ones.
        </p>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "meta", airport, shuttle, parking, honeymoon, notes });
          setMsg("Travel notes saved");
        }}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <p className="text-sm font-medium">Guest logistics</p>
        <label className="block text-sm">
          <span className="font-medium">Airport</span>
          <input
            value={airport}
            onChange={(e) => setAirport(e.target.value)}
            placeholder="ATL — 35 min to venue"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Shuttle / rides</span>
          <input
            value={shuttle}
            onChange={(e) => setShuttle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Parking</span>
          <input
            value={parking}
            onChange={(e) => setParking(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Honeymoon</span>
          <input
            value={honeymoon}
            onChange={(e) => setHoneymoon(e.target.value)}
            placeholder="Destination, dates, passport check"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Save notes
        </button>
        {msg && <p className="text-xs text-emerald-700">{msg}</p>}
      </form>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({
            action: "add_hotel",
            name,
            rate,
            blockCode,
            cutoff,
            rooms,
            bookingUrl,
            kind,
          });
          setName("");
          setRate("");
          setBlockCode("");
          setCutoff("");
          setRooms("");
          setBookingUrl("");
        }}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <p className="text-sm font-medium">Add a hotel block</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Hotel name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Nightly rate"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={blockCode}
            onChange={(e) => setBlockCode(e.target.value)}
            placeholder="Block code"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={cutoff}
            onChange={(e) => setCutoff(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            placeholder="Rooms held"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <input
          value={bookingUrl}
          onChange={(e) => setBookingUrl(e.target.value)}
          placeholder="Booking link"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="courtesy">Courtesy block (no unused-room risk)</option>
          <option value="guaranteed">Guaranteed block (you pay unused rooms)</option>
          <option value="other">Other / overflow hotel</option>
        </select>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add hotel
        </button>
      </form>

      <ul className="space-y-3">
        {hotels.map((h) => (
          <li key={h.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs text-slate-500">
                  {h.kind}
                  {h.rate ? ` · ${h.rate}` : ""}
                  {h.blockCode ? ` · code ${h.blockCode}` : ""}
                  {h.rooms ? ` · ${h.rooms} rooms` : ""}
                  {h.cutoff ? ` · cutoff ${h.cutoff}` : ""}
                </p>
                {h.bookingUrl && (
                  <a
                    href={h.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block truncate text-xs text-sky-700 underline"
                  >
                    {h.bookingUrl}
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => post({ action: "delete_hotel", id: h.id })}
                className="text-xs text-slate-400 underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {!hotels.length && (
          <li className="py-6 text-center text-sm text-slate-500">No hotel blocks yet</li>
        )}
      </ul>
    </div>
  );
}

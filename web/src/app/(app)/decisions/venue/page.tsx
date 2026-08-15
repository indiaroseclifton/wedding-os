"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TYPES = [
  "Garden / outdoor",
  "Ballroom",
  "Barn / rustic",
  "Museum / gallery",
  "Restaurant / private dining",
  "Home / backyard",
  "Hotel",
  "Not sure yet",
];

export default function VenueDecisionPage() {
  const router = useRouter();
  const [venueType, setVenueType] = useState("");
  const [indoorOutdoor, setIndoorOutdoor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [mustHaves, setMustHaves] = useState("");
  const [dealbreakers, setDealbreakers] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(status: "EXPLORING" | "DECIDED") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/decisions/venue-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          summary: venueType || "Venue type still exploring",
          payload: {
            venueType,
            indoorOutdoor,
            capacity,
            mustHaves: mustHaves.split("\n").map((s) => s.trim()).filter(Boolean),
            dealbreakers: dealbreakers.split("\n").map((s) => s.trim()).filter(Boolean),
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save");
      }
      router.push("/decisions");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Venue type</h1>
        <p className="mt-1 text-sm text-slate-600">
          Agree on the kind of place before drowning in individual listings.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Type</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setVenueType(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                venueType === t
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Indoor / outdoor preference</span>
        <input
          value={indoorOutdoor}
          onChange={(e) => setIndoorOutdoor(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Covered outdoor with indoor backup…"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Guest capacity range</span>
        <input
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="80–120"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Must-haves (one per line)</span>
        <textarea rows={3} value={mustHaves} onChange={(e) => setMustHaves(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Dealbreakers (one per line)</span>
        <textarea rows={2} value={dealbreakers} onChange={(e) => setDealbreakers(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <div className="flex gap-2">
        <button type="button" disabled={loading} onClick={() => save("EXPLORING")} className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium">
          Save as exploring
        </button>
        <button type="button" disabled={loading || !venueType} onClick={() => save("DECIDED")} className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          Mark decided
        </button>
      </div>
    </div>
  );
}

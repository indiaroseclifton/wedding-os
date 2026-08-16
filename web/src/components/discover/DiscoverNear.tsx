"use client";

import { useState } from "react";
import { DIRECTORY_CATEGORIES } from "@/lib/data/vendor-directory";

type Place = {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  mapsUrl: string;
  website?: string;
};

export function DiscoverNear() {
  const [near, setNear] = useState("Atlanta");
  const [category, setCategory] = useState("Florist");
  const [places, setPlaces] = useState<Place[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState(true);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setMsg(null);
    const params = new URLSearchParams({ near, category });
    const res = await fetch(`/api/public/places?${params}`);
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setConfigured(data.configured !== false);
    setPlaces(data.places || []);
    if (data.configured === false) setMsg("Places isn’t connected yet — the Atlanta list below still works.");
    else if (data.error) setMsg(data.error);
    else if (!(data.places || []).length) setMsg("Nothing in that city for that role. Try another.");
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <p className="font-serif text-2xl">Near a city</p>
      <p className="mt-1 text-sm text-muted">No account. Search real vendors, then sign in to hire.</p>
      <form onSubmit={search} className="mt-4 flex flex-wrap gap-2">
        <input
          value={near}
          onChange={(e) => setNear(e.target.value)}
          placeholder="City"
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        >
          {DIRECTORY_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button type="submit" disabled={busy} className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          {busy ? "Searching…" : "Search"}
        </button>
      </form>
      {msg && <p className="mt-2 text-xs text-muted">{msg}</p>}
      <ul className="mt-4 space-y-2">
        {places.map((p) => (
          <li key={p.placeId} className="rounded-xl border border-line px-4 py-3 text-sm">
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-muted">
              {p.address}
              {p.rating ? ` · ${p.rating}` : ""}
            </p>
            <div className="mt-1 flex gap-3 text-xs">
              <a href={p.mapsUrl} className="underline" target="_blank" rel="noreferrer">
                Map
              </a>
              {p.website && (
                <a href={p.website} className="underline" target="_blank" rel="noreferrer">
                  Site
                </a>
              )}
              <a href="/login" className="underline">
                Sign in to hire
              </a>
            </div>
          </li>
        ))}
      </ul>
      {!configured && null}
    </section>
  );
}

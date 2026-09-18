"use client";

import { useState } from "react";

export function TravelSearch() {
  const [q, setQ] = useState("Atlanta wedding hotels");
  const encoded = encodeURIComponent(q || "hotels near venue");
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <p className="kicker">Find rooms</p>
      <h2 className="mt-1 font-serif text-2xl">Search, then paste the block</h2>
      <p className="mt-2 text-sm text-muted">
        Booking and Hotels.com links. Courtesy vs guaranteed still lives in the form below. We do not book the chain.
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm"
        placeholder="City or venue"
      />
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <a className="rounded-full border border-line px-3 py-2" href={`https://www.booking.com/searchresults.html?ss=${encoded}`} target="_blank" rel="noreferrer">
          Booking.com
        </a>
        <a className="rounded-full border border-line px-3 py-2" href={`https://www.hotels.com/Hotel-Search?destination=${encoded}`} target="_blank" rel="noreferrer">
          Hotels.com
        </a>
        <a className="rounded-full border border-line px-3 py-2" href={`https://www.google.com/maps/search/${encoded}`} target="_blank" rel="noreferrer">
          Maps
        </a>
      </div>
    </section>
  );
}

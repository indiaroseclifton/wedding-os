"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { GuestLetter } from "@/components/site/GuestLetter";

type Match = { name: string; rsvpToken: string };
type Seat = {
  name: string;
  seated: boolean;
  tableLabel?: string;
  seatIndex?: number | null;
  plusOneNames?: string[];
  message?: string;
};

export default function FindTablePage() {
  const { token } = useParams<{ token: string }>();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSeat(null);
    const res = await fetch("/api/public/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "lookup", siteToken: token, name: query }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not search");
      return;
    }
    setMatches(data.matches || []);
  }

  async function pick(rsvpToken: string) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/public/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "table", siteToken: token, rsvpToken }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not find your table");
      return;
    }
    setSeat(data);
  }

  return (
    <GuestLetter token={token} title="Find your table">
      <p className="mt-2 text-sm text-ink-soft">Your name as it is on the invite. We only show you your own seat.</p>

      {seat ? (
        <div className="mt-8 rounded-[1.6rem] border border-line bg-surface px-6 py-8 text-center">
          <p className="kicker kicker-moss">{seat.name}</p>
          {seat.seated ? (
            <>
              <p className="mt-3 font-serif text-4xl">{seat.tableLabel}</p>
              <p className="mt-2 text-sm text-muted">
                {seat.seatIndex != null ? `Seat ${seat.seatIndex + 1}` : "Assigned"}
                {seat.plusOneNames?.length ? ` · with ${seat.plusOneNames.join(", ")}` : ""}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">{seat.message}</p>
          )}
          <button
            type="button"
            onClick={() => {
              setSeat(null);
              setMatches(null);
            }}
            className="mt-6 min-h-11 text-xs underline"
          >
            Look up someone else
          </button>
        </div>
      ) : (
        <form onSubmit={lookup} className="mt-6 space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            minLength={3}
            placeholder="Your name"
            autoComplete="name"
            autoCapitalize="words"
            className="field min-h-11 w-full"
          />
          {error && <p className="text-xs text-rose-700">{error}</p>}
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy ? "Looking…" : "Find me"}
          </button>
          {matches && (
            <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
              {matches.length === 0 && (
                <li className="px-4 py-4 text-sm text-muted">No match. Try the name the couple used.</li>
              )}
              {matches.map((m) => (
                <li key={m.rsvpToken}>
                  <button
                    type="button"
                    onClick={() => pick(m.rsvpToken)}
                    className="min-h-11 w-full px-4 py-3 text-left text-sm hover:bg-paper"
                  >
                    {m.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>
      )}
    </GuestLetter>
  );
}

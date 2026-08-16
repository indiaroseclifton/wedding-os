"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Match = { name: string; rsvpToken: string; rsvp: string };

export default function PublicRsvpPage() {
  const { token } = useParams<{ token: string }>();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [guestToken, setGuestToken] = useState("");
  const [name, setName] = useState("");
  const [rsvp, setRsvp] = useState("YES");
  const [plusOnes, setPlusOnes] = useState(0);
  const [dietary, setDietary] = useState("");
  const [meal, setMeal] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!guestToken) return;
    fetch(`/api/public/rsvp?site=${token}&guest=${guestToken}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.guest) return;
        setName(data.guest.name);
        if (["YES", "NO", "MAYBE"].includes(data.guest.rsvp)) setRsvp(data.guest.rsvp);
        setPlusOnes(data.guest.plusOnes || 0);
        setDietary(data.guest.dietary || "");
        setMeal(data.guest.meal || "");
        setNotes(data.guest.notes || "");
      })
      .catch(() => {});
  }, [guestToken, token]);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/public/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit",
        siteToken: token,
        rsvpToken: guestToken,
        rsvp,
        plusOnes,
        dietary,
        meal,
        notes,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-[#f6f3ee] px-5 py-12 text-stone-900">
      <div className="mx-auto max-w-md">
        <Link href={`/w/${token}`} className="text-xs underline">
          Back to the wedding
        </Link>
        <h1 className="mt-4 font-serif text-3xl">RSVP</h1>

        {done ? (
          <p className="mt-6 text-sm text-stone-700">
            Thank you{name ? `, ${name}` : ""}. We have you as{" "}
            <span className="font-medium">{rsvp === "YES" ? "yes" : rsvp === "NO" ? "no" : "maybe"}</span>
            .
          </p>
        ) : !guestToken ? (
          <form onSubmit={lookup} className="mt-6 space-y-3">
            <p className="text-sm text-stone-600">Type your name as it appears on the invite.</p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              minLength={3}
              placeholder="Your name"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
            />
            {error && <p className="text-xs text-rose-700">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white"
            >
              {busy ? "Looking…" : "Find me"}
            </button>
            {matches && (
              <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
                {matches.length === 0 && (
                  <li className="px-4 py-4 text-sm text-stone-500">
                    No match. Try the name the couple used, or message them.
                  </li>
                )}
                {matches.map((m) => (
                  <li key={m.rsvpToken}>
                    <button
                      type="button"
                      onClick={() => {
                        setGuestToken(m.rsvpToken);
                        setName(m.name);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-stone-50"
                    >
                      {m.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <p className="text-sm font-medium">{name}</p>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Will you be there?</legend>
              {[
                ["YES", "Yes"],
                ["NO", "No"],
                ["MAYBE", "Maybe"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="rsvp"
                    checked={rsvp === value}
                    onChange={() => setRsvp(value)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            {rsvp !== "NO" && (
              <>
                <label className="block text-sm">
                  Plus-ones with you
                  <input
                    type="number"
                    min={0}
                    max={8}
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(Number(e.target.value) || 0)}
                    className="mt-1 w-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  Meal
                  <select
                    value={meal}
                    onChange={(e) => setMeal(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">No preference yet</option>
                    <option>Chicken</option>
                    <option>Beef</option>
                    <option>Fish</option>
                    <option>Vegetarian</option>
                    <option>Kids</option>
                  </select>
                </label>
                <label className="block text-sm">
                  Dietary notes
                  <input
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    placeholder="Vegetarian, nut allergy…"
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </>
            )}
            <label className="block text-sm">
              Note for the couple
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            {error && <p className="text-xs text-rose-700">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white"
            >
              {busy ? "Saving…" : "Send RSVP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

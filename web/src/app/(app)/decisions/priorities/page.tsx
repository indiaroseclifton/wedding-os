"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  { id: "guest_experience", label: "Guest experience" },
  { id: "ease_logistics", label: "Ease & logistics" },
  { id: "photography", label: "Photography / video" },
  { id: "food_drink", label: "Food & drink" },
  { id: "budget", label: "Budget control" },
  { id: "personal_style", label: "Personal style" },
  { id: "venue_beauty", label: "Venue beauty" },
  { id: "wedding_party", label: "Wedding party experience" },
];

export default function PrioritiesDecisionPage() {
  const router = useRouter();
  const [ranking, setRanking] = useState(CATEGORIES.map((c) => c.id));
  const [protectTwo, setProtectTwo] = useState<string[]>([]);
  const [nonNegotiables, setNonNegotiables] = useState("");
  const [jointNotes, setJointNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function move(id: string, dir: -1 | 1) {
    setRanking((prev) => {
      const i = prev.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function toggleProtect(id: string) {
    setProtectTwo((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  async function save(status: "EXPLORING" | "DECIDED") {
    setLoading(true);
    setError(null);
    const labels = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
    const summary =
      protectTwo.length > 0
        ? `Protecting: ${protectTwo.map((id) => labels[id]).join(" & ")}`
        : `Top priority: ${labels[ranking[0]]}`;
    try {
      const res = await fetch("/api/decisions/priorities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          summary,
          payload: {
            mode: "together",
            ranking,
            protectTwo,
            nonNegotiables: nonNegotiables
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            jointNotes,
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
        <h1 className="text-2xl font-semibold tracking-tight">Priorities</h1>
        <p className="mt-1 text-sm text-slate-600">
          Rank what matters most, then pick up to two things you will protect if trade-offs appear.
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Rank (top = most important)</p>
        {ranking.map((id, index) => {
          const label = CATEGORIES.find((c) => c.id === id)?.label || id;
          return (
            <div key={id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-2 py-2">
              <span className="w-6 text-xs text-slate-400">{index + 1}</span>
              <span className="flex-1 text-sm">{label}</span>
              <button type="button" onClick={() => move(id, -1)} className="text-xs text-slate-500">↑</button>
              <button type="button" onClick={() => move(id, 1)} className="text-xs text-slate-500">↓</button>
              <button
                type="button"
                onClick={() => toggleProtect(id)}
                className={`rounded px-2 py-0.5 text-xs ${
                  protectTwo.includes(id)
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Protect
              </button>
            </div>
          );
        })}
      </div>

      <label className="block text-sm">
        <span className="font-medium">Non-negotiables (one per line)</span>
        <textarea
          rows={3}
          value={nonNegotiables}
          onChange={(e) => setNonNegotiables(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Guests should not feel rushed…"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Joint notes</span>
        <textarea
          rows={2}
          value={jointNotes}
          onChange={(e) => setJointNotes(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => save("EXPLORING")}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium"
        >
          Save as exploring
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => save("DECIDED")}
          className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Mark decided
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const VIBES = [
  "Romantic classic",
  "Modern minimal",
  "Garden / outdoor",
  "City chic",
  "Rustic warm",
  "Bold & colorful",
  "Not sure yet",
];

export default function StyleDecisionPage() {
  const router = useRouter();
  const [vibe, setVibe] = useState("");
  const [colors, setColors] = useState("");
  const [avoid, setAvoid] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(status: "EXPLORING" | "DECIDED") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/decisions/style-vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          summary: vibe || "Style still exploring",
          payload: { vibe, colors, avoid, notes },
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
        <h1 className="text-2xl font-semibold tracking-tight">Style & vibe</h1>
        <p className="mt-1 text-sm text-slate-600">
          A shared starting point so vendors and DIY choices stay aligned.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Overall vibe</p>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVibe(v)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                vibe === v
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Colors / palette notes</span>
        <input
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Soft neutrals, one deep accent…"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Avoid</span>
        <input
          value={avoid}
          onChange={(e) => setAvoid(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="No heavy glitter, no neon…"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <div className="flex gap-2">
        <button type="button" disabled={loading} onClick={() => save("EXPLORING")} className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium">
          Save as exploring
        </button>
        <button type="button" disabled={loading || !vibe} onClick={() => save("DECIDED")} className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          Mark decided
        </button>
      </div>
    </div>
  );
}

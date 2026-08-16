"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

const VIBES = ["Romantic classic", "Modern minimal", "Garden / outdoor", "City chic", "Rustic warm", "Bold & colorful"];
const FORMAL = ["Black tie", "Cocktail", "Garden party", "Casual", "Not sure"];
const MUSTS = ["Photos first", "Food first", "Dancing first", "Guest comfort", "Stay on budget"];

export default function VisionPage() {
  const [vibe, setVibe] = useState("");
  const [formal, setFormal] = useState("");
  const [colors, setColors] = useState("");
  const [must, setMust] = useState<string[]>([]);
  const [avoid, setAvoid] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/decisions/style-vibe")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const p = d?.decision?.payload || {};
        if (p.vibe) setVibe(p.vibe);
        if (p.formal) setFormal(p.formal);
        if (p.colors) setColors(p.colors);
        if (Array.isArray(p.must)) setMust(p.must);
        if (p.avoid) setAvoid(p.avoid);
        if (p.notes) setNotes(p.notes);
      })
      .catch(() => {});
  }, []);

  function toggleMust(v: string) {
    setMust((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  async function save(status: "EXPLORING" | "DECIDED") {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/decisions/style-vibe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        summary: [vibe, formal].filter(Boolean).join(" · ") || "Vision still open",
        payload: { vibe, formal, colors, must, avoid, notes },
      }),
    });
    setSaving(false);
    setMsg(res.ok ? (status === "DECIDED" ? "Locked. Vendors and DIY will follow this." : "Saved as exploring.") : "Could not save");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <RoomSubnav room="planning" />
      <h1 className="font-serif text-4xl">My vision</h1>
      <p className="mt-1 text-sm text-muted">
        Answer these so browse, DIY, and the guest site stop guessing. Not a moodboard — decisions.
      </p>

      <section className="mt-8 space-y-6">
        <div>
          <p className="text-sm font-medium">How should it feel?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVibe(v)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  vibe === v ? "bg-moss text-ivory" : "border border-line bg-surface"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">How dressed?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FORMAL.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setFormal(v)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  formal === v ? "bg-moss text-ivory" : "border border-line bg-surface"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <label className="block text-sm">
          <span className="font-medium">Colors you keep saying out loud</span>
          <input
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="Champagne, moss, ivory — not ‘neutral’"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>

        <div>
          <p className="text-sm font-medium">If something has to win</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MUSTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => toggleMust(v)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  must.includes(v) ? "bg-moss text-ivory" : "border border-line bg-surface"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <label className="block text-sm">
          <span className="font-medium">Hard no</span>
          <input
            value={avoid}
            onChange={(e) => setAvoid(e.target.value)}
            placeholder="No blush, no mason jars, no sparkler send-off"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Anything else they should know</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => save("EXPLORING")}
            className="rounded-full border border-line px-4 py-2 text-sm"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save("DECIDED")}
            className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory"
          >
            Lock this vision
          </button>
        </div>
        {msg && <p className="text-sm text-muted">{msg}</p>}

        <p className="text-sm text-ink-soft">
          Next:{" "}
          <Link href="/decisions/path" className="underline">
            hire or make
          </Link>{" "}
          each category, or{" "}
          <Link href="/vendors/browse" className="underline">
            find vendors
          </Link>{" "}
          that match.
        </p>
      </section>
    </div>
  );
}

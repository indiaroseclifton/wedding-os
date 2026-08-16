"use client";

import { useEffect, useMemo, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import {
  TIMELINE_OFFSETS,
  applyOffsetId,
  relativeToWedding,
  parseIsoDate,
} from "@/lib/timeline-dates";

type Item = {
  id: string;
  title: string;
  when: string;
  category: string;
  notes?: string;
  done: boolean;
};

export default function TimelinePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [weddingDate, setWeddingDate] = useState("");
  const [title, setTitle] = useState("");
  const [offset, setOffset] = useState("m6");
  const [category, setCategory] = useState("Planning");
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/timeline");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
      if (data.weddingDate) setWeddingDate(data.weddingDate);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const when = weddingDate ? applyOffsetId(weddingDate, offset) : offset;
    const res = await fetch("/api/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, when, category }),
    });
    if (res.ok) {
      setTitle("");
      load();
    }
  }

  async function seed() {
    setBusy(true);
    await fetch("/api/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed" }),
    });
    setBusy(false);
    load();
  }

  async function toggle(id: string, done: boolean) {
    await fetch(`/api/timeline/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    load();
  }

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = parseIsoDate(a.when)?.getTime() ?? 0;
      const db = parseIsoDate(b.when)?.getTime() ?? 0;
      if (da && db) return da - db;
      return a.when.localeCompare(b.when);
    });
  }, [items]);

  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Timeline</h1>
          <p className="mt-1 text-sm text-muted">
            {weddingDate
              ? `Anchored to ${weddingDate}. Pick how far out — we put the date on the line.`
              : "Set the wedding date in Settings first."}
          </p>
        </div>
        {weddingDate && (
          <button
            type="button"
            disabled={busy}
            onClick={seed}
            className="rounded-full border border-line px-3 py-1.5 text-xs disabled:opacity-50"
          >
            Build from the date
          </button>
        )}
      </div>

      <form onSubmit={add} className="flex flex-wrap items-end gap-2 rounded-2xl border border-line bg-surface p-4">
        <label className="text-sm">
          <span className="font-medium">Milestone</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block rounded-lg border border-line bg-paper px-3 py-2 text-sm"
            placeholder="Book photographer"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">When</span>
          <select
            value={offset}
            onChange={(e) => setOffset(e.target.value)}
            className="mt-1 block rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          >
            {TIMELINE_OFFSETS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
                {weddingDate ? ` · ${applyOffsetId(weddingDate, o.id)}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">Category</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          Add
        </button>
      </form>

      <ol className="relative space-y-2 border-l border-line pl-5">
        {sorted.map((item) => (
          <li
            key={item.id}
            className={`rounded-xl border px-4 py-3 ${
              item.done ? "border-line bg-paper/50 opacity-70" : "border-line bg-surface"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-medium ${item.done ? "line-through" : ""}`}>{item.title}</p>
                <p className="text-xs text-muted">
                  {relativeToWedding(item.when, weddingDate)} · {item.category}
                </p>
              </div>
              <button type="button" onClick={() => toggle(item.id, item.done)} className="text-xs underline">
                {item.done ? "Undo" : "Done"}
              </button>
            </div>
          </li>
        ))}
        {!sorted.length && (
          <li className="py-8 text-sm text-muted">No milestones yet. Build from the date.</li>
        )}
      </ol>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

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
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [category, setCategory] = useState("Planning");

  async function load() {
    const res = await fetch("/api/timeline");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, when, category }),
    });
    if (res.ok) {
      setTitle("");
      setWhen("");
      load();
    }
  }

  async function toggle(id: string, done: boolean) {
    await fetch(`/api/timeline/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <p className="mt-1 text-sm text-slate-600">
          Key dates and milestones leading up to the day.
        </p>
      </div>

      <form onSubmit={add} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <span className="font-medium">Milestone</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Book photographer" />
        </label>
        <label className="text-sm">
          <span className="font-medium">When</span>
          <input value={when} onChange={(e) => setWhen(e.target.value)} required className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="2026-09-01 or 6 months out" />
        </label>
        <label className="text-sm">
          <span className="font-medium">Category</span>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
              item.done
                ? "border-slate-100 bg-slate-50 opacity-70"
                : "border-slate-200 bg-white"
            }`}
          >
            <div>
              <p className={`text-sm font-medium ${item.done ? "line-through" : ""}`}>
                {item.title}
              </p>
              <p className="text-xs text-slate-500">
                {item.when} · {item.category}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggle(item.id, item.done)}
              className="text-xs font-medium underline"
            >
              {item.done ? "Undo" : "Done"}
            </button>
          </li>
        ))}
        {!items.length && (
          <li className="py-8 text-center text-sm text-slate-500">No milestones yet</li>
        )}
      </ul>
    </div>
  );
}

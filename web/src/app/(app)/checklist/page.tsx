"use client";

import { useEffect, useState } from "react";

type Item = { id: string; phase: string; title: string; done: boolean; custom?: boolean };
type Phase = { id: string; label: string };

export default function ChecklistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState("1");
  const [filter, setFilter] = useState("all");
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/checklist");
    if (res.ok) {
      const data = await res.json();
      setItems(data.checklist?.items || []);
      setPhases(data.phases || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.checklist?.items) setItems(data.checklist.items);
      return data;
    }
    return null;
  }

  const done = items.filter((i) => i.done).length;
  const visible = items.filter((i) => filter === "all" || i.phase === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planning checklist</h1>
          <p className="mt-1 text-sm text-slate-600">
            12-month planner: venues and photo first, then vendors, hotel blocks, invites, and wrap-up.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const data = await post({ action: "to_timeline" });
            if (data?.added != null) setNote(`Added ${data.added} open items to Timeline`);
          }}
          className="text-xs font-medium underline"
        >
          Add open items to Timeline
        </button>
      </div>

      <p className="text-xs text-slate-500">
        {done} of {items.length} done
      </p>
      {note && <p className="text-xs text-emerald-700">{note}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            filter === "all" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white"
          }`}
        >
          All
        </button>
        {phases.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilter(p.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === p.id ? "bg-slate-900 text-white" : "border border-slate-200 bg-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add", title, phase });
          setTitle("");
        }}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="font-medium">Custom item</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Phase</span>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add
        </button>
      </form>

      {(filter === "all" ? phases : phases.filter((p) => p.id === filter)).map((p) => {
        const group = visible.filter((i) => i.phase === p.id);
        if (!group.length && filter === "all") return null;
        return (
          <div key={p.id}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{p.label}</p>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {group.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => post({ action: "toggle", id: item.id, done: !item.done })}
                    />
                    <span className={item.done ? "text-slate-400 line-through" : ""}>{item.title}</span>
                  </label>
                  {item.custom && (
                    <button
                      type="button"
                      onClick={() => post({ action: "delete", id: item.id })}
                      className="text-xs text-slate-400 underline"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
              {!group.length && (
                <li className="px-4 py-6 text-center text-sm text-slate-500">Nothing in this phase</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

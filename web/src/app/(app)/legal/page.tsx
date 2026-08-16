"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  done: boolean;
};

export default function LegalPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [countyState, setCountyState] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("License");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/legal");
    if (res.ok) {
      const data = await res.json();
      setItems(data.legal?.items || []);
      setCountyState(data.legal?.countyState || "");
      setPrivateNotes(data.legal?.privateNotes || "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.legal?.items) setItems(data.legal.items);
      return data;
    }
    return null;
  }

  async function toggle(id: string, done: boolean) {
    await post({ action: "toggle", id, done: !done });
  }

  async function saveMeta() {
    await post({ action: "meta", countyState, privateNotes });
    setNote("County and notes saved");
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    await post({ action: "add", title, category, dueDate });
    setTitle("");
    setDueDate("");
  }

  async function pushTimeline() {
    const data = await post({ action: "to_timeline" });
    if (data?.added != null) {
      setNote(`Added ${data.added} open item${data.added === 1 ? "" : "s"} to Timeline`);
    }
  }

  const open = items.filter((i) => !i.done).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Legal & admin</h1>
          <p className="mt-1 text-sm text-slate-600">
            License, name change, and private notes — not mixed into the guest list.
          </p>
        </div>
        <button type="button" onClick={pushTimeline} className="text-xs font-medium underline">
          Add open items to Timeline
        </button>
      </div>

      <p className="text-xs text-slate-500">
        {open} open · {items.length} total
      </p>
      {note && <p className="text-xs text-emerald-700">{note}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">County / state</span>
          <input
            value={countyState}
            onChange={(e) => setCountyState(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Fulton County, GA"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Private notes</span>
          <input
            value={privateNotes}
            onChange={(e) => setPrivateNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <button type="button" onClick={saveMeta} className="text-xs font-medium underline">
        Save county & notes
      </button>

      <form onSubmit={addItem} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <span className="font-medium">New item</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option>License</option>
            <option>Name change</option>
            <option>Private</option>
            <option>Other</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">Due</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add
        </button>
      </form>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className={`text-sm font-medium ${item.done ? "line-through text-slate-400" : ""}`}>
                {item.title}
              </p>
              <p className="text-xs text-slate-500">
                {item.category}
                {item.dueDate ? ` · ${item.dueDate}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => toggle(item.id, item.done)} className="text-xs font-medium underline">
                {item.done ? "Undo" : "Done"}
              </button>
              <button
                type="button"
                onClick={() => post({ action: "delete", id: item.id })}
                className="text-xs text-slate-400 underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

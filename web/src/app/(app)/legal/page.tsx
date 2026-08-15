"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  category: string;
  done: boolean;
};

export default function LegalPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [countyState, setCountyState] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");

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

  async function toggle(id: string, done: boolean) {
    const res = await fetch("/api/legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", id, done: !done }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.legal.items);
    }
  }

  async function saveMeta() {
    await fetch("/api/legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "meta", countyState, privateNotes }),
    });
  }

  const open = items.filter((i) => !i.done).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Legal & admin</h1>
        <p className="mt-1 text-sm text-slate-600">
          License, name change, and private notes — not mixed into the guest list.
        </p>
      </div>

      <p className="text-xs text-slate-500">{open} open · {items.length} total</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium">County / state</span>
          <input value={countyState} onChange={(e) => setCountyState(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Fulton County, GA" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Private notes</span>
          <input value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>
      <button type="button" onClick={saveMeta} className="text-xs font-medium underline">
        Save county & notes
      </button>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className={`text-sm font-medium ${item.done ? "line-through text-slate-400" : ""}`}>
                {item.title}
              </p>
              <p className="text-xs text-slate-500">{item.category}</p>
            </div>
            <button type="button" onClick={() => toggle(item.id, item.done)} className="text-xs font-medium underline">
              {item.done ? "Undo" : "Done"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

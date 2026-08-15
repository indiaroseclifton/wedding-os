"use client";

import { useEffect, useState } from "react";

type Pack = { id: string; name: string; description: string };
type Item = { id: string; title: string; timing?: string; done: boolean };

export default function TraditionsPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activePackIds, setActivePackIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  async function load() {
    const res = await fetch("/api/traditions");
    if (res.ok) {
      const data = await res.json();
      setPacks(data.packs || []);
      setItems(data.traditions?.items || []);
      setActivePackIds(data.traditions?.activePackIds || []);
      setNotes(data.traditions?.customNotes || "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function apply(packId: string) {
    const res = await fetch("/api/traditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply_pack", packId }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.traditions.items);
      setActivePackIds(data.traditions.activePackIds);
    }
  }

  async function toggle(id: string, done: boolean) {
    const res = await fetch("/api/traditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", id, done: !done }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.traditions.items);
    }
  }

  async function saveNotes() {
    await fetch("/api/traditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "notes", customNotes: notes }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Traditions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Add cultural or religious checklists; they feed planning without replacing your timeline.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {packs.map((p) => {
          const active = activePackIds.includes(p.id);
          return (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="mt-1 text-xs text-slate-500">{p.description}</p>
              <button
                type="button"
                disabled={active}
                onClick={() => apply(p.id)}
                className="mt-3 text-xs font-medium underline disabled:text-slate-400"
              >
                {active ? "Added" : "Add checklist"}
              </button>
            </div>
          );
        })}
      </div>

      <label className="block text-sm">
        <span className="font-medium">Custom notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="button" onClick={saveNotes} className="mt-2 text-xs font-medium underline">
          Save notes
        </button>
      </label>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className={`text-sm font-medium ${item.done ? "line-through text-slate-400" : ""}`}>
                {item.title}
              </p>
              {item.timing && <p className="text-xs text-slate-500">{item.timing}</p>}
            </div>
            <button type="button" onClick={() => toggle(item.id, item.done)} className="text-xs font-medium underline">
              {item.done ? "Undo" : "Done"}
            </button>
          </li>
        ))}
        {!items.length && (
          <li className="px-4 py-8 text-center text-sm text-slate-500">
            Add a tradition pack to populate checklist items.
          </li>
        )}
      </ul>
    </div>
  );
}

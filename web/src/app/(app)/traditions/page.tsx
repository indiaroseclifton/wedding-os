"use client";

import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import Link from "next/link";

type Pack = { id: string; name: string; description: string };
type Item = { id: string; title: string; timing?: string; done: boolean };

export default function TraditionsPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activePackIds, setActivePackIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

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

  async function pushAllToTimeline() {
    setMsg(null);
    const res = await fetch("/api/traditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "to_timeline" }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg(`Added ${data.added} to timeline${data.skipped ? ` · ${data.skipped} skipped` : ""}`);
    } else {
      setMsg("Could not push to timeline");
    }
  }

  async function pushOne(id: string) {
    await fetch("/api/traditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "item_to_timeline", id }),
    });
    setMsg("Added to timeline");
  }

  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Traditions</h1>
          <p className="mt-1 text-sm text-muted">
            Pick a faith in{" "}
            <Link href="/settings" className="underline">
              Settings
            </Link>{" "}
            and these land on the master checklist. Or add a pack here.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={pushAllToTimeline}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
          >
            Push open items to timeline
          </button>
        )}
      </div>

      {msg && <p className="text-xs text-emerald-700">{msg}</p>}

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
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className={`text-sm font-medium ${item.done ? "line-through text-slate-400" : ""}`}>
                {item.title}
              </p>
              {item.timing && <p className="text-xs text-slate-500">{item.timing}</p>}
            </div>
            <div className="flex gap-3">
              {!item.done && (
                <button type="button" onClick={() => pushOne(item.id)} className="text-xs font-medium underline">
                  → Timeline
                </button>
              )}
              <button type="button" onClick={() => toggle(item.id, item.done)} className="text-xs font-medium underline">
                {item.done ? "Undo" : "Done"}
              </button>
            </div>
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

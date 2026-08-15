"use client";

import { useEffect, useState } from "react";

type Entry = { id: string; body: string; authorName?: string; createdAt: string };

export default function NotesPage() {
  const [pinned, setPinned] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [body, setBody] = useState("");

  async function load() {
    const res = await fetch("/api/notes");
    if (res.ok) {
      const data = await res.json();
      setPinned(data.notes?.pinned || "");
      setEntries(data.notes?.entries || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const data = await res.json();
      setEntries(data.notes.entries);
      setBody("");
    }
  }

  async function savePin() {
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pin", pinned }),
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <p className="mt-1 text-sm text-slate-600">Shared scratchpad for the couple.</p>
      </div>
      <label className="block text-sm">
        <span className="font-medium">Pinned</span>
        <textarea rows={2} value={pinned} onChange={(e) => setPinned(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button type="button" onClick={savePin} className="mt-2 text-xs font-medium underline">
          Save pinned
        </button>
      </label>
      <form onSubmit={add} className="space-y-2">
        <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} required placeholder="Add a note…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add note
        </button>
      </form>
      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={e.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <p className="whitespace-pre-wrap">{e.body}</p>
            <p className="mt-2 text-xs text-slate-400">
              {e.authorName || "Someone"} · {new Date(e.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

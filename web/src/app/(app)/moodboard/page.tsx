"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  url?: string;
  notes?: string;
  tag?: string;
};

export default function MoodboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/moodboard");
    if (res.ok) {
      const data = await res.json();
      setItems(data.moodboard?.items || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/moodboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, notes, tag }),
    });
    if (!res.ok) {
      setError("Could not add");
      return;
    }
    const data = await res.json();
    setItems(data.moodboard.items);
    setTitle("");
    setUrl("");
    setNotes("");
    setTag("");
  }

  async function remove(id: string) {
    const res = await fetch("/api/moodboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.moodboard.items);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Moodboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Links and notes for inspiration or DIY finds (Pinterest, shops, photos).
        </p>
      </div>

      <form onSubmit={add} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Title"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Tag (DIY, florals…)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add to board
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                {item.tag && (
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {item.tag}
                  </span>
                )}
              </div>
              <button type="button" onClick={() => remove(item.id)} className="text-xs text-slate-400 underline">
                Remove
              </button>
            </div>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block truncate text-xs text-sky-700 underline"
              >
                {item.url}
              </a>
            )}
            {item.notes && <p className="mt-2 text-xs text-slate-600">{item.notes}</p>}
          </article>
        ))}
      </div>

      {!items.length && (
        <p className="text-center text-sm text-slate-500">No inspiration saved yet.</p>
      )}
    </div>
  );
}

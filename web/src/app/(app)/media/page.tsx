"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  title: string;
  url: string;
  kind: string;
  source?: string;
  notes?: string;
};

export default function MediaPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState("ALBUM");
  const [source, setSource] = useState("Photographer");
  const [notes, setNotes] = useState("");

  async function load() {
    const res = await fetch("/api/media");
    if (res.ok) {
      const data = await res.json();
      setItems(data.media?.items || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url, kind, source, notes }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.media.items);
      setTitle("");
      setUrl("");
      setNotes("");
    }
  }

  async function remove(id: string) {
    const res = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.media.items);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title">Media hub</h1>
        <p className="mt-1 text-sm text-muted">
          Central links for photographer galleries, guest albums, and video — no more buried emails.
        </p>
      </div>

      <form onSubmit={add} className="space-y-3 glass-panel rounded-2xl p-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Title" className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
        <input value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://gallery…" className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm">
            <option value="ALBUM">Album / gallery</option>
            <option value="PHOTO">Photo link</option>
            <option value="VIDEO">Video</option>
            <option value="OTHER">Other</option>
          </select>
          <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source" className="rounded-lg border border-line px-3 py-2 text-sm" />
        </div>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="w-full rounded-lg border border-line px-3 py-2 text-sm" />
        <button type="submit" className="btn btn-primary">
          Add link
        </button>
      </form>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="glass-panel rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted">
                  {item.kind}
                  {item.source ? ` · ${item.source}` : ""}
                </p>
                <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 block truncate text-xs text-sky-700 underline">
                  {item.url}
                </a>
                {item.notes && <p className="mt-2 text-xs text-muted">{item.notes}</p>}
              </div>
              <button type="button" onClick={() => remove(item.id)} className="text-xs text-muted underline">
                Remove
              </button>
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="py-8 text-center text-sm text-muted">No media links yet</li>
        )}
      </ul>
    </div>
  );
}

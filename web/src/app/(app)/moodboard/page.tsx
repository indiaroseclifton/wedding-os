"use client";

import { useEffect, useMemo, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

type Item = {
  id: string;
  title: string;
  url?: string;
  notes?: string;
  tag?: string;
};

const TAGS = ["Florals", "Tables", "Dress", "Venue", "Paper", "Other"];
const STARTERS = [
  { title: "Linen tablescape", url: "/brand/tablescape.jpg", tag: "Tables" },
  { title: "Garden light", url: "/brand/garden.jpg", tag: "Venue" },
  { title: "Stems", url: "/brand/flowers.jpg", tag: "Florals" },
  { title: "Place setting", url: "/brand/setting.jpg", tag: "Tables" },
  { title: "Candlelight", url: "/brand/candles.jpg", tag: "Florals" },
];

function isImageUrl(url?: string) {
  if (!url) return false;
  if (url.startsWith("/brand/")) return true;
  return /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(url);
}

export default function MoodboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [tag, setTag] = useState("Florals");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

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
      body: JSON.stringify({ title: title || tag, url, notes, tag }),
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
  }

  async function addStarter(s: (typeof STARTERS)[number]) {
    const res = await fetch("/api/moodboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.moodboard.items);
    }
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

  async function useCover(coverUrl: string) {
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverUrl }),
    });
    setMsg(res.ok ? "Cover updated" : "Could not set cover");
  }

  const visible = useMemo(
    () => (filter === "ALL" ? items : items.filter((i) => i.tag === filter)),
    [items, filter]
  );

  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <div>
        <h1 className="font-serif text-4xl">Moodboard</h1>
        <p className="mt-1 text-sm text-muted">Pictures first. Paste a photo URL or pin a still.</p>
      </div>

      <form onSubmit={add} className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL (jpg, png, webp) or any link"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          >
            {TAGS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-xs text-clay">{error}</p>}
        <button type="submit" className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          Pin
        </button>
      </form>

      {!items.length && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">Start with a still</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {STARTERS.map((s) => (
              <button
                key={s.url}
                type="button"
                onClick={() => addStarter(s)}
                className="overflow-hidden rounded-xl"
              >
                <img src={s.url} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {["ALL", ...TAGS].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1 text-xs ${filter === t ? "bg-moss text-ivory" : "border border-line"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {msg && <p className="text-xs text-moss">{msg}</p>}

      <div className="columns-2 gap-3 sm:columns-3">
        {visible.map((item) => (
          <article key={item.id} className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface">
            {isImageUrl(item.url) && (
              <img src={item.url} alt="" className="w-full object-cover" />
            )}
            <div className="p-3">
              <p className="text-sm font-medium">{item.title}</p>
              {item.tag && <p className="text-[11px] text-muted">{item.tag}</p>}
              {item.notes && <p className="mt-1 text-xs text-ink-soft">{item.notes}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {item.url && isImageUrl(item.url) && (
                  <button type="button" onClick={() => useCover(item.url!)} className="text-[11px] underline">
                    Use as cover
                  </button>
                )}
                {item.url && !item.url.startsWith("/") && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] underline">
                    Open
                  </a>
                )}
                <button type="button" onClick={() => remove(item.id)} className="text-[11px] text-muted underline">
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

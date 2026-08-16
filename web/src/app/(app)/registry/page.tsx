"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LinkItem = { id: string; store: string; url: string; notes?: string };
type Gift = { id: string; from: string; description: string; received: boolean };

export default function RegistryPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [store, setStore] = useState("");
  const [url, setUrl] = useState("");
  const [from, setFrom] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    const res = await fetch("/api/registry");
    if (res.ok) {
      const data = await res.json();
      setLinks(data.registry?.links || []);
      setGifts(data.registry?.gifts || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/registry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setLinks(data.registry?.links || []);
      setGifts(data.registry?.gifts || []);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Registry</h1>
          <p className="mt-1 text-sm text-slate-600">
            Store links plus a gift log so thank-you notes stay honest.
          </p>
        </div>
        <Link href="/thanks" className="text-xs font-medium underline">
          Thank-you tracker
        </Link>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add_link", store, url });
          setStore("");
          setUrl("");
        }}
        className="space-y-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <p className="text-sm font-medium">Registry link</p>
        <input
          value={store}
          onChange={(e) => setStore(e.target.value)}
          required
          placeholder="Zola, Amazon, Target…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="https://…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add link
        </button>
      </form>

      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.id} className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <div>
              <p className="font-medium">{l.store}</p>
              <a href={l.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-sky-700 underline">
                {l.url}
              </a>
            </div>
            <button
              type="button"
              onClick={() => post({ action: "delete_link", id: l.id })}
              className="text-xs text-slate-400 underline"
            >
              Remove
            </button>
          </li>
        ))}
        {!links.length && <li className="text-sm text-slate-500">No registry links yet</li>}
      </ul>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add_gift", from, description });
          setFrom("");
          setDescription("");
        }}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="font-medium">From</span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Gift</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Log gift
        </button>
      </form>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {gifts.map((g) => (
          <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{g.from}</p>
              <p className="text-xs text-slate-500">{g.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => post({ action: "toggle_gift", id: g.id, received: !g.received })}
                className="text-xs font-medium underline"
              >
                {g.received ? "Received" : "Mark received"}
              </button>
              <button
                type="button"
                onClick={() => post({ action: "delete_gift", id: g.id })}
                className="text-xs text-slate-400 underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {!gifts.length && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">No gifts logged yet</li>
        )}
      </ul>
    </div>
  );
}

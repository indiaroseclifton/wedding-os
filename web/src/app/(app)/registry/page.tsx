"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

type LinkItem = { id: string; store: string; url: string };
type Item = {
  id: string;
  name: string;
  url?: string;
  qty: number;
  status: "OPEN" | "CLAIMED" | "PURCHASED";
  claimedBy?: string;
  price?: number;
};
type Gift = { id: string; from: string; description: string; received: boolean };

export default function RegistryPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [store, setStore] = useState("");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [from, setFrom] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/registry");
    if (res.ok) {
      const data = await res.json();
      setLinks(data.registry?.links || []);
      setItems(data.registry?.items || []);
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
      setItems(data.registry?.items || []);
      setGifts(data.registry?.gifts || []);
      if (body.action === "to_thanks") setMsg("Copied received gifts into thank-yous.");
    }
  }

  const open = items.filter((i) => i.status === "OPEN").length;
  const claimed = items.filter((i) => i.status === "CLAIMED").length;
  const bought = items.filter((i) => i.status === "PURCHASED").length;

  return (
    <div className="space-y-6">
      <RoomSubnav room="budget" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Registry</h1>
          <p className="mt-1 text-sm text-muted">
            Items you want, who claimed them, what arrived — then thank-yous from the same list.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => post({ action: "to_thanks" })} className="rounded-full border border-line px-3 py-1.5 text-xs">
            Send to thank-yous
          </button>
          <Link href="/thanks" className="rounded-full border border-line px-3 py-1.5 text-xs">
            Thank-yous
          </Link>
        </div>
      </div>
      {msg && <p className="text-xs text-moss">{msg}</p>}

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Open", open],
          ["Claimed", claimed],
          ["Purchased", bought],
        ].map(([l, n]) => (
          <div key={String(l)} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted">{l}</p>
            <p className="font-serif text-3xl">{n}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add_item", name, url: itemUrl });
          setName("");
          setItemUrl("");
        }}
        className="space-y-2 rounded-2xl border border-line bg-surface p-4"
      >
        <p className="text-sm font-medium">Add an item</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Linen napkins, stand mixer…"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <input
          value={itemUrl}
          onChange={(e) => setItemUrl(e.target.value)}
          placeholder="Link (optional)"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          Add item
        </button>
      </form>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {items.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{i.name}</p>
              {i.claimedBy && <p className="text-xs text-muted">{i.claimedBy}</p>}
              {i.url && (
                <a href={i.url} className="text-xs underline" target="_blank" rel="noreferrer">
                  Open
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={i.status}
                onChange={(e) => post({ action: "patch_item", id: i.id, status: e.target.value })}
                className="rounded-lg border border-line px-2 py-1 text-xs"
              >
                <option value="OPEN">Open</option>
                <option value="CLAIMED">Claimed</option>
                <option value="PURCHASED">Purchased</option>
              </select>
              {i.status !== "OPEN" && (
                <input
                  defaultValue={i.claimedBy || ""}
                  placeholder="Who"
                  onBlur={(e) => post({ action: "patch_item", id: i.id, claimedBy: e.target.value })}
                  className="w-28 rounded-lg border border-line px-2 py-1 text-xs"
                />
              )}
              <button type="button" onClick={() => post({ action: "delete_item", id: i.id })} className="text-xs text-muted underline">
                Remove
              </button>
            </div>
          </li>
        ))}
        {!items.length && <li className="px-4 py-6 text-center text-sm text-muted">No items yet — add what you actually want.</li>}
      </ul>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add_link", store, url });
          setStore("");
          setUrl("");
        }}
        className="space-y-2 rounded-2xl border border-line bg-surface p-4"
      >
        <p className="text-sm font-medium">Store link</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={store}
            onChange={(e) => setStore(e.target.value)}
            required
            placeholder="Zola, Amazon…"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://…"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm">
          Add store
        </button>
      </form>

      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.id} className="flex justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm">
            <a href={l.url} className="underline" target="_blank" rel="noreferrer">
              {l.store}
            </a>
            <button type="button" onClick={() => post({ action: "delete_link", id: l.id })} className="text-xs text-muted underline">
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add_gift", from, description });
          setFrom("");
          setDescription("");
        }}
        className="flex flex-wrap items-end gap-2 rounded-2xl border border-line bg-surface p-4"
      >
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
          placeholder="From"
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="What they gave"
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          Log gift
        </button>
      </form>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {gifts.map((g) => (
          <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{g.from}</p>
              <p className="text-xs text-muted">{g.description}</p>
            </div>
            <button type="button" onClick={() => post({ action: "toggle_gift", id: g.id, received: !g.received })} className="text-xs underline">
              {g.received ? "Received" : "Mark received"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

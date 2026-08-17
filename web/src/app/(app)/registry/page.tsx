"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { StoreCards } from "@/components/registry/StoreCards";
import { KNOWN_STORES } from "@/lib/registry-stores";

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
      <RoomSubnav room="planning" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker">Plan</p>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,6vw,3.6rem)] leading-none tracking-tight">Registry</h1>
          <p className="home-script mt-2">They shop there. We keep the thank-yous.</p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Paste a Zola, Amazon, Bloomingdale’s, Anthropologie, or Macy’s URL. Guests open their site. We never iframe the mall.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => post({ action: "to_thanks" })} className="btn btn-ghost">
            Send to thank-yous
          </button>
          <Link href="/thanks" className="btn btn-ghost">
            Thank-yous
          </Link>
        </div>
      </div>
      {msg && <p className="text-xs text-sage">{msg}</p>}

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="kicker">Their stores</p>
        <h2 className="mt-1 font-serif text-2xl tracking-tight">Paste the public URL.</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await post({ action: "add_link", store, url });
            setStore("");
            setUrl("");
          }}
          className="mt-4 space-y-3"
        >
          <div className="flex flex-wrap gap-2">
            {KNOWN_STORES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStore(s.name);
                  if (!url) setUrl(s.start);
                }}
                className={`min-h-11 rounded-full px-4 text-sm ${store === s.name ? "bg-ink text-ivory" : "border border-line"}`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://www.amazon.com/wedding/your-registry"
            className="field w-full"
          />
          <button type="submit" className="btn btn-primary">
            Add store
          </button>
        </form>
        <div className="mt-5">
          <StoreCards links={links} onRemove={(id) => post({ action: "delete_link", id })} />
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Open", open],
          ["Claimed", claimed],
          ["Purchased", bought],
        ].map(([l, n]) => (
          <div key={String(l)} className="rounded-2xl border border-line bg-surface p-4">
            <p className="kicker">{l}</p>
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
        <p className="kicker">Also here</p>
        <p className="text-sm font-medium">A short list you keep in Vowfolk</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Linen napkins, stand mixer…"
          className="field w-full"
        />
        <input
          value={itemUrl}
          onChange={(e) => setItemUrl(e.target.value)}
          placeholder="Link (optional)"
          className="field w-full"
        />
        <button type="submit" className="btn btn-primary">
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
          className="field"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="What they gave"
          className="field"
        />
        <button type="submit" className="btn btn-primary">
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

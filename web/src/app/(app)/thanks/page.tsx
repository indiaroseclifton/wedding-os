"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = {
  id: string;
  guestName: string;
  gift?: string;
  status: "TODO" | "SENT";
  sentDate?: string;
};

export default function ThanksPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [guestName, setGuestName] = useState("");
  const [gift, setGift] = useState("");
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/thanks");
    if (res.ok) {
      const data = await res.json();
      setItems(data.thanks?.items || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/thanks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.thanks?.items) setItems(data.thanks.items);
      return data;
    }
    return null;
  }

  const open = items.filter((i) => i.status !== "SENT").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thank-you notes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Aim to send within three months. Import gifts from Registry so you don’t miss anyone.
          </p>
        </div>
        <Link href="/registry" className="text-xs font-medium underline">
          Registry
        </Link>
      </div>

      <p className="text-xs text-slate-500">
        {open} still to write · {items.length} total
      </p>
      {note && <p className="text-xs text-emerald-700">{note}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            await post({ action: "import_gifts" });
            setNote("Pulled gifts from Registry (skips duplicates)");
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
        >
          Import gifts from Registry
        </button>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add", guestName, gift });
          setGuestName("");
          setGift("");
        }}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="font-medium">Name</span>
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Gift (optional)</span>
          <input
            value={gift}
            onChange={(e) => setGift(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add
        </button>
      </form>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className={item.status === "SENT" ? "text-slate-400 line-through" : "font-medium"}>
                {item.guestName}
              </p>
              <p className="text-xs text-slate-500">
                {item.gift || "—"}
                {item.sentDate ? ` · sent ${item.sentDate}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  post({
                    action: "toggle",
                    id: item.id,
                    status: item.status === "SENT" ? "TODO" : "SENT",
                  })
                }
                className="text-xs font-medium underline"
              >
                {item.status === "SENT" ? "Undo" : "Mark sent"}
              </button>
              <button
                type="button"
                onClick={() => post({ action: "delete", id: item.id })}
                className="text-xs text-slate-400 underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">No thank-yous yet</li>
        )}
      </ul>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VendorGut } from "@/components/vendors/VendorGut";
import { googleReviewUrl, type GutMark } from "@/lib/vendor-gut";

type Item = {
  id: string;
  guestName: string;
  gift?: string;
  status: "TODO" | "SENT";
  sentDate?: string;
};

type Team = {
  id: string;
  name: string;
  category: string;
  website?: string;
  gutMark?: GutMark;
  gutNote?: string;
};

export default function ThanksPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [team, setTeam] = useState<Team[]>([]);
  const [city, setCity] = useState("");
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
    fetch("/api/vendors")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setTeam(d?.vendors || []))
      .catch(() => {});
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCity(d?.meta?.location || ""))
      .catch(() => {});
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

      {team.length ? (
        <section id="team" className="space-y-3 rounded-[1.6rem] border border-line bg-surface p-5">
          <p className="kicker kicker-moss">The people who made the day</p>
          <h2 className="font-serif text-2xl">Mark them. Tell Google if you want.</h2>
          <p className="text-sm text-muted">
            Yes / Maybe / No stays on your desk. Public praise lives on their Google page — we don’t host reviews.
          </p>
          <ul className="space-y-4">
            {team.map((v) => (
              <li key={v.id} className="border-t border-line pt-4 first:border-0 first:pt-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-xs text-muted">{v.category}</p>
                  </div>
                  <a
                    href={googleReviewUrl(v.name, city)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline"
                  >
                    Tell Google
                  </a>
                </div>
                <div className="mt-2">
                  <VendorGut vendorId={v.id} mark={v.gutMark} note={v.gutNote} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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

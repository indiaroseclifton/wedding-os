"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VendorGut } from "@/components/vendors/VendorGut";
import { googleReviewUrl, type GutMark } from "@/lib/vendor-gut";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { EmptyState } from "@/components/ui/EmptyState";

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
      <RoomSubnav room="planning" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker kicker-moss">Planning</p>
          <h1 className="title mt-2">Thank-you notes</h1>
          <p className="deck mt-2">
            Industry practice is three months. After walks the stack. This is the full list.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/after" className="btn btn-ghost">
            After
          </Link>
          <Link href="/registry" className="btn btn-ghost">
            Registry
          </Link>
        </div>
      </div>

      <p className="text-xs text-muted">
        {open} still to write · {items.length} total
      </p>
      {note && <p className="text-xs text-moss">{note}</p>}

      {team.length ? (
        <section id="team" className="glass-panel space-y-3 rounded-2xl p-5">
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
          className="btn btn-ghost"
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
        className="glass-panel flex flex-wrap items-end gap-2 rounded-2xl p-5"
      >
        <label className="text-sm">
          <span className="kicker">Name</span>
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            className="field mt-1"
          />
        </label>
        <label className="text-sm">
          <span className="kicker">Gift (optional)</span>
          <input
            value={gift}
            onChange={(e) => setGift(e.target.value)}
            className="field mt-1"
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No thank-yous yet"
          body="Add a name, or pull gifts from Registry."
        />
      ) : (
        <ul className="panel divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className={item.status === "SENT" ? "text-muted line-through" : "font-medium"}>
                  {item.guestName}
                </p>
                <p className="text-xs text-muted">
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
                  className="text-xs text-muted underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

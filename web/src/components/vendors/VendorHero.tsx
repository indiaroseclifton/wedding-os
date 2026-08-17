"use client";

import Link from "next/link";
import { useState } from "react";
import { faceFor } from "@/lib/vendor-face";
import { Icon } from "@/components/icons";

const STATUSES = [
  "RESEARCHING",
  "CONTACTED",
  "PROPOSAL",
  "BOOKED",
  "PAID_DEPOSIT",
  "DONE",
  "PASSED",
] as const;

const CATEGORIES = [
  "Venue",
  "Photographer",
  "Videographer",
  "Florist",
  "Catering",
  "DJ / Band",
  "Planner",
  "Officiant",
  "Cake",
  "Hair / Makeup",
  "Rentals",
  "Transportation",
  "Other",
];

export type HeroVendor = {
  id: string;
  name: string;
  category: string;
  status: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  contactName?: string;
};

export function VendorHero({
  vendor,
  paid,
  open,
  flags,
  strip,
  onSaved,
}: {
  vendor: HeroVendor;
  paid: number;
  open: number;
  flags: number;
  strip?: string;
  onSaved: (v: HeroVendor) => void;
}) {
  const face = faceFor(vendor.category);
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(vendor);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          category: draft.category,
          status: draft.status,
          contactName: draft.contactName,
          email: draft.email,
          phone: draft.phone,
          website: draft.website,
          notes: draft.notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.vendor) {
        onSaved(data.vendor);
        setEdit(false);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="overflow-hidden rounded-[1.8rem] border border-line bg-surface">
      <div className="relative h-52 sm:h-64">
        <img src={face.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="kicker text-ivory/80">{face.eyebrow}</p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-ivory sm:text-5xl">{vendor.name}</h1>
          <p className="mt-2 text-sm text-ivory/85">
            {vendor.category}
            {vendor.contactName ? ` · ${vendor.contactName}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7">
        <p className="text-sm text-muted">
          {vendor.status.replaceAll("_", " ").toLowerCase()}
          {paid || open ? ` · $${paid.toLocaleString()} paid` : ""}
          {open ? ` · $${open.toLocaleString()} open` : ""}
          {flags ? ` · ${flags} flag${flags === 1 ? "" : "s"}` : ""}
          {strip ? ` · ${strip}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/send/${vendor.id}`}
            className="inline-flex min-h-11 items-center rounded-full bg-moss px-4 text-sm font-medium text-ivory"
          >
            Their page
          </Link>
          <button
            type="button"
            onClick={() => {
              setDraft(vendor);
              setEdit((v) => !v);
            }}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm"
          >
            <Icon name="edit" className="h-3.5 w-3.5" />
            {edit ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {edit && (
        <form onSubmit={save} className="grid gap-3 border-t border-line px-5 py-5 sm:grid-cols-2 sm:px-7">
          <label className="text-sm sm:col-span-2">
            Name
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="mt-1 w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm"
            />
          </label>
          <label className="text-sm">
            Category
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="mt-1 w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm"
            >
              {[draft.category, ...CATEGORIES.filter((c) => c !== draft.category)].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Status
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              className="mt-1 w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Email
            <input
              value={draft.email || ""}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="mt-1 w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm"
            />
          </label>
          <label className="text-sm">
            Phone
            <input
              value={draft.phone || ""}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              className="mt-1 w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Notes
            <textarea
              value={draft.notes || ""}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-sm"
            />
          </label>
          <p className="text-xs text-muted sm:col-span-2">
            Change the category and the checklist + what we ask them for follow the trade. Money stays.
          </p>
          <button
            type="submit"
            disabled={busy || !draft.name.trim()}
            className="min-h-11 rounded-full bg-moss px-5 text-sm text-ivory disabled:opacity-50 sm:col-span-2"
          >
            {busy ? "Saving…" : "Save card"}
          </button>
        </form>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DIRECTORY_CATEGORIES } from "@/lib/data/vendor-directory";

type Listing = {
  slug: string;
  name: string;
  category: string;
  city: string;
  metro: string;
  priceBand: string;
  startingFrom: string;
  styles: string[];
  blurb: string;
};

export default function VendorBrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [hired, setHired] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const [band, setBand] = useState("All");
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch("/api/directory");
    if (!res.ok) return;
    const data = await res.json();
    setListings(data.listings || []);
    setShortlist(data.shortlist || []);
    setHired(data.hiredSlugs || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(slug: string) {
    const res = await fetch("/api/directory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "shortlist", slug }),
    });
    if (res.ok) {
      const data = await res.json();
      setShortlist(data.shortlist || []);
    }
  }

  const rows = useMemo(() => {
    return listings.filter((v) => {
      if (category !== "All" && v.category !== category) return false;
      if (band !== "All" && v.priceBand !== band) return false;
      if (q.trim()) {
        const hay = `${v.name} ${v.city} ${v.blurb} ${v.styles.join(" ")}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [listings, category, band, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Vendors</p>
          <h1 className="text-2xl font-semibold tracking-tight">Browse</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pick people the way you would on a marketplace — then run them from this app.
            Demo directory for Atlanta metro (fictional listings).
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/vendors" className="rounded-lg border border-slate-300 px-3 py-2">
            My vendors
          </Link>
          <Link href="/vendors/shortlist" className="rounded-lg border border-slate-300 px-3 py-2">
            Shortlist ({shortlist.length})
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search style, name, city"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-56"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option>All</option>
          {DIRECTORY_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={band}
          onChange={(e) => setBand(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option>All</option>
          <option value="$">$</option>
          <option value="$$">$$</option>
          <option value="$$$">$$$</option>
        </select>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((v) => {
          const saved = shortlist.includes(v.slug);
          const onTeam = hired.includes(v.slug);
          return (
            <li key={v.slug} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{v.name}</p>
                  <p className="text-xs text-slate-500">
                    {v.category} · {v.city} · {v.priceBand} · from {v.startingFrom}
                  </p>
                </div>
                {onTeam && <span className="text-xs font-medium text-emerald-700">On your list</span>}
              </div>
              <p className="mt-2 flex-1 text-sm text-slate-600">{v.blurb}</p>
              <p className="mt-2 text-xs text-slate-500">{v.styles.join(" · ")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/vendors/browse/${v.slug}`} className="text-xs font-medium underline">
                  Open
                </Link>
                <button type="button" onClick={() => toggle(v.slug)} className="text-xs font-medium underline">
                  {saved ? "Remove shortlist" : "Shortlist"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 && <p className="text-sm text-slate-500">No listings match.</p>}
    </div>
  );
}

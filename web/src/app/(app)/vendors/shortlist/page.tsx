"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Listing = {
  slug: string;
  name: string;
  category: string;
  city: string;
  priceBand: string;
  startingFrom: string;
  blurb: string;
};

export default function ShortlistPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [hired, setHired] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);

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

  const rows = useMemo(
    () => listings.filter((v) => shortlist.includes(v.slug)),
    [listings, shortlist]
  );

  const compared = listings.filter((v) => compare.includes(v.slug));

  function toggleCompare(slug: string) {
    setCompare((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  }

  async function hire(slug: string) {
    const res = await fetch("/api/directory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "hire", slug, status: "RESEARCHING" }),
    });
    if (res.ok) load();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/vendors/browse" className="text-xs font-medium underline">
          Browse
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Shortlist</h1>
        <p className="mt-1 text-sm text-slate-600">
          Compare up to three, then add the one you want to your wedding.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nothing saved yet.{" "}
          <Link href="/vendors/browse" className="underline">
            Browse vendors
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {rows.map((v) => (
            <li key={v.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{v.name}</p>
                <p className="text-xs text-slate-500">
                  {v.category} · {v.city} · {v.priceBand} · {v.startingFrom}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs">
                  <input
                    type="checkbox"
                    checked={compare.includes(v.slug)}
                    onChange={() => toggleCompare(v.slug)}
                    className="mr-1"
                  />
                  Compare
                </label>
                <Link href={`/vendors/browse/${v.slug}`} className="text-xs underline">
                  Open
                </Link>
                {hired.includes(v.slug) ? (
                  <span className="text-xs text-emerald-700">On your list</span>
                ) : (
                  <button type="button" onClick={() => hire(v.slug)} className="text-xs underline">
                    Add to wedding
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {compared.length > 1 && (
        <div className="overflow-x-auto">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Compare</p>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3"> </th>
                {compared.map((v) => (
                  <th key={v.slug} className="py-2 pr-3 font-medium text-slate-900">
                    {v.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-3 text-xs font-medium text-slate-500">Category</td>
                {compared.map((v) => (
                  <td key={v.slug} className="py-2 pr-3">
                    {v.category}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-3 text-xs font-medium text-slate-500">From</td>
                {compared.map((v) => (
                  <td key={v.slug} className="py-2 pr-3">
                    {v.startingFrom}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-3 text-xs font-medium text-slate-500">Fit</td>
                {compared.map((v) => (
                  <td key={v.slug} className="py-2 pr-3">
                    {v.blurb}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

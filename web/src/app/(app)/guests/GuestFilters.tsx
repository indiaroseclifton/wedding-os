"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Guest = {
  id: string;
  name: string;
  rsvp: string;
  dietary?: string;
  tableLabel?: string;
};

const FILTERS = ["ALL", "YES", "NO", "MAYBE", "INVITED", "UNKNOWN"] as const;

export function GuestFilters({ guests }: { guests: Guest[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  const visible = useMemo(() => {
    if (filter === "ALL") return guests;
    return guests.filter((g) => g.rsvp === filter);
  }, [guests, filter]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === f
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            {f === "ALL" ? "All" : f}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {visible.map((g) => (
          <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{g.name}</p>
              <p className="text-xs text-slate-500">
                {g.rsvp}
                {g.dietary ? ` · ${g.dietary}` : ""}
                {g.tableLabel ? ` · ${g.tableLabel}` : ""}
              </p>
            </div>
            <Link href={`/guests/${g.id}`} className="text-xs font-medium underline">
              Edit
            </Link>
          </li>
        ))}
        {!visible.length && (
          <li className="px-4 py-8 text-center text-sm text-slate-500">No guests in this filter</li>
        )}
      </ul>
    </div>
  );
}

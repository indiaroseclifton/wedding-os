"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Guest = {
  id: string;
  name: string;
  rsvp: string;
  dietary?: string;
  tableLabel?: string;
};

const FILTERS = ["ALL", "YES", "NO", "MAYBE", "INVITED", "UNKNOWN"] as const;
const RSVPS = ["UNKNOWN", "INVITED", "YES", "NO", "MAYBE"] as const;

export function GuestFilters({ guests }: { guests: Guest[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [rows, setRows] = useState(guests);
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (filter === "ALL") return rows;
    return rows.filter((g) => g.rsvp === filter);
  }, [rows, filter]);

  async function setRsvp(id: string, rsvp: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvp }),
      });
      if (res.ok) {
        setRows((prev) => prev.map((g) => (g.id === id ? { ...g, rsvp } : g)));
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

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
          <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{g.name}</p>
              <p className="text-xs text-slate-500">
                {g.dietary ? `${g.dietary}` : "No dietary note"}
                {g.tableLabel ? ` · ${g.tableLabel}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                disabled={busy === g.id}
                value={g.rsvp}
                onChange={(e) => setRsvp(g.id, e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
              >
                {RSVPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Link href={`/guests/${g.id}`} className="text-xs font-medium underline">
                Edit
              </Link>
            </div>
          </li>
        ))}
        {!visible.length && (
          <li className="px-4 py-8 text-center text-sm text-slate-500">No guests in this filter</li>
        )}
      </ul>
    </div>
  );
}

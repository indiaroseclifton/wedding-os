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
  side?: string;
};

const FILTERS = ["ALL", "YES", "NO", "MAYBE", "INVITED", "UNKNOWN"] as const;
const RSVPS = ["UNKNOWN", "INVITED", "YES", "NO", "MAYBE"] as const;

export function GuestFilters({
  guests,
  tableNames = [],
}: {
  guests: Guest[];
  tableNames?: string[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [rows, setRows] = useState(guests);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkRsvp, setBulkRsvp] = useState("YES");
  const [bulkTable, setBulkTable] = useState("");
  const [bulkSide, setBulkSide] = useState("A");

  const visible = useMemo(() => {
    if (filter === "ALL") return rows;
    return rows.filter((g) => g.rsvp === filter);
  }, [rows, filter]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((g) => selected.has(g.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const g of visible) next.delete(g.id);
      } else {
        for (const g of visible) next.add(g.id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function runBulk(body: Record<string, unknown>) {
    if (!selected.size) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/guests/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Bulk action failed");

      if (body.action === "delete") {
        const ids = selected;
        setRows((prev) => prev.filter((g) => !ids.has(g.id)));
        clearSelection();
      } else if (body.action === "rsvp") {
        const rsvp = String(body.rsvp);
        setRows((prev) =>
          prev.map((g) => (selected.has(g.id) ? { ...g, rsvp } : g))
        );
      } else if (body.action === "table") {
        const tableLabel =
          body.tableLabel === null || body.tableLabel === ""
            ? undefined
            : String(body.tableLabel);
        setRows((prev) =>
          prev.map((g) =>
            selected.has(g.id) ? { ...g, tableLabel: tableLabel || undefined } : g
          )
        );
      } else if (body.action === "side") {
        const side = String(body.side);
        setRows((prev) =>
          prev.map((g) => (selected.has(g.id) ? { ...g, side } : g))
        );
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setBusy(false);
    }
  }

  async function setRsvp(id: string, rsvp: string) {
    setBusy(true);
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
      setBusy(false);
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

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={toggleAllVisible}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium"
        >
          {allVisibleSelected ? "Clear visible" : "Select visible"}
        </button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium"
          >
            Clear ({selected.size})
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="space-y-3 rounded-xl border border-slate-900/10 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            Bulk actions · {selected.size} selected
          </p>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="font-medium">RSVP</span>
              <select
                value={bulkRsvp}
                onChange={(e) => setBulkRsvp(e.target.value)}
                className="mt-1 block rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
              >
                {RSVPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => runBulk({ action: "rsvp", rsvp: bulkRsvp })}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Apply RSVP
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="font-medium">Table</span>
              <select
                value={bulkTable}
                onChange={(e) => setBulkTable(e.target.value)}
                className="mt-1 block rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
              >
                <option value="">Unassign</option>
                {tableNames.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                runBulk({
                  action: "table",
                  tableLabel: bulkTable || null,
                })
              }
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Apply table
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="font-medium">Side</span>
              <select
                value={bulkSide}
                onChange={(e) => setBulkSide(e.target.value)}
                className="mt-1 block rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
              >
                <option value="A">Side A</option>
                <option value="B">Side B</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => runBulk({ action: "side", side: bulkSide })}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Apply side
            </button>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (
                confirm(
                  `Delete ${selected.size} guest${selected.size === 1 ? "" : "s"}? This cannot be undone.`
                )
              ) {
                runBulk({ action: "delete" });
              }
            }}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-50"
          >
            Delete selected
          </button>

          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      )}

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {visible.map((g) => (
          <li key={g.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={selected.has(g.id)}
              onChange={() => toggleOne(g.id)}
              className="h-4 w-4 rounded border-slate-300"
              aria-label={`Select ${g.name}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{g.name}</p>
              <p className="text-xs text-slate-500">
                {g.dietary ? `${g.dietary}` : "No dietary note"}
                {g.tableLabel ? ` · ${g.tableLabel}` : ""}
                {g.side ? ` · side ${g.side}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                disabled={busy}
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

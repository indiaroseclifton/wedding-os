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
  plusOnes?: number;
  missingAddress?: boolean;
  eventStatus?: Record<string, string>;
};

const FILTERS = ["ALL", "YES", "NO", "MAYBE", "INVITED", "UNKNOWN", "NO_ADDRESS"] as const;
const RSVPS = ["UNKNOWN", "INVITED", "YES", "NO", "MAYBE"] as const;

export function GuestFilters({
  guests,
  tableNames = [],
  eventCols = [],
}: {
  guests: Guest[];
  tableNames?: string[];
  eventCols?: { id: string; short: string }[];
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
    if (filter === "NO_ADDRESS") return rows.filter((g) => g.missingAddress);
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
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === f ? "bg-moss text-ivory" : "text-ink-soft hover:bg-white"
            }`}
          >
            {f === "ALL"
              ? "All"
              : f === "YES"
                ? "Attending"
                : f === "NO"
                  ? "Not attending"
                  : f === "UNKNOWN" || f === "INVITED"
                    ? f === "INVITED"
                      ? "Invited"
                      : "No response"
                    : f === "NO_ADDRESS"
                      ? "No address"
                      : f === "MAYBE"
                        ? "Maybe"
                        : f}
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

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <div
          className="hidden gap-2 border-b border-line px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted sm:grid"
          style={{
            gridTemplateColumns: `minmax(10rem,1.4fr) 1fr 4.5rem 5rem 1fr 5rem ${eventCols
              .map(() => "4.2rem")
              .join(" ")}`,
          }}
        >
          <span>Name</span>
          <span>Status</span>
          <span>Plus</span>
          <span>Table</span>
          <span>Dietary</span>
          <span>RSVP</span>
          {eventCols.map((e) => (
            <span key={e.id} className="truncate" title={e.short}>
              {e.short}
            </span>
          ))}
        </div>
        <ul className="divide-y divide-line">
          {visible.map((g) => (
            <li
              key={g.id}
              className="grid items-center gap-2 px-4 py-3"
              style={{
                gridTemplateColumns: `minmax(10rem,1.4fr) 1fr 4.5rem 5rem 1fr 5rem ${eventCols
                  .map(() => "4.2rem")
                  .join(" ")}`,
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(g.id)}
                  onChange={() => toggleOne(g.id)}
                  className="h-4 w-4 rounded border-line"
                  aria-label={`Select ${g.name}`}
                />
                <Link href={`/guests/${g.id}`} className="truncate text-sm font-medium">
                  {g.name}
                </Link>
              </div>
              <p className="text-sm text-ink-soft">
                {g.rsvp === "YES"
                  ? "Attending"
                  : g.rsvp === "NO"
                    ? "Not attending"
                    : g.rsvp === "MAYBE"
                      ? "Maybe"
                      : "No response"}
              </p>
              <p className="text-sm text-ink-soft">{g.plusOnes ? "Yes" : "—"}</p>
              <p className="text-sm text-ink-soft">{g.tableLabel || "—"}</p>
              <p className="text-sm text-ink-soft">{g.dietary || "—"}</p>
              <select
                disabled={busy}
                value={g.rsvp}
                onChange={(e) => setRsvp(g.id, e.target.value)}
                className="rounded-lg border border-line bg-surface px-2 py-1 text-xs"
              >
                {RSVPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {eventCols.map((e) => {
                const st = g.eventStatus?.[e.id] || "";
                const label =
                  st === "YES" ? "Yes" : st === "NO" ? "No" : st === "MAYBE" ? "Maybe" : "—";
                return (
                  <p key={e.id} className="text-xs text-ink-soft" title={e.short}>
                    {label}
                  </p>
                );
              })}
            </li>
          ))}
          {!visible.length && (
            <li className="px-4 py-8 text-center text-sm text-muted">No guests in this filter</li>
          )}
        </ul>
      </div>
    </div>
  );
}

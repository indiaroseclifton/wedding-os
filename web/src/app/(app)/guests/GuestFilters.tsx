"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

type Guest = {
  id: string;
  name: string;
  rsvp: string;
  dietary?: string;
  tableLabel?: string;
  side?: string;
  plusOnes?: number;
  plusOneNames?: string[];
  partyName?: string;
  meal?: string;
  listTier?: "A" | "B";
  missingAddress?: boolean;
  eventStatus?: Record<string, string>;
};

const FILTERS = ["ALL", "YES", "NO", "MAYBE", "INVITED", "UNKNOWN", "NO_ADDRESS", "A", "B"] as const;
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
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(guests);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkRsvp, setBulkRsvp] = useState("YES");
  const [bulkTable, setBulkTable] = useState("");
  const [bulkSide, setBulkSide] = useState("A");

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((g) => {
      if (filter === "NO_ADDRESS" && !g.missingAddress) return false;
      if (filter === "A" && (g.listTier || "A") !== "A") return false;
      if (filter === "B" && g.listTier !== "B") return false;
      if (filter !== "ALL" && filter !== "NO_ADDRESS" && filter !== "A" && filter !== "B" && g.rsvp !== filter) return false;
      if (!needle) return true;
      const hay = `${g.name} ${g.plusOneNames?.join(" ") || ""} ${g.partyName || ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [rows, filter, q]);

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
      } else if (body.action === "list") {
        const listTier = body.listTier === "B" ? "B" : "A";
        setRows((prev) =>
          prev.map((g) => (selected.has(g.id) ? { ...g, listTier } : g))
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
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Find Dad, a plus-one, a household…"
        className="field"
      />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === f ? "bg-moss text-moss-fg" : "text-ink-soft hover:bg-surface"
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
                        : f === "A"
                          ? "A-list"
                          : f === "B"
                            ? "B-list"
                            : f}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={toggleAllVisible}
          className="btn btn-ghost !min-h-8 px-3 text-xs"
        >
          {allVisibleSelected ? "Clear visible" : "Select visible"}
        </button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="btn btn-ghost !min-h-8 px-3 text-xs"
          >
            Clear ({selected.size})
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="glass-panel space-y-3 rounded-2xl p-5">
          <p className="text-sm font-medium text-ink">
            Bulk actions · {selected.size} selected
          </p>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="kicker">RSVP</span>
              <select
                value={bulkRsvp}
                onChange={(e) => setBulkRsvp(e.target.value)}
                className="field mt-1"
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
              className="btn btn-primary !min-h-8 px-3 text-xs disabled:opacity-50"
            >
              Apply RSVP
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="kicker">Table</span>
              <select
                value={bulkTable}
                onChange={(e) => setBulkTable(e.target.value)}
                className="field mt-1"
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
              className="btn btn-primary !min-h-8 px-3 text-xs disabled:opacity-50"
            >
              Apply table
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="kicker">Side</span>
              <select
                value={bulkSide}
                onChange={(e) => setBulkSide(e.target.value)}
                className="field mt-1"
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
              className="btn btn-primary !min-h-8 px-3 text-xs disabled:opacity-50"
            >
              Apply side
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => runBulk({ action: "list", listTier: "A" })}
              className="btn btn-primary !min-h-8 px-3 text-xs disabled:opacity-50"
            >
              Move to A
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => runBulk({ action: "list", listTier: "B" })}
              className="btn btn-ghost !min-h-8 px-3 text-xs disabled:opacity-50"
            >
              Move to B
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
            className="btn btn-ghost !min-h-8 px-3 text-xs text-clay disabled:opacity-50"
          >
            Delete selected
          </button>

          {error && <p className="text-xs text-clay">{error}</p>}
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
        {visible.length === 0 ? (
          <EmptyState title="No guests in this filter" body="Try another chip, or add someone." />
        ) : (
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
                    {g.plusOneNames?.length
                      ? ` + ${g.plusOneNames.join(", ")}`
                      : g.plusOnes
                        ? ` +${g.plusOnes}`
                        : ""}
                    {g.listTier === "B" ? (
                      <span className="ml-1 text-[10px] font-medium uppercase tracking-wide text-muted">B</span>
                    ) : null}
                    {g.partyName ? (
                      <span className="mt-0.5 block truncate text-[11px] font-normal text-muted">{g.partyName}</span>
                    ) : null}
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
                  className="field"
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
          </ul>
        )}
      </div>
    </div>
  );
}

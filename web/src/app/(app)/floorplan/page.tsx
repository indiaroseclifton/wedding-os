"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PrintButton } from "@/components/ui/PrintButton";
import {
  type SeatGuest,
  groupHouseholds,
  seatWeight,
  tableFill,
} from "@/lib/data/seating";

type Table = { id: string; name: string; capacity: number; shape: string };
type Pos = { tableId: string; x: number; y: number };

export default function FloorPlanPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<SeatGuest[]>([]);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragMoved, setDragMoved] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [inspect, setInspect] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);
  const railDrag = useRef<{ x: number; y: number; ids: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/floorplan")
      .then((r) => r.json())
      .then((d) => {
        const ts: Table[] = d.tables || [];
        setTables(ts);
        setGuests(d.guests || []);
        const existing: Pos[] = d.floor?.positions || [];
        const next = [...existing];
        ts.forEach((t, i) => {
          if (!next.find((p) => p.tableId === t.id)) {
            next.push({
              tableId: t.id,
              x: 18 + (i % 4) * 20,
              y: 22 + Math.floor(i / 4) * 26,
            });
          }
        });
        setPositions(next);
      })
      .catch(() => {});
  }, []);

  const unseated = guests.filter((g) => !g.tableLabel);
  const filtered = unseated.filter((g) =>
    !query.trim()
      ? true
      : `${g.name} ${g.partyName || ""}`.toLowerCase().includes(query.toLowerCase())
  );
  const houses = useMemo(() => groupHouseholds(filtered), [filtered]);
  const seatedCount = guests.filter((g) => g.tableLabel).reduce((s, g) => s + seatWeight(g), 0);
  const openCount = unseated.reduce((s, g) => s + seatWeight(g), 0);

  function applyGuests(next: SeatGuest[]) {
    setGuests(
      next
        .filter((g) => g.rsvp !== "NO")
        .map((g) => ({
          id: g.id,
          name: g.name,
          tableLabel: g.tableLabel || null,
          dietary: g.dietary || null,
          rsvp: g.rsvp,
          side: g.side || null,
          partyName: g.partyName || null,
          plusOnes: g.plusOnes || 0,
        }))
    );
  }

  async function assign(guestIds: string[], tableName: string | null) {
    if (!guestIds.length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", guestIds, tableName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.guests) applyGuests(data.guests);
        setSelected([]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function persist(next: Pos[]) {
    await fetch("/api/floorplan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positions: next }),
    });
    setSaved(true);
  }

  function onBoardMove(e: React.PointerEvent) {
    if (!draggingTable || !boardRef.current) return;
    setDragMoved(true);
    setSaved(false);
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.min(92, Math.max(8, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(90, Math.max(10, ((e.clientY - rect.top) / rect.height) * 100));
    setPositions((prev) => prev.map((p) => (p.tableId === draggingTable ? { ...p, x, y } : p)));
  }

  function onBoardUp() {
    if (draggingTable && dragMoved) persist(positions);
    setDraggingTable(null);
    setDragMoved(false);
  }

  function tableAtPoint(clientX: number, clientY: number) {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    let best: { id: string; d: number } | null = null;
    for (const t of tables) {
      const pos = positions.find((p) => p.tableId === t.id);
      if (!pos) continue;
      const d = Math.hypot(pos.x - x, pos.y - y);
      if (d < 12 && (!best || d < best.d)) best = { id: t.id, d };
    }
    return best ? tables.find((t) => t.id === best!.id) || null : null;
  }

  function onTablePointerDown(tableId: string, e: React.PointerEvent) {
    e.stopPropagation();
    const table = tables.find((t) => t.id === tableId);
    if (selected.length && table) {
      assign(selected, table.name);
      return;
    }
    setDraggingTable(tableId);
    setDragMoved(false);
  }

  function onTablePointerUp(tableId: string) {
    if (draggingTable === tableId && !dragMoved) {
      setInspect((cur) => (cur === tableId ? null : tableId));
    }
  }

  function onGuestDrop(e: React.PointerEvent, ids: string[]) {
    const table = tableAtPoint(e.clientX, e.clientY);
    if (table) assign(ids, table.name);
  }

  const inspectTable = tables.find((t) => t.id === inspect) || null;
  const inspectGuests = inspectTable
    ? guests.filter((g) => g.tableLabel === inspectTable.name)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Floor plan</h1>
          <p className="mt-1 text-sm text-slate-600">
            Drag tables to arrange. Tap someone, then a table, to seat them.{" "}
            <Link href="/seating" className="underline">
              Escort list & auto-seat
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintButton label="Print room" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 print:hidden">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{tables.length}</p>
          <p className="text-xs text-slate-500">Tables</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{seatedCount}</p>
          <p className="text-xs text-slate-500">Seated</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{openCount}</p>
          <p className="text-xs text-slate-500">Unseated</p>
        </div>
      </div>

      {saved && <p className="text-xs text-emerald-700 print:hidden">Layout saved.</p>}
      {selected.length > 0 && (
        <p className="text-xs text-slate-600 print:hidden">
          {selected.length} selected — tap a table to seat, or{" "}
          <button type="button" className="underline" onClick={() => setSelected([])}>
            clear
          </button>
        </p>
      )}

      {!tables.length ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No tables yet.{" "}
          <Link href="/seating" className="underline">
            Add tables in Seating
          </Link>
          , then come back.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-2 print:hidden">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find unseated"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <ul className="max-h-[28rem] space-y-1 overflow-auto rounded-xl border border-slate-200 bg-white p-2">
              {houses.map((h) => {
                const ids = h.members.map((m) => m.id);
                const on = ids.every((id) => selected.includes(id));
                return (
                  <li key={h.key}>
                    <button
                      type="button"
                      disabled={busy}
                      onPointerDown={(e) => {
                        (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
                        railDrag.current = { x: e.clientX, y: e.clientY, ids };
                      }}
                      onPointerUp={(e) => {
                        const start = railDrag.current;
                        railDrag.current = null;
                        if (!start) return;
                        const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10;
                        if (moved) {
                          onGuestDrop(e, start.ids);
                          return;
                        }
                        setSelected((cur) =>
                          on ? cur.filter((id) => !ids.includes(id)) : [...new Set([...cur, ...ids])]
                        );
                      }}
                      className={`w-full rounded-lg px-2 py-1.5 text-left text-xs ${
                        on ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-medium">{h.members.map((m) => m.name).join(" · ")}</span>
                      <span className={on ? "text-slate-300" : "text-slate-500"}>
                        {" "}
                        · {h.weight} seat{h.weight === 1 ? "" : "s"}
                      </span>
                    </button>
                  </li>
                );
              })}
              {!houses.length && (
                <li className="px-2 py-6 text-center text-xs text-slate-500">Everyone is seated</li>
              )}
            </ul>
          </aside>

          <div
            ref={boardRef}
            onPointerMove={onBoardMove}
            onPointerUp={onBoardUp}
            onPointerLeave={onBoardUp}
            className="relative h-[32rem] w-full touch-none overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-[#f4f1ea] print:h-[9in] print:border print:bg-white"
          >
            <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded bg-slate-800/80 px-3 py-1 text-[10px] font-medium text-white print:bg-slate-200 print:text-slate-800">
              Dance floor
            </div>
            {tables.map((t) => {
              const pos = positions.find((p) => p.tableId === t.id) || { x: 10, y: 10 };
              const fill = tableFill(t.name, guests);
              const seated = guests.filter((g) => g.tableLabel === t.name);
              const isRound = t.shape === "ROUND" || t.shape === "SWEETHEART";
              const over = fill > t.capacity;
              return (
                <button
                  key={t.id}
                  type="button"
                  onPointerDown={(e) => onTablePointerDown(t.id, e)}
                  onPointerUp={() => onTablePointerUp(t.id)}
                  className={`absolute flex flex-col items-center justify-center border-2 bg-white px-1 text-center shadow-md ${
                    isRound ? "h-[5.5rem] w-[5.5rem] rounded-full" : "h-20 w-24 rounded-xl"
                  } ${
                    inspect === t.id
                      ? "z-10 border-slate-900 ring-2 ring-slate-900"
                      : over
                        ? "border-rose-400"
                        : "border-slate-400"
                  } ${draggingTable === t.id ? "z-10 cursor-grabbing" : "cursor-grab"}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <span className="text-[10px] font-semibold leading-tight">{t.name}</span>
                  <span className={`text-[9px] ${over ? "text-rose-600" : "text-slate-500"}`}>
                    {fill}/{t.capacity}
                  </span>
                  <span className="max-w-full truncate px-0.5 text-[8px] leading-tight text-slate-600">
                    {seated
                      .slice(0, 2)
                      .map((g) => g.name.split(" ")[0])
                      .join(", ")}
                    {seated.length > 2 ? ` +${seated.length - 2}` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {inspectTable && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 print:hidden">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {inspectTable.name}{" "}
              <span className="font-normal text-slate-500">
                {tableFill(inspectTable.name, guests)}/{inspectTable.capacity}
              </span>
            </p>
            <button type="button" onClick={() => setInspect(null)} className="text-xs underline">
              Close
            </button>
          </div>
          <ul className="mt-2 divide-y divide-slate-100">
            {inspectGuests.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-1.5 text-sm">
                <span>
                  {g.name}
                  {g.plusOnes ? ` +${g.plusOnes}` : ""}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => assign([g.id], null)}
                  className="text-xs text-slate-500 underline"
                >
                  Unseat
                </button>
              </li>
            ))}
            {!inspectGuests.length && (
              <li className="py-3 text-sm text-slate-500">Empty — select people on the left, then tap this table.</li>
            )}
          </ul>
        </div>
      )}

      <div className="hidden print:block">
        <h2 className="mb-2 text-lg font-semibold">Who sits where</h2>
        <ul className="columns-2 gap-6 text-sm">
          {tables.map((t) => (
            <li key={t.id} className="mb-3 break-inside-avoid">
              <p className="font-semibold">{t.name}</p>
              <p className="text-slate-600">
                {guests
                  .filter((g) => g.tableLabel === t.name)
                  .map((g) => g.name)
                  .join(", ") || "—"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

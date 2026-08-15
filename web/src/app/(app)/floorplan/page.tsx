"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Table = { id: string; name: string; capacity: number; shape: string };
type Pos = { tableId: string; x: number; y: number };

export default function FloorPlanPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/floorplan")
      .then((r) => r.json())
      .then((d) => {
        const ts: Table[] = d.tables || [];
        setTables(ts);
        const existing: Pos[] = d.floor?.positions || [];
        // Auto-layout any table missing a position
        const next = [...existing];
        ts.forEach((t, i) => {
          if (!next.find((p) => p.tableId === t.id)) {
            next.push({
              tableId: t.id,
              x: 15 + (i % 4) * 22,
              y: 20 + Math.floor(i / 4) * 28,
            });
          }
        });
        setPositions(next);
      })
      .catch(() => {});
  }, []);

  function onPointerDown(tableId: string) {
    setDragging(tableId);
    setSaved(false);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.min(92, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(90, Math.max(6, ((e.clientY - rect.top) / rect.height) * 100));
    setPositions((prev) =>
      prev.map((p) => (p.tableId === dragging ? { ...p, x, y } : p))
    );
  }

  function onPointerUp() {
    setDragging(null);
  }

  async function save() {
    const res = await fetch("/api/floorplan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positions }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Floor plan</h1>
          <p className="mt-1 text-sm text-slate-600">
            Drag tables on the room canvas. Create tables under{" "}
            <Link href="/seating" className="underline">
              Seating
            </Link>{" "}first.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Save layout
        </button>
      </div>

      {saved && <p className="text-xs text-emerald-700">Layout saved.</p>}

      {!tables.length ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No tables yet.{" "}
          <Link href="/seating" className="underline">
            Add tables in Seating
          </Link>
          , then come back to arrange them.
        </p>
      ) : (
        <div
          ref={boardRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="relative h-[28rem] w-full touch-none overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100"
        >
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded bg-slate-800/80 px-3 py-1 text-[10px] font-medium text-white">
            Dance floor / focal area
          </div>
          {tables.map((t) => {
            const pos = positions.find((p) => p.tableId === t.id) || { x: 10, y: 10 };
            const isRound = t.shape === "ROUND" || t.shape === "SWEETHEART";
            return (
              <button
                key={t.id}
                type="button"
                onPointerDown={() => onPointerDown(t.id)}
                className={`absolute flex cursor-grab items-center justify-center border-2 border-slate-400 bg-white text-[10px] font-semibold shadow-md active:cursor-grabbing ${
                  isRound ? "h-16 w-16 rounded-full" : "h-12 w-20 rounded-lg"
                } ${dragging === t.id ? "z-10 ring-2 ring-slate-900" : ""}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

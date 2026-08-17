"use client";

import { useEffect, useRef, useState } from "react";
import {
  type FloorKind,
  type FloorObject,
  type TablePosition,
  newFixture,
} from "@/lib/floorplan";
import { type SeatGuest, tableFill } from "@/lib/data/seating";
import { Icon } from "@/components/icons";

type Table = { id: string; name: string; capacity: number; shape: string };

const FIXTURES: { kind: Exclude<FloorKind, "TABLE">; icon: string; label: string }[] = [
  { kind: "DANCE_FLOOR", icon: "dance", label: "Dance floor" },
  { kind: "BUFFET", icon: "fork", label: "Buffet" },
  { kind: "BAR", icon: "spark", label: "Bar" },
  { kind: "CAKE", icon: "gift", label: "Cake" },
  { kind: "DJ", icon: "music", label: "DJ" },
  { kind: "KIDS", icon: "users", label: "Kids" },
  { kind: "PHOTO", icon: "heart", label: "Photo" },
  { kind: "ESCORT", icon: "mail", label: "Escort" },
];

export function RoomCanvas({
  tables,
  guests,
  selected,
  onAssign,
}: {
  tables: Table[];
  guests: SeatGuest[];
  selected: string[];
  onAssign: (guestIds: string[], tableName: string) => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<TablePosition[]>([]);
  const [objects, setObjects] = useState<FloorObject[]>([]);
  const [room, setRoom] = useState({ widthFt: 60, depthFt: 40 });
  const [drag, setDrag] = useState<{ kind: "table" | "obj"; id: string } | null>(null);
  const posRef = useRef(positions);
  const objRef = useRef(objects);
  posRef.current = positions;
  objRef.current = objects;

  const [selectedObj, setSelectedObj] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/floorplan")
      .then((r) => r.json())
      .then((d) => {
        const ts: Table[] = d.tables || tables;
        const existing: TablePosition[] = d.floor?.positions || [];
        const next = [...existing];
        ts.forEach((t, i) => {
          if (!next.find((p) => p.tableId === t.id)) {
            next.push({ tableId: t.id, x: 18 + (i % 4) * 20, y: 28 + Math.floor(i / 4) * 22 });
          }
        });
        setPositions(next);
        setObjects(d.floor?.objects || []);
        if (d.floor?.room) setRoom(d.floor.room);
      })
      .catch(() => {});
  }, [tables]);

  async function persist(nextPos = posRef.current, nextObj = objRef.current, nextRoom = room) {
    await fetch("/api/floorplan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positions: nextPos, objects: nextObj, room: nextRoom }),
    });
  }

  function point(e: React.PointerEvent) {
    const box = boardRef.current?.getBoundingClientRect();
    if (!box) return { x: 50, y: 50 };
    return {
      x: Math.min(92, Math.max(8, ((e.clientX - box.left) / box.width) * 100)),
      y: Math.min(90, Math.max(10, ((e.clientY - box.top) / box.height) * 100)),
    };
  }

  function onMove(e: React.PointerEvent) {
    if (!drag) return;
    const p = point(e);
    if (drag.kind === "table") {
      setPositions((rows) => rows.map((r) => (r.tableId === drag.id ? { ...r, ...p } : r)));
    } else {
      setObjects((rows) => rows.map((r) => (r.id === drag.id ? { ...r, ...p } : r)));
    }
  }

  function onUp() {
    if (drag) persist();
    setDrag(null);
  }

  function addFixture(kind: Exclude<FloorKind, "TABLE">) {
    const obj = newFixture(kind);
    const next = [...objects, obj];
    setObjects(next);
    persist(positions, next);
  }

  function removeFixture(id: string) {
    const next = objects.filter((o) => o.id !== id);
    setObjects(next);
    setSelectedObj(null);
    persist(positions, next);
  }

  const overlaps = (() => {
    const hits: string[] = [];
    for (let i = 0; i < tables.length; i++) {
      const a = positions.find((p) => p.tableId === tables[i].id);
      if (!a) continue;
      for (let j = i + 1; j < tables.length; j++) {
        const b = positions.find((p) => p.tableId === tables[j].id);
        if (!b) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (dx * dx + dy * dy < 64) hits.push(`${tables[i].name} / ${tables[j].name}`);
      }
    }
    return hits;
  })();

  const ratio = room.depthFt / Math.max(20, room.widthFt);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 print:hidden">
        {FIXTURES.map((f) => (
          <button
            key={f.kind}
            type="button"
            onClick={() => addFixture(f.kind)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-3 text-xs"
          >
            <Icon name={f.icon} className="h-3.5 w-3.5" />
            {f.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1 text-xs text-muted">
          W {room.widthFt} ft
          <input
            type="range"
            min={30}
            max={90}
            aria-label="Room width"
            value={room.widthFt}
            onChange={(e) => {
              const next = { ...room, widthFt: Number(e.target.value) };
              setRoom(next);
            }}
            onPointerUp={() => persist()}
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-muted">
          D {room.depthFt} ft
          <input
            type="range"
            min={24}
            max={80}
            aria-label="Room depth"
            value={room.depthFt}
            onChange={(e) => {
              const next = { ...room, depthFt: Number(e.target.value) };
              setRoom(next);
            }}
            onPointerUp={() => persist()}
          />
        </label>
        {selectedObj && (
          <button
            type="button"
            onClick={() => removeFixture(selectedObj)}
            className="min-h-11 rounded-full border border-clay px-3 text-xs text-clay"
          >
            Remove fixture
          </button>
        )}
      </div>
      <div
        ref={boardRef}
        className="relative w-full overflow-hidden rounded-[1.4rem] border border-line bg-[#ebe4d6]"
        style={{ aspectRatio: `${room.widthFt} / ${Math.max(24, room.depthFt * (ratio > 0.4 ? 1 : 0.7))}` }}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <p className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-ink/40">
          Door
        </p>
        {objects.map((o) => (
          <button
            key={o.id}
            type="button"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDrag({ kind: "obj", id: o.id });
              setSelectedObj(o.id);
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-lg border border-dashed border-ink/30 bg-surface/50 text-[10px] uppercase tracking-wide text-ink/70 backdrop-blur-sm"
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: `${o.w || 10}%`,
              height: `${o.h || 8}%`,
            }}
          >
            {o.label}
          </button>
        ))}
        {tables.map((t) => {
          const pos = positions.find((p) => p.tableId === t.id) || { x: 50, y: 50 };
          const fill = tableFill(t.name, guests);
          return (
            <button
              key={t.id}
              type="button"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDrag({ kind: "table", id: t.id });
              }}
              onClick={() => {
                if (selected.length) onAssign(selected, t.name);
              }}
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 cursor-grab flex-col items-center justify-center bg-surface/90 text-center shadow-sm ${
                t.shape === "RECT" || t.shape === "HEAD" ? "rounded-lg" : "rounded-full"
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: "14%", aspectRatio: "1" }}
            >
              <span className="font-serif text-sm">{t.name}</span>
              <span className="text-[10px] text-muted">
                {fill}/{t.capacity}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted print:hidden">
        Drag tables and fixtures. Select people below, then tap a table. Tap a fixture, then remove.
        {overlaps.length ? ` · Overlap: ${overlaps.join(", ")}` : ""}
      </p>
    </div>
  );
}

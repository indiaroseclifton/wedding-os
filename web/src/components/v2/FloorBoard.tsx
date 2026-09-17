"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Kind = "round" | "rect" | "head" | "stage" | "bar" | "dance" | "gift";

type Piece = {
  id: string;
  kind: Kind;
  label: string;
  x: number;
  y: number;
  seats?: number;
};

const STARTER: Piece[] = [
  { id: "dance", kind: "dance", label: "Dance floor", x: 220, y: 160 },
  { id: "stage", kind: "stage", label: "Stage / DJ", x: 240, y: 40 },
  { id: "bar", kind: "bar", label: "Bar", x: 40, y: 40 },
  { id: "t1", kind: "round", label: "Table 1", x: 60, y: 280, seats: 8 },
  { id: "t2", kind: "round", label: "Table 2", x: 200, y: 300, seats: 8 },
  { id: "t3", kind: "round", label: "Table 3", x: 340, y: 280, seats: 8 },
  { id: "head", kind: "head", label: "Head table", x: 160, y: 420, seats: 6 },
];

function size(kind: Kind) {
  if (kind === "dance") return { w: 180, h: 120 };
  if (kind === "stage") return { w: 140, h: 56 };
  if (kind === "bar") return { w: 100, h: 44 };
  if (kind === "head") return { w: 200, h: 48 };
  if (kind === "rect") return { w: 120, h: 64 };
  return { w: 88, h: 88 };
}

export function FloorBoard() {
  const [pieces, setPieces] = useState<Piece[]>(STARTER);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [n, setN] = useState(4);

  const tables = pieces.filter((p) => p.seats);
  const seats = tables.reduce((s, p) => s + (p.seats || 0), 0);

  function onPointerDown(e: React.PointerEvent, piece: Piece) {
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const rect = target.parentElement?.getBoundingClientRect();
    if (!rect) return;
    setDrag({ id: piece.id, dx: e.clientX - rect.left - piece.x, dy: e.clientY - rect.top - piece.y });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const board = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(520, e.clientX - board.left - drag.dx));
    const y = Math.max(0, Math.min(480, e.clientY - board.top - drag.dy));
    setPieces((list) => list.map((p) => (p.id === drag.id ? { ...p, x, y } : p)));
  }

  function add(kind: Kind) {
    const id = `${kind}-${Date.now()}`;
    const label =
      kind === "round" || kind === "rect"
        ? `Table ${n}`
        : kind === "head"
          ? "Head table"
          : kind === "dance"
            ? "Dance floor"
            : kind === "stage"
              ? "Stage / DJ"
              : kind === "bar"
                ? "Bar"
                : "Gift";
    if (kind === "round" || kind === "rect" || kind === "head") setN((v) => v + 1);
    setPieces((list) => [...list, { id, kind, label, x: 40 + (list.length % 5) * 24, y: 40, seats: kind === "round" ? 8 : kind === "rect" ? 6 : kind === "head" ? 8 : undefined }]);
  }

  const sheet = useMemo(
    () =>
      tables
        .map((t) => `${t.label} — ${t.seats} seats`)
        .join("\n"),
    [tables],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker kicker-moss">Floorplan maker</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Print Center</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Flat plan. Drag pieces. Print the table list and place-card sheet. Not 3D. Seating names still live on{" "}
            <Link href="/seating" className="underline">Seating</Link>.
          </p>
        </div>
        <p className="text-sm text-muted">
          {tables.length} tables · {seats} seats
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["round", "Round"],
            ["rect", "Rect"],
            ["head", "Head"],
            ["stage", "Stage"],
            ["bar", "Bar"],
            ["dance", "Dance"],
            ["gift", "Gift"],
          ] as const
        ).map(([kind, label]) => (
          <button key={kind} type="button" onClick={() => add(kind)} className="rounded-full border border-line px-3 py-2 text-xs">
            Add {label}
          </button>
        ))}
        <button type="button" onClick={() => window.print()} className="rounded-full bg-ink px-4 py-2 text-xs text-ivory">
          Print sheets
        </button>
      </div>

      <div
        className="relative h-[520px] overflow-hidden rounded-[1.4rem] border border-line bg-[#f4efe6] print:hidden"
        onPointerMove={onPointerMove}
        onPointerUp={() => setDrag(null)}
      >
        {pieces.map((p) => {
          const s = size(p.kind);
          return (
            <button
              key={p.id}
              type="button"
              onPointerDown={(e) => onPointerDown(e, p)}
              className={`absolute flex cursor-grab items-center justify-center border border-ink/30 bg-white/90 text-center text-[11px] leading-tight active:cursor-grabbing ${
                p.kind === "round" ? "rounded-full" : "rounded-md"
              }`}
              style={{ left: p.x, top: p.y, width: s.w, height: s.h }}
            >
              {p.label}
              {p.seats ? <span className="block text-[10px] text-muted">{p.seats}</span> : null}
            </button>
          );
        })}
      </div>

      <section className="print-sheet space-y-4 rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-serif text-2xl">Table list</h2>
        <pre className="whitespace-pre-wrap text-sm">{sheet || "No tables yet."}</pre>
        <h2 className="font-serif text-2xl">Place cards</h2>
        <p className="text-sm text-muted">
          Names come from Seating. This sheet is the table key for the printer tonight.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tables.map((t) => (
            <div key={t.id} className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm">
              {t.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

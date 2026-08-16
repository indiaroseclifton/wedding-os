"use client";

import type { SeatGuest } from "@/lib/data/seating";
import { seatWeight } from "@/lib/data/seating";

type Table = { id: string; name: string; capacity: number; shape: string };

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function occupy(guests: SeatGuest[], tableName: string, capacity: number) {
  const at = guests.filter((g) => g.tableLabel === tableName);
  const map = new Map<number, { id: string; label: string; plus?: boolean }>();
  const used = new Set<number>();
  const nextFree = () => {
    for (let i = 0; i < capacity; i++) if (!used.has(i)) return i;
    return at.length;
  };
  for (const g of at) {
    let start = g.seatIndex != null && g.seatIndex >= 0 ? g.seatIndex : nextFree();
    while (used.has(start)) start += 1;
    map.set(start, { id: g.id, label: firstName(g.name) });
    used.add(start);
    const extras = g.plusOneNames?.length
      ? g.plusOneNames
      : Array.from({ length: Math.max(0, g.plusOnes || 0) }, (_, k) => `${firstName(g.name)} +${k + 1}`);
    for (let k = 0; k < extras.length; k++) {
      let n = start + k + 1;
      while (used.has(n)) n += 1;
      map.set(n, { id: g.id, label: extras[k] || `+${k + 1}`, plus: true });
      used.add(n);
    }
  }
  return map;
}

export function SeatCanvas({
  table,
  guests,
  onDropSeat,
}: {
  table: Table;
  guests: SeatGuest[];
  onDropSeat: (guestId: string, tableName: string, seatIndex: number) => void;
}) {
  const cap = Math.max(2, table.capacity || 8);
  const seats = occupy(guests, table.name, cap);
  const isRound = table.shape !== "RECT" && table.shape !== "HEAD";
  const size = isRound ? 220 : 260;

  function pos(i: number) {
    if (isRound) {
      const a = (i / cap) * Math.PI * 2 - Math.PI / 2;
      const r = 42;
      return { left: `${50 + r * Math.cos(a)}%`, top: `${50 + r * Math.sin(a)}%` };
    }
    const perSide = Math.ceil(cap / 2);
    const onTop = i < perSide;
    const slot = onTop ? i : i - perSide;
    const count = onTop ? perSide : cap - perSide;
    const x = ((slot + 0.5) / count) * 80 + 10;
    return { left: `${x}%`, top: onTop ? "12%" : "88%" };
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: isRound ? size : 160 }}>
        <div
          className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 border-line bg-champagne/40 ${
            isRound ? "h-[46%] w-[46%] rounded-full" : "h-[42%] w-[70%] rounded-xl"
          }`}
        >
          <span className="px-2 text-center text-[11px] font-medium">{table.name}</span>
        </div>
        {Array.from({ length: cap }).map((_, i) => {
          const sit = seats.get(i);
          return (
            <button
              key={i}
              type="button"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/guest-id");
                if (id) onDropSeat(id, table.name, i);
              }}
              style={pos(i)}
              className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[9px] leading-tight ${
                sit
                  ? sit.plus
                    ? "border-line bg-paper text-muted"
                    : "border-moss bg-moss text-ivory"
                  : "border-dashed border-line bg-surface/80 text-muted"
              }`}
              title={sit ? sit.label : `Seat ${i + 1}`}
            >
              {sit ? sit.label.slice(0, 4) : i + 1}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted">
        {guests.filter((g) => g.tableLabel === table.name).reduce((s, g) => s + seatWeight(g), 0)}/{cap} seats
      </p>
    </div>
  );
}

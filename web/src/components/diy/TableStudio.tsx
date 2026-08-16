"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const SHAPES = [
  { id: "round", name: "Round 60\"" },
  { id: "farm", name: "Farm table" },
] as const;

const KITS = [
  { id: "linen", name: "Linen + taper", runner: true, candles: 4, bud: 3, plates: true },
  { id: "garden", name: "Garden low bowl", runner: false, candles: 3, bud: 0, plates: true },
  { id: "bare", name: "Wood + olive", runner: false, candles: 2, bud: 5, plates: true },
] as const;

export function TableStudio() {
  const [shape, setShape] = useState<(typeof SHAPES)[number]["id"]>("round");
  const [seats, setSeats] = useState(8);
  const [tables, setTables] = useState(10);
  const [runner, setRunner] = useState(true);
  const [candles, setCandles] = useState(4);
  const [buds, setBuds] = useState(3);
  const [bowl, setBowl] = useState(true);
  const [plates, setPlates] = useState(true);

  const list = useMemo(() => {
    const per = [
      plates ? { label: "Place settings", qty: seats, est: 2.5 } : null,
      runner ? { label: "Runner or linen", qty: 1, est: 18 } : null,
      candles ? { label: "Tapers / votives", qty: candles, est: 1.2 } : null,
      buds ? { label: "Bud vases + stems", qty: buds, est: 6 } : null,
      bowl ? { label: "Low bowl centerpiece", qty: 1, est: 28 } : null,
    ].filter(Boolean) as { label: string; qty: number; est: number }[];
    const one = per.reduce((s, r) => s + r.qty * r.est, 0);
    return { per, one, all: one * tables };
  }, [seats, tables, runner, candles, buds, bowl, plates]);

  function applyKit(id: string) {
    const k = KITS.find((x) => x.id === id);
    if (!k) return;
    setRunner(k.runner);
    setCandles(k.candles);
    setBuds(k.bud);
    setBowl(id === "garden");
    setPlates(k.plates);
  }

  return (
    <div className="space-y-5 pb-16">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-moss">DIY · Tablescape</p>
        <h1 className="mt-1 font-serif text-4xl">Set one table. Multiply it.</h1>
        <p className="mt-1 text-sm text-muted">
          See the height, the candles, the talk-over line — then the shopping math for every table.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {KITS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => applyKit(k.id)}
            className="rounded-full border border-line px-3 py-1.5 text-xs"
          >
            {k.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative aspect-[5/4] overflow-hidden rounded-[1.6rem] border border-line bg-[#c4b49a]">
          <img src="/brand/tablescape.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#efe6d4] shadow-inner ${
              shape === "round" ? "h-[72%] w-[72%] rounded-full" : "h-[58%] w-[86%] rounded-xl"
            }`}
          >
            {runner && shape === "farm" && (
              <div className="absolute inset-x-[12%] inset-y-[38%] rounded-sm bg-[#d9cbb4]" />
            )}
            {bowl && (
              <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-[#c9b89a]">
                <img src="/brand/flowers.jpg" alt="" className="h-full w-full object-cover" />
              </div>
            )}
            {Array.from({ length: buds }).map((_, i) => {
              const a = (i / Math.max(1, buds)) * Math.PI * 2;
              return (
                <div
                  key={`b${i}`}
                  className="absolute h-6 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8a9a86]"
                  style={{
                    left: `${50 + Math.cos(a) * 18}%`,
                    top: `${50 + Math.sin(a) * 16}%`,
                  }}
                />
              );
            })}
            {Array.from({ length: candles }).map((_, i) => {
              const a = (i / Math.max(1, candles)) * Math.PI * 2 + 0.4;
              return (
                <div
                  key={`c${i}`}
                  className="absolute h-5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#f4efe6]"
                  style={{
                    left: `${50 + Math.cos(a) * 12}%`,
                    top: `${50 + Math.sin(a) * 10}%`,
                  }}
                />
              );
            })}
            {plates &&
              Array.from({ length: seats }).map((_, i) => {
                const a = (i / seats) * Math.PI * 2 - Math.PI / 2;
                const r = shape === "round" ? 42 : 38;
                return (
                  <div
                    key={`p${i}`}
                    className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d7cbb4] bg-[#f7f2e8]"
                    style={{
                      left: `${50 + Math.cos(a) * r}%`,
                      top: `${50 + Math.sin(a) * (shape === "round" ? r : 32)}%`,
                    }}
                  />
                );
              })}
          </div>
        </div>

        <aside className="space-y-3 text-sm">
          <div className="flex gap-2">
            {SHAPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setShape(s.id)}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  shape === s.id ? "bg-moss text-ivory" : "border border-line"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <label className="block text-xs">
            Seats
            <input
              type="range"
              min={4}
              max={12}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full"
            />
            {seats}
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={plates} onChange={(e) => setPlates(e.target.checked)} />
            Place settings
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={runner} onChange={(e) => setRunner(e.target.checked)} />
            Runner
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={bowl} onChange={(e) => setBowl(e.target.checked)} />
            Low bowl
          </label>
          <label className="block text-xs">
            Candles {candles}
            <input
              type="range"
              min={0}
              max={8}
              value={candles}
              onChange={(e) => setCandles(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block text-xs">
            Bud vases {buds}
            <input
              type="range"
              min={0}
              max={7}
              value={buds}
              onChange={(e) => setBuds(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <label className="block text-xs">
            Tables
            <input
              type="number"
              min={1}
              value={tables}
              onChange={(e) => setTables(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-lg border border-line px-2 py-1.5"
            />
          </label>
          <ul className="space-y-1 text-xs text-muted">
            {list.per.map((r) => (
              <li key={r.label}>
                {r.qty} × {r.label}
              </li>
            ))}
          </ul>
          <p className="font-serif text-2xl">${list.one.toFixed(0)} / table</p>
          <p className="text-sm text-muted">${list.all.toFixed(0)} for {tables} tables</p>
          <Link href="/diy/studio/floral" className="block text-xs underline">
            Build the bowl in Floral
          </Link>
          <Link href="/diy/table-decor" className="block text-xs underline">
            Table-decor playbook
          </Link>
        </aside>
      </div>
    </div>
  );
}

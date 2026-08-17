"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TABLE_KITS, TABLE_SHAPES, tableShop, type TableLook } from "@/lib/table-studio";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

type Saved = { id: string; title: string; kind?: string; shape?: string; seats?: number; tables?: number; runner?: boolean; candles?: number; buds?: number; bowl?: boolean; plates?: boolean };

export function TableStudio() {
  const [look, setLook] = useState<TableLook>({
    shape: "round",
    seats: 8,
    tables: 10,
    runner: true,
    candles: 4,
    buds: 3,
    bowl: false,
    plates: true,
  });
  const [title, setTitle] = useState("Head table look");
  const [saved, setSaved] = useState<Saved[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const shop = useMemo(() => tableShop(look), [look]);

  useEffect(() => {
    fetch("/api/diy")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSaved((d?.diy?.mockups || []).filter((m: Saved) => m.kind === "table")))
      .catch(() => {});
  }, []);

  function applyKit(id: string) {
    const k = TABLE_KITS.find((x) => x.id === id);
    if (!k) return;
    setLook((l) => ({ ...l, runner: k.runner, candles: k.candles, buds: k.buds, bowl: k.bowl, plates: k.plates }));
  }

  async function saveLook() {
    setMsg(null);
    const res = await fetch("/api/diy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_mockup", kind: "table", title, ...look, vessel: look.shape, story: "linen", pieces: [] }),
    });
    setMsg(res.ok ? "Look saved" : "Could not save");
    if (res.ok) {
      const d = await res.json();
      setSaved((d.diy?.mockups || []).filter((m: Saved) => m.kind === "table"));
    }
  }

  async function pushShop() {
    setMsg(null);
    const res = await fetch("/api/diy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "push_table",
        tables: look.tables,
        lines: shop.per.map((r) => ({ label: r.label, qty: r.qty, estEach: r.estEach })),
      }),
    });
    setMsg(res.ok ? "On the table-decor shopping list" : "Could not push");
  }

  return (
    <div className="space-y-5 pb-16">
      <RoomSubnav room="studio" />
      <div>
        <p className="kicker kicker-moss">DIY · Tablescape</p>
        <h1 className="mt-1 font-serif text-4xl">Set one table. Multiply it.</h1>
        <p className="mt-1 text-sm text-muted">
          Height, candles, talk-over line — then shopping for every table. Save the look like floral.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABLE_KITS.map((k) => (
          <button key={k.id} type="button" onClick={() => applyKit(k.id)} className="min-h-11 rounded-full border border-line px-3 text-xs">
            {k.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative aspect-[5/4] overflow-hidden rounded-[1.6rem] border border-line bg-[#c4b49a]">
          <img src="/brand/rooms/guests.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#efe6d4] shadow-inner ${
              look.shape === "round" ? "h-[72%] w-[72%] rounded-full" : "h-[58%] w-[86%] rounded-xl"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-[10%] top-1/2 z-10 border-t border-dashed border-ink/25">
              <span className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper/90 px-2 py-1 text-[9px] uppercase tracking-wide text-ink/55">clear talk-over line</span>
            </div>
            {look.runner && look.shape === "farm" && (
              <div className="absolute inset-y-[12%] left-1/2 w-[18%] -translate-x-1/2 bg-[#c9b7a0]/80" />
            )}
            {look.bowl && (
              <div className="absolute left-1/2 top-1/2 h-[28%] w-[28%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full">
                <img src="/diy/floral/rose.jpg" alt="" className="h-full w-full object-cover" />
              </div>
            )}
            {look.plates && Array.from({ length: look.seats }).map((_, i) => {
              const angle = (i / look.seats) * Math.PI * 2 - Math.PI / 2;
              return (
                <span
                  key={`plate-${i}`}
                  aria-hidden
                  className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#f8f3ea] shadow-sm ring-1 ring-ink/10"
                  style={{ left: `${50 + Math.cos(angle) * 41}%`, top: `${50 + Math.sin(angle) * 40}%` }}
                >
                  <span className="absolute inset-1.5 rounded-full border border-ink/15" />
                </span>
              );
            })}
            {Array.from({ length: look.candles }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                className="absolute h-6 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/10 bg-ivory shadow"
                style={{
                  left: `${50 + Math.cos((i / look.candles) * Math.PI * 2) * 27}%`,
                  top: `${50 + Math.sin((i / look.candles) * Math.PI * 2) * 24}%`,
                }}
              ><span className="absolute -top-1 left-1/2 h-1.5 w-1 -translate-x-1/2 rounded-full bg-[#d49555]" /></span>
            ))}
            {Array.from({ length: look.buds }).map((_, i) => (
              <span key={`bud-${i}`} aria-hidden className="absolute h-5 w-3 -translate-x-1/2 -translate-y-1/2 rounded-b-full rounded-t-lg border border-ink/10 bg-[#b7c2ae] shadow-sm" style={{ left: `${50 + (i - (look.buds - 1) / 2) * 10}%`, top: `${look.shape === "farm" ? 50 : 45 + (i % 2) * 10}%` }}>
                <span className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#f6dbd6]" />
              </span>
            ))}
          </div>
        </div>
        <aside className="space-y-3">
          <label className="block text-xs">
            Shape
            <select
              value={look.shape}
              onChange={(e) => setLook((l) => ({ ...l, shape: e.target.value as TableLook["shape"] }))}
              className="mt-1 block min-h-11 w-full rounded-xl border border-line px-2"
            >
              {TABLE_SHAPES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            Seats / table
            <input type="number" min={4} max={16} value={look.seats} onChange={(e) => setLook((l) => ({ ...l, seats: Number(e.target.value) || 8 }))} className="mt-1 block min-h-11 w-full rounded-xl border border-line px-2" />
          </label>
          <label className="block text-xs">
            Tables
            <input type="number" min={1} max={80} value={look.tables} onChange={(e) => setLook((l) => ({ ...l, tables: Number(e.target.value) || 1 }))} className="mt-1 block min-h-11 w-full rounded-xl border border-line px-2" />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={look.plates} onChange={(e) => setLook((l) => ({ ...l, plates: e.target.checked }))} />
            Place settings
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={look.runner} onChange={(e) => setLook((l) => ({ ...l, runner: e.target.checked }))} />
            Runner
          </label>
          <label className="block text-xs">
            Candles
            <input type="range" min={0} max={8} value={look.candles} onChange={(e) => setLook((l) => ({ ...l, candles: Number(e.target.value) }))} />
          </label>
          <label className="block text-xs">
            Bud vases
            <input type="range" min={0} max={8} value={look.buds} onChange={(e) => setLook((l) => ({ ...l, buds: Number(e.target.value) }))} />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={look.bowl} onChange={(e) => setLook((l) => ({ ...l, bowl: e.target.checked }))} />
            Low bowl
          </label>
        </aside>
      </div>

      <section className="glass-panel rounded-2xl p-4">
        <p className="text-sm font-medium">${shop.one.toFixed(0)} per table · ${shop.all.toFixed(0)} for {look.tables}</p>
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {shop.per.map((r) => (
            <li key={r.label}>{r.label} × {r.qty} · ${r.estEach}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="min-h-11 rounded-xl border border-line px-3 text-sm" />
          <button type="button" onClick={saveLook} className="min-h-11 rounded-full bg-moss px-4 text-xs text-moss-fg">Save look</button>
          <button type="button" onClick={pushShop} className="min-h-11 rounded-full border border-line px-4 text-xs">Add to shop</button>
          {look.bowl && (
            <Link href="/diy/studio/floral" scroll={false} className="inline-flex min-h-11 items-center text-xs underline">
              Open floral for the bowl
            </Link>
          )}
        </div>
        {msg && <p role="status" className="mt-2 text-xs text-moss">{msg}</p>}
      </section>

      {saved.length > 0 && (
        <section>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">Your looks</p>
          <div className="flex flex-wrap gap-2">
            {saved.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() =>
                  setLook({
                    shape: m.shape === "farm" ? "farm" : "round",
                    seats: m.seats || 8,
                    tables: m.tables || 10,
                    runner: Boolean(m.runner),
                    candles: m.candles || 0,
                    buds: m.buds || 0,
                    bowl: Boolean(m.bowl),
                    plates: m.plates !== false,
                  })
                }
                className="rounded-full border border-line px-3 py-2 text-xs"
              >
                {m.title}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

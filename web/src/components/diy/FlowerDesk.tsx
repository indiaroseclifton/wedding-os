"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BUILD_STEPS,
  FLOWER_SHOPS,
  LOOKS,
  buildDays,
  scaleRecipe,
  stemById,
  type FloralLook,
} from "@/lib/floral-studio";

export function FlowerDesk() {
  const [look, setLook] = useState<FloralLook>(LOOKS[0]);
  const [recipe, setRecipe] = useState(LOOKS[0].recipe);
  const [qty, setQty] = useState(12);
  const [cont, setCont] = useState(0.15);
  const [hero, setHero] = useState(LOOKS[0].photo);
  const [city, setCity] = useState("Atlanta, GA");
  const [date, setDate] = useState("");
  const [names, setNames] = useState("You");
  const [msg, setMsg] = useState<string | null>(null);
  const [browse, setBrowse] = useState(false);

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.meta?.location) setCity(d.meta.location);
        if (d?.meta?.weddingDate) setDate(d.meta.weddingDate);
        if (d?.meta?.coupleNames) setNames(d.meta.coupleNames.split(/\s*(?:&|and)\s*/i)[0] || "You");
      })
      .catch(() => {});
  }, []);

  const plan = useMemo(() => scaleRecipe(recipe, qty, cont), [recipe, qty, cont]);
  const days = useMemo(() => buildDays(date), [date]);

  function apply(next: FloralLook) {
    setLook(next);
    setRecipe(next.recipe);
    setHero(next.photo);
    setBrowse(false);
  }

  function setCount(stemId: string, count: number) {
    setRecipe((rows) => rows.map((r) => (r.stemId === stemId ? { ...r, count: Math.max(0, count) } : r)));
  }

  function remove(stemId: string) {
    setRecipe((rows) => rows.filter((r) => r.stemId !== stemId));
  }

  async function share() {
    const url = `${window.location.origin}/diy/studio/floral`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setMsg("Link copied");
  }

  async function toShop() {
    const res = await fetch("/api/diy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "push_floral",
        tables: qty,
        lines: plan.rows.map((l) => ({ label: l.name, qty: l.total, estEach: l.each })),
      }),
    });
    setMsg(res.ok ? "On the flowers shopping list." : "Could not add");
  }

  return (
    <div className="space-y-5 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[clamp(2rem,5vw,3.4rem)] uppercase tracking-[0.06em]">Flower Studio</h1>
          <p className="mt-1 text-sm text-muted">Design stunning florals with confidence.</p>
        </div>
        <button type="button" onClick={share} className="btn btn-ghost">
          Share
        </button>
      </header>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <Step n={1} kicker="Inspiration" line="Upload or find a look you love" />
          <div className="relative mt-4 overflow-hidden rounded-2xl">
            <img src={hero} alt="" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {LOOKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => apply(l)}
                className={`h-14 w-16 shrink-0 overflow-hidden rounded-lg border ${
                  look.id === l.id ? "border-ink" : "border-line"
                }`}
              >
                <img src={l.photo} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <label className="btn btn-ghost cursor-pointer">
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setHero(URL.createObjectURL(f));
                }}
              />
            </label>
            <button type="button" onClick={() => setBrowse(true)} className="btn btn-ghost">
              Browse inspiration
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <Step n={2} kicker="Flower recipe" line="Every stem in this look" />
          <p className="mt-3 font-serif text-xl">{look.title}</p>
          <ul className="mt-3 divide-y divide-line">
            {recipe.map((r) => {
              const stem = stemById(r.stemId);
              return (
                <li key={r.stemId} className="flex items-center gap-3 py-2.5">
                  <img src={stem?.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{stem?.name}</p>
                    <p className="text-[11px] text-muted">{r.count} per piece</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="h-8 w-8 rounded-full border border-line" onClick={() => setCount(r.stemId, r.count - 1)}>
                      −
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{r.count}</span>
                    <button type="button" className="h-8 w-8 rounded-full border border-line" onClick={() => setCount(r.stemId, r.count + 1)}>
                      +
                    </button>
                    <button type="button" className="ml-1 text-xs text-muted" onClick={() => remove(r.stemId)} aria-label="Remove">
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/diy/studio/floral?canvas=1" className="btn btn-ghost">
              Edit recipe
            </Link>
            <button type="button" className="btn btn-primary" onClick={() => setMsg("Recipe locked for quantities.")}>
              Looks good, continue
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <Step n={3} kicker="Quantities & cost" line="Instant quantities and pricing" />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm">Number of centerpieces</p>
            <div className="flex items-center gap-2">
              <button type="button" className="h-8 w-8 rounded-full border border-line" onClick={() => setQty((n) => Math.max(1, n - 1))}>
                −
              </button>
              <span className="w-8 text-center font-serif text-xl tabular-nums">{qty}</span>
              <button type="button" className="h-8 w-8 rounded-full border border-line" onClick={() => setQty((n) => n + 1)}>
                +
              </button>
            </div>
          </div>
          <label className="mt-3 flex items-center justify-between text-sm">
            Contingency
            <select
              className="field w-24"
              value={String(cont)}
              onChange={(e) => setCont(Number(e.target.value))}
            >
              <option value="0">0%</option>
              <option value="0.1">10%</option>
              <option value="0.15">15%</option>
              <option value="0.2">20%</option>
            </select>
          </label>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="py-1 font-normal">Flower</th>
                <th className="py-1 font-normal">Stems</th>
                <th className="py-1 text-right font-normal">Est.</th>
              </tr>
            </thead>
            <tbody>
              {plan.rows.map((r) => (
                <tr key={r.stemId} className="border-t border-line">
                  <td className="flex items-center gap-2 py-2">
                    <img src={r.photo} alt="" className="h-7 w-7 rounded-full object-cover" />
                    {r.name}
                  </td>
                  <td className="tabular-nums">{r.total}</td>
                  <td className="text-right tabular-nums">${Math.round(r.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 flex justify-between border-t border-line pt-3 font-serif text-xl">
            Estimated total <span>${Math.round(plan.cost)}</span>
          </p>
          <a href="#buy" className="btn btn-primary mt-4 w-full justify-center">
            View where to buy
          </a>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section id="buy" className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <Step n={4} kicker="Where to buy" line="Compare prices, availability & pickup" />
          <p className="mt-3 text-sm text-muted">{city}</p>
          <ul className="mt-3 divide-y divide-line">
            {FLOWER_SHOPS.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[11px] text-muted">{s.line}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-serif text-lg tabular-nums">${Math.round(plan.cost * s.factor)}</p>
                  <button type="button" onClick={toShop} className="btn btn-ghost">
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/studio/shop" className="mt-3 inline-block text-sm underline">
            Compare all vendors →
          </Link>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <Step n={5} kicker="Build plan" line="When everything must be made" />
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {days.map((d) => (
              <div
                key={d.key}
                className={`min-w-[4.4rem] rounded-xl px-2 py-2 text-center ${
                  d.wedding ? "bg-ink text-ivory" : "bg-paper"
                }`}
              >
                <p className="text-[10px] tracking-wide">{d.dow}</p>
                <p className="text-xs">{d.label}</p>
                {d.wedding ? <p className="mt-1 text-[9px] uppercase">Wedding</p> : null}
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {BUILD_STEPS.map((s) => (
              <li key={s.what} className="flex gap-3">
                <span className="w-16 shrink-0 text-[11px] tabular-nums text-muted">{s.time}</span>
                <span>{s.what}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-4 overflow-hidden rounded-xl">
            <img src={hero} alt="" className="aspect-[16/9] w-full object-cover" />
            <p className="absolute inset-x-0 bottom-0 bg-ink/50 px-3 py-2 text-[11px] text-ivory">
              Step-by-step: building this look
            </p>
          </div>
          <Link href="/diy/calendar" className="mt-3 inline-block text-sm underline">
            View all instructions →
          </Link>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <Step n={6} kicker="Collaborate" line="Invite your people to help" />
          <ul className="mt-4 space-y-3">
            {[
              { name: names, role: "Owner" },
              { name: "Lead builder", role: "Assign in Party" },
              { name: "Flowers & prep", role: "Open" },
              { name: "Transport", role: "Open" },
            ].map((p) => (
              <li key={p.role} className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper font-serif">
                  {p.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-[11px] text-muted">{p.role}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/planning/party" className="btn btn-ghost mt-5 w-full justify-center">
            Invite people
          </Link>
        </section>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-5 py-4">
        <div>
          <p className="kicker">DIY inventory</p>
          <p className="mt-1 text-sm text-muted">Track supplies, packing lists, and boxes for the day.</p>
        </div>
        <Link href="/studio/inventory" className="btn btn-ghost">
          Open inventory →
        </Link>
      </section>

      {msg ? <p className="text-sm text-sage">{msg}</p> : null}

      {browse ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <div className="max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-paper p-5">
            <div className="flex items-center justify-between">
              <p className="font-serif text-2xl">Steal a look</p>
              <button type="button" onClick={() => setBrowse(false)} className="text-sm underline">
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {LOOKS.map((l) => (
                <button key={l.id} type="button" onClick={() => apply(l)} className="overflow-hidden rounded-2xl border border-line text-left">
                  <img src={l.photo} alt="" className="aspect-[16/10] w-full object-cover" />
                  <span className="block p-3">
                    <span className="font-serif text-xl">{l.title}</span>
                    <span className="mt-1 block text-sm text-muted">{l.why}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Step({ n, kicker, line }: { n: number; kicker: string; line: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs text-ivory">{n}</span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em]">{kicker}</p>
        <p className="text-xs text-muted">{line}</p>
      </div>
    </div>
  );
}

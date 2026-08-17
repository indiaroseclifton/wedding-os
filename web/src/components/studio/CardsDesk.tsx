"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { StoredGuest } from "@/lib/data/store";
import { cardsCsv, mergeCards, sortCards, type CardKind, type CardMode } from "@/lib/cards";

export function CardsDesk({ guests, names }: { guests: StoredGuest[]; names: string }) {
  const [mode, setMode] = useState<CardMode>("plates");
  const [kind, setKind] = useState<CardKind>("escort");
  const [meals, setMeals] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { rows, proof } = useMemo(() => mergeCards(guests, mode), [guests, mode]);
  const sorted = useMemo(() => sortCards(rows, kind), [rows, kind]);

  function downloadCsv() {
    const blob = new Blob([cardsCsv(sorted)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Vowfolk-${kind}-cards.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("CSV saved — Avery Design & Print can mail-merge this");
  }

  const printHref = `/studio/cards/print?kind=${kind}&mode=${mode}${meals ? "&meals=1" : ""}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Studio</p>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,6vw,3.6rem)] leading-none tracking-tight">Cards</h1>
          <p className="home-script mt-2">The list becomes paper.</p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Names and tables from People. Print escort cards A–Z or tents by table on letter paper tonight. Avery and Cricut use the same merge.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadCsv} className="btn btn-ghost">
            CSV
          </button>
          <Link href={printHref} className="btn btn-primary">
            Print {kind === "escort" ? "escort" : "tents"}
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["plates", "Yes only"],
            ["holding", "Hold chairs"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`min-h-11 rounded-full px-4 text-sm ${mode === id ? "bg-ink text-ivory" : "border border-line"}`}
          >
            {label}
          </button>
        ))}
        {(
          [
            ["escort", "Escort · A–Z"],
            ["place", "Place · by table"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            className={`min-h-11 rounded-full px-4 text-sm ${kind === id ? "bg-ink text-ivory" : "border border-line"}`}
          >
            {label}
          </button>
        ))}
        <label className="flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm">
          <input type="checkbox" checked={meals} onChange={(e) => setMeals(e.target.checked)} />
          Meal marks
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">Cards</p>
          <p className="font-serif text-3xl">{sorted.length}</p>
          <p className="text-xs text-muted">{names}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">No table</p>
          <p className="font-serif text-3xl">{proof.noTable.length}</p>
          <p className="text-xs text-muted">
            {proof.noTable.length ? <Link href="/seating" className="underline">Seat them</Link> : "Every card has a table"}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">Nameless plus-ones</p>
          <p className="font-serif text-3xl">{proof.unnamedPlus.reduce((s, u) => s + u.missing, 0)}</p>
          <p className="text-xs text-muted">No card until they have a name</p>
        </div>
      </div>

      {proof.unnamedPlus.length ? (
        <ul className="text-sm text-muted">
          {proof.unnamedPlus.map((u) => (
            <li key={u.guestId}>
              {u.name} — {u.missing} plus-one{u.missing > 1 ? "s" : ""} still “+1”
            </li>
          ))}
        </ul>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2 font-normal">Name</th>
              <th className="px-4 py-2 font-normal">Table</th>
              <th className="px-4 py-2 font-normal">Meal</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-2">
                  {r.name}
                  {r.source === "plus" ? <span className="ml-2 text-xs text-muted">plus</span> : null}
                </td>
                <td className="px-4 py-2 text-muted">{r.table || "—"}</td>
                <td className="px-4 py-2 text-muted">{r.meal || "—"}</td>
              </tr>
            ))}
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted">
                  No one in this pool. Seat a Yes, or switch to hold chairs.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {msg ? <p className="text-xs text-sage">{msg}</p> : null}
    </div>
  );
}

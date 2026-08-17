"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { StoredGuest } from "@/lib/data/store";
import { CANVA_FIELDS, CANVA_SIZES, cardsCsv, menuCsv, mergeCards, sortCards, type CardKind, type CardMode } from "@/lib/cards";
import { PrintPress } from "@/components/studio/PrintPress";

function downloadText(name: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function CardsDesk({
  guests,
  names,
  date,
}: {
  guests: StoredGuest[];
  names: string;
  date: string;
}) {
  const [mode, setMode] = useState<CardMode>("plates");
  const [kind, setKind] = useState<CardKind>("escort");
  const [meals, setMeals] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { rows, proof } = useMemo(() => mergeCards(guests, mode), [guests, mode]);
  const sorted = useMemo(() => sortCards(rows, kind), [rows, kind]);

  const prettyDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "";

  function downloadGuestCsv() {
    downloadText(`Vowfolk-${kind}-canva.csv`, cardsCsv(sorted));
    setMsg("CSV saved — Canva Bulk Create or Avery mail-merge");
  }

  function downloadMenu() {
    downloadText("Vowfolk-menu-canva.csv", menuCsv({ names, date: prettyDate }));
    setMsg("One-row menu file — tag {{Names}} {{Date}} {{Heading}} {{Courses}}");
  }

  const printHref = `/studio/cards/print?kind=${kind}&mode=${mode}${meals ? "&meals=1" : ""}`;
  const avery5302 = `${printHref}&stock=avery5302`;
  const avery5371 = `${printHref}&stock=avery5371`;
  const avery5160 = `${printHref}&stock=avery5160`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Studio</p>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,6vw,3.6rem)] leading-none tracking-tight">Cards</h1>
          <p className="home-script mt-2">The list becomes paper.</p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Names and tables from People. Print on letter tonight, or take the same file to Canva Bulk Create or Avery.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadGuestCsv} className="btn btn-ghost">
            Canva CSV
          </button>
          <Link href={printHref} className="btn btn-primary">
            Print {kind === "escort" ? "escort" : "tents"}
          </Link>
          <Link href={avery5302} className="btn btn-ghost">
            Avery 5302
          </Link>
          <Link href={avery5371} className="btn btn-ghost">
            Avery 5371
          </Link>
          <Link href={avery5160} className="btn btn-ghost">
            Avery 5160
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

      <div className="grid gap-3 sm:grid-cols-4">
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
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">No address</p>
          <p className="font-serif text-3xl">{proof.noAddress.length}</p>
          <p className="text-xs text-muted">
            {proof.noAddress.length ? <Link href="/guests" className="underline">For 5160</Link> : "Ready to mail"}
          </p>
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

      <PrintPress />

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="kicker">Canva</p>
        <h2 className="mt-1 font-serif text-2xl tracking-tight">Their art. Our names.</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          We cannot open her Canva file and stamp the list — that API is Enterprise. Bulk Create on any plan takes this CSV.
        </p>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>Download the guest CSV (or the one-row menu file).</li>
          <li>In Canva, set the page to a size below.</li>
          <li>Type the tokens on the text boxes — they must match exactly.</li>
          <li>Apps → Bulk Create → upload the CSV → Generate.</li>
          <li>Print from Canva, or export PDF and use our letter / Avery sheet later.</li>
        </ol>

        <div className="mt-5">
          <p className="kicker">Tokens</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CANVA_FIELDS.map((f) => (
              <button
                key={f.col}
                type="button"
                className="flex min-h-12 items-center justify-between rounded-xl border border-line px-3 text-left text-sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(f.token);
                  setMsg(`${f.token} copied`);
                }}
              >
                <span>
                  <span className="font-medium">{f.token}</span>
                  <span className="ml-2 text-muted">{f.line}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="kicker">Design at this size</p>
          <ul className="mt-2 divide-y divide-line text-sm">
            {CANVA_SIZES.map((s) => (
              <li key={s.id} className="flex justify-between gap-3 py-2">
                <span>{s.label}</span>
                <span className="text-muted">{s.size}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={downloadGuestCsv} className="btn btn-primary">
            Guest CSV for Bulk Create
          </button>
          <button type="button" onClick={downloadMenu} className="btn btn-ghost">
            Menu CSV (one row)
          </button>
          <a href="https://www.canva.com/" target="_blank" rel="noreferrer" className="btn btn-ghost">
            Open Canva
          </a>
        </div>
      </section>
    </div>
  );
}

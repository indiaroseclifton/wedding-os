"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PRINT_KEY,
  defaultPrint,
  formatOffset,
  pressAdvice,
  type PrintKind,
  type PrintProfile,
} from "@/lib/cards";

export function PrintPress({ stock = "letter" }: { stock?: "letter" | "avery5302" | "avery5371" | "menu" }) {
  const [p, setP] = useState<PrintProfile>(defaultPrint);
  const [pack, setPack] = useState(stock);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRINT_KEY);
      if (raw) setP({ ...defaultPrint(), ...JSON.parse(raw) });
    } catch {
      /* keep default */
    }
  }, []);

  function save(next: PrintProfile) {
    setP(next);
    localStorage.setItem(PRINT_KEY, JSON.stringify(next));
  }

  const lines = pressAdvice(p.kind, pack);

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p className="kicker">The press</p>
      <h2 className="mt-1 font-serif text-2xl tracking-tight">There is no Avery driver.</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        5302 is paper. HP, Canon, Epson. Actual size. Rear tray. This is the whole setting.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["inkjet", "laser"] as PrintKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => save({ ...p, kind: k })}
            className={`min-h-11 rounded-full px-4 text-sm capitalize ${p.kind === k ? "bg-ink text-ivory" : "border border-line"}`}
          >
            {k}
          </button>
        ))}
        <label className="flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm">
          <input
            type="checkbox"
            checked={p.borderless}
            onChange={(e) => save({ ...p, borderless: e.target.checked })}
          />
          Borderless
        </label>
        {(
          [
            ["letter", "Letter"],
            ["avery5302", "5302"],
            ["avery5371", "5371"],
            ["menu", "Menu"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPack(id)}
            className={`min-h-11 rounded-full px-4 text-sm ${pack === id ? "bg-ink text-ivory" : "border border-line"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p className="text-sm">
          {Math.round(p.scale * 100)}% · {formatOffset(p.offsetX)} across · {formatOffset(p.offsetY)} down
        </p>
        <Link href="/studio/cards/calibrate" className="btn btn-ghost">
          Calibrate
        </Link>
      </div>
      {!p.borderless && pack === "menu" ? (
        <p className="mt-3 text-sm text-muted">No borderless. Print 2-up on letter and trim.</p>
      ) : null}
    </section>
  );
}

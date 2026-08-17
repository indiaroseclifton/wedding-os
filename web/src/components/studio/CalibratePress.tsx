"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PrintButton } from "@/components/ui/PrintButton";
import { PRINT_KEY, defaultPrint, scaleFromMeasure } from "@/lib/cards";

export function CalibratePress() {
  const [measured, setMeasured] = useState("2");
  const [saved, setSaved] = useState(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRINT_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.scale === "number") setSaved(p.scale);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function keep() {
    const inches = Number(measured);
    const scale = scaleFromMeasure(inches);
    const prev = (() => {
      try {
        return { ...defaultPrint(), ...JSON.parse(localStorage.getItem(PRINT_KEY) || "{}") };
      } catch {
        return defaultPrint();
      }
    })();
    localStorage.setItem(PRINT_KEY, JSON.stringify({ ...prev, scale }));
    setSaved(scale);
  }

  const preview = scaleFromMeasure(Number(measured));

  return (
    <div className="space-y-6">
      <style>{`
        @page { size: letter; margin: 0.75in; }
        @media print {
          .no-print { display: none !important; }
        }
        .sq {
          width: 2in;
          height: 2in;
          border: 2pt solid #1c1a16;
          box-sizing: border-box;
        }
      `}</style>

      <header className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Print</p>
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.2rem)] leading-none tracking-tight">
            Does this measure two inches?
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Print this page. Actual size. Ruler on the square. If it’s 2.1″, we shrink the next sheet. If it’s 1.9″, we grow it.
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print square" />
          <Link href="/studio/cards" className="btn btn-ghost">
            Cards
          </Link>
        </div>
      </header>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="kicker no-print">The square</p>
          <div className="sq mt-2" />
          <p className="mt-2 text-xs tracking-wide text-muted">2 inches</p>
        </div>
        <div className="no-print max-w-sm space-y-3">
          <label className="block text-sm">
            <span className="kicker">It measured</span>
            <input
              className="field mt-1"
              inputMode="decimal"
              value={measured}
              onChange={(e) => setMeasured(e.target.value)}
              placeholder="2.05"
            />
            <span className="mt-1 block text-xs text-muted">Inches, as the ruler says</span>
          </label>
          <button type="button" onClick={keep} className="btn btn-primary">
            Use {Math.round(preview * 100)}% on the next print
          </button>
          <p className="text-xs text-muted">Saved scale {Math.round(saved * 100)}%. Cards and Avery both use it.</p>
        </div>
      </div>
    </div>
  );
}

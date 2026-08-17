"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PrintButton } from "@/components/ui/PrintButton";
import {
  PRINT_KEY,
  PRINT_STEP,
  clampOffset,
  defaultPrint,
  formatOffset,
  scaleFromMeasure,
  type PrintProfile,
} from "@/lib/cards";

function load(): PrintProfile {
  try {
    return { ...defaultPrint(), ...JSON.parse(localStorage.getItem(PRINT_KEY) || "{}") };
  } catch {
    return defaultPrint();
  }
}

export function CalibratePress() {
  const [p, setP] = useState<PrintProfile>(defaultPrint);
  const [measured, setMeasured] = useState("2");

  useEffect(() => {
    setP(load());
  }, []);

  function save(next: PrintProfile) {
    setP(next);
    localStorage.setItem(PRINT_KEY, JSON.stringify(next));
  }

  function nudge(axis: "offsetX" | "offsetY", dir: number) {
    save({ ...p, [axis]: clampOffset(p[axis] + dir * PRINT_STEP) });
  }

  function keepScale() {
    save({ ...p, scale: scaleFromMeasure(Number(measured)) });
  }

  const preview = scaleFromMeasure(Number(measured));

  return (
    <div className="space-y-8">
      <style>{`
        @page { size: letter; margin: 0.5in; }
        @media print {
          .no-print { display: none !important; }
          .target { break-after: page; }
        }
        .target {
          position: relative;
          width: 7.5in;
          height: 10in;
          margin: 0 auto;
          transform: translate(var(--print-x, 0in), var(--print-y, 0in)) scale(var(--print-scale, 1));
          transform-origin: top left;
        }
        .mark {
          position: absolute;
          width: 0.35in;
          height: 0.35in;
          border-color: #1c1a16;
          border-style: solid;
        }
        .sq {
          width: 2in;
          height: 2in;
          border: 2pt solid #1c1a16;
          box-sizing: border-box;
        }
        .fold {
          position: absolute;
          left: 0.25in;
          right: 0.25in;
          top: 5in;
          border-top: 0.6pt dashed #1c1a16;
        }
      `}</style>

      <header className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Print</p>
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.2rem)] leading-none tracking-tight">
            Nudge until the corners sit on the holes.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Print the target. Actual size. If the names are low, tap Up. If they’re left of the cell, tap Right. 1/16″ a click.
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print target" />
          <Link href="/studio/cards" className="btn btn-ghost">
            Cards
          </Link>
        </div>
      </header>

      <div
        className="no-print grid gap-6 lg:grid-cols-[auto_1fr]"
        style={{
          ["--print-scale" as string]: String(p.scale),
          ["--print-x" as string]: `${p.offsetX}in`,
          ["--print-y" as string]: `${p.offsetY}in`,
        }}
      >
        <div className="space-y-4">
          <p className="kicker">Shift</p>
          <div className="grid w-44 grid-cols-3 gap-2">
            <span />
            <button type="button" className="btn btn-ghost min-h-11" onClick={() => nudge("offsetY", -1)}>
              Up
            </button>
            <span />
            <button type="button" className="btn btn-ghost min-h-11" onClick={() => nudge("offsetX", -1)}>
              Left
            </button>
            <button type="button" className="btn btn-ghost min-h-11" onClick={() => save({ ...p, offsetX: 0, offsetY: 0 })}>
              0
            </button>
            <button type="button" className="btn btn-ghost min-h-11" onClick={() => nudge("offsetX", 1)}>
              Right
            </button>
            <span />
            <button type="button" className="btn btn-ghost min-h-11" onClick={() => nudge("offsetY", 1)}>
              Down
            </button>
          </div>
          <p className="text-sm tabular-nums">
            {formatOffset(p.offsetX)} across · {formatOffset(p.offsetY)} down
          </p>
          <p className="text-xs text-muted">Max ±½″. Saved on this browser. Avery and letter both use it.</p>

          <label className="block text-sm">
            <span className="kicker">The square measured</span>
            <input
              className="field mt-1"
              inputMode="decimal"
              value={measured}
              onChange={(e) => setMeasured(e.target.value)}
              placeholder="2.00"
            />
          </label>
          <button type="button" onClick={keepScale} className="btn btn-ghost">
            Set scale to {Math.round(preview * 100)}%
          </button>
          <p className="text-xs text-muted">Scale {Math.round(p.scale * 100)}% — only if the square is not 2″.</p>
        </div>
      </div>

      <section
        className="target"
        style={{
          ["--print-scale" as string]: String(p.scale),
          ["--print-x" as string]: `${p.offsetX}in`,
          ["--print-y" as string]: `${p.offsetY}in`,
        }}
      >
        <span className="mark top-0 left-0 border-t-2 border-l-2" />
        <span className="mark top-0 right-0 border-t-2 border-r-2" />
        <span className="mark bottom-0 left-0 border-b-2 border-l-2" />
        <span className="mark bottom-0 right-0 border-b-2 border-r-2" />
        <div className="fold" />
        <div className="absolute left-1/2 top-[1.4in] -translate-x-1/2 text-center">
          <p className="kicker">Vowfolk</p>
          <p className="mt-1 font-serif text-2xl">Target</p>
          <p className="mt-1 text-xs text-muted">Corners should kiss the sheet. Fold is 5302.</p>
          <div className="sq mx-auto mt-4" />
          <p className="mt-2 text-xs tracking-wide">2 inches</p>
        </div>
      </section>
    </div>
  );
}

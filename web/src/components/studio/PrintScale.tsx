"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  PRINT_KEY,
  defaultPrint,
  formatOffset,
  printDialogRows,
  type PrintKind,
} from "@/lib/cards";

export function PrintScale({
  stock,
  children,
}: {
  stock: "letter" | "avery5302" | "avery5371";
  children: ReactNode;
}) {
  const [scale, setScale] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [kind, setKind] = useState<PrintKind>("inkjet");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRINT_KEY);
      if (!raw) return;
      const p = { ...defaultPrint(), ...JSON.parse(raw) };
      if (typeof p.scale === "number") setScale(p.scale);
      if (typeof p.offsetX === "number") setX(p.offsetX);
      if (typeof p.offsetY === "number") setY(p.offsetY);
      if (p.kind === "laser" || p.kind === "inkjet") setKind(p.kind);
    } catch {
      /* default */
    }
  }, []);

  const rows = printDialogRows(kind, stock);

  return (
    <div
      style={{
        ["--print-scale" as string]: String(scale),
        ["--print-x" as string]: `${x}in`,
        ["--print-y" as string]: `${y}in`,
      }}
    >
      <aside className="no-print mb-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <p className="kicker">Print dialog</p>
        <h2 className="mt-1 font-serif text-2xl tracking-tight">Set this, then print.</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          We cannot touch HP or Canon. Chrome hides Media — use the system dialog. {kind === "laser" ? "Laser." : "Inkjet."}
        </p>
        <dl className="mt-4 divide-y divide-line text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex flex-wrap justify-between gap-2 py-2">
              <dt className="text-muted">{r.label}</dt>
              <dd className="text-right font-medium">{r.set}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted">
          Vowfolk origin {Math.round(scale * 100)}% · {formatOffset(x)} across · {formatOffset(y)} down. This side up.
        </p>
        <label className="mt-4 flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={ready} onChange={(e) => setReady(e.target.checked)} />
          The dialog is set
        </label>
        <button
          type="button"
          disabled={!ready}
          onClick={() => window.print()}
          className="btn btn-primary mt-3 disabled:opacity-40"
        >
          Print
        </button>
      </aside>
      {children}
    </div>
  );
}

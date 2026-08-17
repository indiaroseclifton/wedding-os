"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PRINT_KEY, defaultPrint, pressAdvice, type PrintKind } from "@/lib/cards";

export function PrintScale({
  stock,
  children,
}: {
  stock: "letter" | "avery5302" | "avery5371";
  children: ReactNode;
}) {
  const [scale, setScale] = useState(1);
  const [kind, setKind] = useState<PrintKind>("inkjet");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRINT_KEY);
      if (!raw) return;
      const p = { ...defaultPrint(), ...JSON.parse(raw) };
      if (typeof p.scale === "number") setScale(p.scale);
      if (p.kind === "laser" || p.kind === "inkjet") setKind(p.kind);
    } catch {
      /* default */
    }
  }, []);

  const lines = pressAdvice(kind, stock);

  return (
    <div style={{ ["--print-scale" as string]: String(scale) }}>
      <aside className="no-print mb-6 rounded-2xl border border-line bg-surface p-4 text-sm">
        <p className="kicker">This tray</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted">
          Applied scale {Math.round(scale * 100)}%. This side up. Align to the top-left.
        </p>
      </aside>
      {children}
    </div>
  );
}

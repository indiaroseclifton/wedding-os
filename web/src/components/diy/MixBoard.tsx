"use client";

import { useEffect, useMemo, useState } from "react";
import { DIY_PIECES, laborWarning, type PieceChoice } from "@/lib/diy/mix";

type Path = { pieces?: Record<string, { choice: PieceChoice; hours?: number }> };

export function MixBoard() {
  const [path, setPath] = useState<Path>({ pieces: {} });
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/path");
    if (res.ok) {
      const data = await res.json();
      setPath(data.path || { pieces: {} });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setChoice(pieceId: string, choice: PieceChoice) {
    setBusy(true);
    try {
      const res = await fetch("/api/path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pieceId, choice }),
      });
      const data = await res.json();
      if (res.ok) setPath(data.path);
    } finally {
      setBusy(false);
    }
  }

  const warn = useMemo(() => laborWarning(path.pieces || {}), [path.pieces]);

  return (
    <section className="rounded-[1.4rem] border border-line bg-surface p-5">
      <p className="kicker kicker-moss">The mix</p>
      <h2 className="mt-1 font-serif text-3xl">Hire this. Make that.</h2>
      <p className="mt-1 text-sm text-muted">Per piece — not one slider for the whole wedding.</p>
      <ul className="mt-4 divide-y divide-line">
        {DIY_PIECES.map((p) => {
          const choice = path.pieces?.[p.id]?.choice || "undecided";
          return (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted">
                  {p.hours}h{p.cooler ? " · cooler" : ""} · last buy {p.lastBuy}d out
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {(["make", "hire", "skip"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={busy}
                    onClick={() => setChoice(p.id, c)}
                    className={`min-h-11 rounded-full px-3 text-xs capitalize ${
                      choice === c ? "bg-moss text-moss-fg" : "border border-line"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      {warn.message && (
        <p className={`mt-4 text-sm ${warn.over ? "text-clay" : "text-muted"}`}>{warn.message}</p>
      )}
    </section>
  );
}

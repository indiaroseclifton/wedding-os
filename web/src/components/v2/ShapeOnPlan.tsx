"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SHAPE_CARDS, type WeddingShape } from "@/lib/shape";

export function ShapeOnPlan({ current }: { current?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function pick(shape: WeddingShape) {
    setBusy(shape);
    await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shape, applyShapeDefaults: true }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <section className="rounded-[1.5rem] border border-line bg-surface p-5">
      <p className="kicker kicker-moss">Shape of the day</p>
      <h2 className="mt-2 font-serif text-3xl">This is the plan</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Just us, a small room, the weekend, or two days. The checklist follows this choice.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {SHAPE_CARDS.map((card) => {
          const on = current === card.id;
          return (
            <button
              key={card.id}
              type="button"
              disabled={!!busy}
              onClick={() => pick(card.id)}
              className={`rounded-2xl border px-4 py-4 text-left ${
                on ? "border-ink bg-ink text-ivory" : "border-line"
              }`}
            >
              <p className="font-serif text-xl">{card.title}</p>
              <p className={`mt-1 text-xs ${on ? "text-ivory/70" : "text-muted"}`}>{card.line}</p>
              {busy === card.id ? <p className="mt-2 text-[10px] uppercase tracking-wide">Saving</p> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

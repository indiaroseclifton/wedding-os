"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  KINDS,
  STAGES,
  hoursLeft,
  projectCost,
  projectProgress,
  type AfterFate,
  type StudioProject,
} from "@/lib/studio-project";
import { money } from "@/lib/visual-rooms";

export function ProjectDesk({ initial }: { initial: StudioProject }) {
  const router = useRouter();
  const [p, setP] = useState(initial);

  async function act(body: Record<string, unknown>) {
    const res = await fetch("/api/studio/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;
    const data = await res.json();
    const next = data.studio?.projects?.find((x: StudioProject) => x.id === p.id);
    if (next) setP(next);
  }

  const kind = KINDS.find((k) => k.id === p.kind);
  const cost = projectCost(p);
  const pct = projectProgress(p);
  const hours = hoursLeft(p);
  const save = Math.max(0, p.vendorEst - cost);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">{kind?.label}</p>
          <h1 className="mt-2 font-serif text-[clamp(2rem,5vw,3.2rem)] leading-none tracking-tight">{p.title}</h1>
          <p className="mt-2 text-sm text-muted">{p.note}</p>
          {p.inspiration ? <p className="mt-1 text-sm italic text-muted">“{p.inspiration}”</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {kind ? (
            <Link href={kind.href} className="btn btn-ghost">
              Open {kind.label}
            </Link>
          ) : null}
          <Link href="/studio" className="btn btn-ghost">
            Studio
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-1">
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => act({ action: "stage", id: p.id, stage: s.id })}
            className={`min-h-9 rounded-full px-3 text-xs ${p.stage === s.id ? "bg-ink text-ivory" : "text-muted"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">Ready</p>
          <p className="font-serif text-3xl">{pct}%</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">To make</p>
          <p className="font-serif text-3xl tabular-nums">{p.qty}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">Our cost</p>
          <p className="font-serif text-3xl">{money(cost)}</p>
          <p className="text-xs text-muted">Vendor-ish {money(p.vendorEst)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">Hours left</p>
          <p className="font-serif text-3xl tabular-nums">{hours}</p>
        </div>
      </div>

      {save > 0 ? (
        <p className="text-sm">
          Making this yourself is about <span className="font-medium">{money(save)}</span> less than hiring it out — if the vendor number holds.
        </p>
      ) : null}

      <section className="rounded-2xl border border-line bg-surface p-5">
        <p className="kicker">Materials · +15% on buys</p>
        <ul className="mt-3 divide-y divide-line">
          {p.materials.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={m.bought} onChange={() => act({ action: "toggle_material", id: p.id, materialId: m.id })} />
                <span className={m.bought ? "text-muted line-through" : ""}>
                  {m.qty} {m.unit} {m.label}
                </span>
              </label>
              <span className="text-xs text-muted">
                {m.source} · {m.fate} · {money(m.estEach * m.qty)}
              </span>
            </li>
          ))}
        </ul>
        <Link href="/studio/shop" className="mt-3 inline-block text-xs underline">
          All shopping, consolidated
        </Link>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <p className="kicker">Build</p>
        <ul className="mt-3 space-y-2">
          {p.steps.map((s) => (
            <li key={s.id} className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1" checked={s.done} onChange={() => act({ action: "toggle_step", id: p.id, stepId: s.id })} />
              <span>
                <span className="text-muted">{s.when} · {s.hours}h</span>
                <span className={`block ${s.done ? "text-muted line-through" : ""}`}>{s.what}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <p className="kicker">After</p>
        <p className="mt-1 text-sm text-muted">When the day is over, this project still exists.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["keep", "return", "sell", "donate", "reuse"] as AfterFate[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => act({ action: "after", id: p.id, afterFate: f })}
              className={`min-h-10 rounded-full px-4 text-sm capitalize ${p.afterFate === f ? "bg-ink text-ivory" : "border border-line"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="text-xs text-muted underline"
        onClick={async () => {
          await act({ action: "delete", id: p.id });
          router.push("/studio");
        }}
      >
        Remove project
      </button>
    </div>
  );
}

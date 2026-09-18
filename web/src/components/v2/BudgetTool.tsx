"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HowToButton } from "@/components/v2/HowToPop";
import { BUDGET_ENVELOPES, money } from "@/lib/budget-envelopes";
import {
  BUDGET_PHASES,
  chosenAmount,
  emptyAlternative,
  phaseCopy,
  whatIfTotal,
  type BudgetAlternative,
  type BudgetPhaseId,
} from "@/lib/budget-plan";

type Envelope = {
  id: string;
  hint: string;
  typicalPct: number;
  planned: number;
  spent: number;
  open: number;
  remaining: number;
};

type Rollup = {
  spent: number;
  inPlay: number;
  cap: number;
  remaining: number | null;
  vendorAll: number;
  diyEst: number;
};

export function BudgetTool() {
  const [phase, setPhase] = useState<BudgetPhaseId>("budget");
  const [limit, setLimit] = useState("");
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [alts, setAlts] = useState<BudgetAlternative[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [rollup, setRollup] = useState<Rollup | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState("");

  async function load() {
    const res = await fetch("/api/budget");
    if (!res.ok) return;
    const data = await res.json();
    setPhase(data.phase || "budget");
    setLimit(data.budget?.overallLimit ? String(data.budget.overallLimit) : "");
    setEnvelopes(data.envelopes || []);
    const nextAlts: BudgetAlternative[] = data.alternatives?.length
      ? data.alternatives
      : [
          {
            id: "music",
            title: "Music",
            agreedId: "dj",
            options: [
              { id: "dj", label: "DJ", amount: 0 },
              { id: "band", label: "Band", amount: 0 },
            ],
          },
          {
            id: "photo",
            title: "Photography",
            agreedId: "one",
            options: [
              { id: "one", label: "Studio one", amount: 0 },
              { id: "two", label: "Studio two", amount: 0 },
            ],
          },
        ];
    setAlts(nextAlts);
    setPicks(Object.fromEntries(nextAlts.map((a) => [a.id, a.agreedId])));
    setRollup(data.rollup || null);
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>, label: string) {
    setBusy(label);
    setMsg(null);
    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) {
      setMsg(data.error || "Could not save");
      return;
    }
    setMsg("Saved");
    if (data.phase) setPhase(data.phase);
    if (data.envelopes) setEnvelopes(data.envelopes);
    if (data.rollup) setRollup(data.rollup);
    if (data.alternatives) setAlts(data.alternatives);
    if (data.budget?.overallLimit != null) setLimit(String(data.budget.overallLimit));
  }

  const budget = rollup?.cap || Number(limit) || 0;
  const now = rollup?.spent || 0;
  const agreed = rollup?.inPlay || 0;
  const imagined = whatIfTotal(agreed, alts, picks);
  const copy = phaseCopy(phase);
  const dirty = alts.some((a) => (picks[a.id] || a.agreedId) !== a.agreedId);
  const left = budget ? budget - imagined : null;

  const split = useMemo(() => {
    const sum = envelopes.reduce((s, e) => s + (e.planned || 0), 0) || 1;
    return envelopes.map((e) => ({ ...e, share: Math.round(((e.planned || 0) / sum) * 100) }));
  }, [envelopes]);

  function moveEnvelope(id: string, planned: number) {
    setEnvelopes((list) => list.map((e) => (e.id === id ? { ...e, planned } : e)));
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Budget & Books</p>
          <h1 className="font-serif text-4xl">Budget</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">{copy.line}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <HowToButton id="budget" />
          <Link href="/payments" className="rounded-full border border-line px-3 py-1.5">
            Payments
          </Link>
        </div>
      </div>

      <nav className="grid gap-2 sm:grid-cols-4">
        {BUDGET_PHASES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setPhase(p.id);
              post({ action: "set_phase", phase: p.id }, "phase");
            }}
            className={`rounded-2xl border px-4 py-3 text-left ${
              phase === p.id ? "border-ink bg-ink text-ivory" : "border-line bg-surface"
            }`}
          >
            <span className="block font-serif text-xl">{p.label}</span>
            <span className={`mt-1 block text-[11px] leading-4 ${phase === p.id ? "text-ivory/70" : "text-muted"}`}>
              {p.line}
            </span>
          </button>
        ))}
      </nav>

      <section className="rounded-[1.6rem] border border-line bg-paper p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Status</p>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Now</p>
                <p className="mt-1 font-serif text-3xl tabular-nums">{money(now)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Agreed</p>
                <p className="mt-1 font-serif text-3xl tabular-nums">{money(agreed)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">What if</p>
                <p className="mt-1 font-serif text-3xl tabular-nums">{money(imagined)}</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full ${left != null && left < 0 ? "bg-clay" : "bg-moss"}`}
                style={{ width: `${budget ? Math.min(100, Math.round((imagined / budget) * 100)) : 0}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              {budget
                ? left != null && left < 0
                  ? `${money(Math.abs(left))} over the budget on this version.`
                  : `${money(left || 0)} remains against the budget.`
                : "Set the budget to watch Now, Agreed, and What if together."}
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              post({ action: "set_limit", overallLimit: limit }, "limit");
            }}
            className="rounded-2xl border border-line bg-surface/70 p-4"
          >
            <label className="block text-xs">
              Budget
              <input
                type="number"
                min={0}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="submit" className="rounded-full bg-ink px-4 py-2 text-xs text-ivory">
                {busy === "limit" ? "Saving…" : "Save budget"}
              </button>
              <button
                type="button"
                onClick={() => post({ action: "seed", overallLimit: limit }, "seed")}
                className="rounded-full border border-line px-4 py-2 text-xs"
              >
                Typical split
              </button>
            </div>
          </form>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Envelopes</p>
            <p className="text-xs text-muted">Slide to move the split. The books change when you save.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              post(
                {
                  action: "set_envelopes",
                  planned: Object.fromEntries(envelopes.map((e) => [e.id, e.planned])),
                },
                "envelopes",
              )
            }
            className="rounded-full border border-line px-3 py-1.5 text-xs"
          >
            {busy === "envelopes" ? "Saving…" : "Save split"}
          </button>
        </div>
        <ul className="space-y-3">
          {split.map((env) => (
            <li key={env.id} className="rounded-2xl border border-line bg-surface px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-serif text-xl">{env.id}</p>
                <p className="text-sm tabular-nums">{money(env.planned)}</p>
              </div>
              <p className="text-[11px] text-muted">{env.hint}</p>
              <input
                type="range"
                min={0}
                max={Math.max(budget || env.planned || 1000, env.planned)}
                step={50}
                value={env.planned}
                onChange={(e) => moveEnvelope(env.id, Number(e.target.value) || 0)}
                className="mt-3 w-full accent-[var(--moss,#5b6b4a)]"
              />
              <p className="mt-1 text-[11px] text-muted">
                {money(env.spent)} paid
                {env.open ? ` · ${money(env.open)} promised` : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium">What if</p>
          <p className="text-xs text-muted">
            Enter both prices yourself. Switch between them. Agreed stays still until you keep this plan.
          </p>
        </div>
        {alts.map((alt) => {
          const pick = picks[alt.id] || alt.agreedId;
          return (
            <article key={alt.id} className="rounded-[1.4rem] border border-line bg-paper p-5">
              <input
                value={alt.title}
                onChange={(e) => setAlts((list) => list.map((a) => (a.id === alt.id ? { ...a, title: e.target.value } : a)))}
                placeholder="Music, flowers, photography…"
                className="w-full bg-transparent font-serif text-2xl outline-none"
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {alt.options.map((opt) => {
                  const on = pick === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`cursor-pointer rounded-2xl border px-4 py-4 ${
                        on ? "border-ink bg-ink text-ivory" : "border-line bg-surface"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <input
                          value={opt.label}
                          onChange={(e) =>
                            setAlts((list) =>
                              list.map((a) =>
                                a.id === alt.id
                                  ? {
                                      ...a,
                                      options: a.options.map((o) =>
                                        o.id === opt.id ? { ...o, label: e.target.value } : o,
                                      ),
                                    }
                                  : a,
                              ),
                            )
                          }
                          className={`w-full bg-transparent text-sm outline-none ${on ? "text-ivory" : ""}`}
                        />
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          onClick={() => setPicks((p) => ({ ...p, [alt.id]: opt.id }))}
                          className={`relative h-6 w-11 shrink-0 rounded-full ${
                            on ? "bg-ivory/30" : "bg-line"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-transform ${
                              on ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={opt.amount || ""}
                        onChange={(e) =>
                          setAlts((list) =>
                            list.map((a) =>
                              a.id === alt.id
                                ? {
                                    ...a,
                                    options: a.options.map((o) =>
                                      o.id === opt.id ? { ...o, amount: Number(e.target.value) || 0 } : o,
                                    ),
                                  }
                                : a,
                            ),
                          )
                        }
                        placeholder="0"
                        className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm ${
                          on ? "border-ivory/30 bg-ink text-ivory" : "border-line bg-paper"
                        }`}
                      />
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted">
                Agreed {alt.options.find((o) => o.id === alt.agreedId)?.label || "—"} ·{" "}
                {money(chosenAmount(alt))}
                {pick !== alt.agreedId
                  ? ` · this version ${money(chosenAmount(alt, pick))}`
                  : ""}
              </p>
            </article>
          );
        })}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAlts((list) => [...list, emptyAlternative()])}
            className="rounded-full border border-line px-4 py-2 text-xs"
          >
            Add a comparison
          </button>
          <button
            type="button"
            disabled={!dirty && busy !== "keep"}
            onClick={() => {
              const next = alts.map((a) => ({ ...a, agreedId: picks[a.id] || a.agreedId }));
              setAlts(next);
              post({ action: "keep_plan", alternatives: next }, "keep");
            }}
            className="rounded-full bg-ink px-4 py-2 text-xs text-ivory disabled:opacity-40"
          >
            {busy === "keep" ? "Saving…" : "Keep this plan"}
          </button>
          <button
            type="button"
            onClick={() => post({ action: "save_alternatives", alternatives: alts }, "alts")}
            className="rounded-full border border-line px-4 py-2 text-xs"
          >
            Save prices
          </button>
        </div>
        {msg ? <p className="text-sm text-moss">{msg}</p> : null}
      </section>
    </div>
  );
}

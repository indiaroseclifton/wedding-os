"use client";

import { useMemo, useState } from "react";
import { FEATURES, GROUPS, NAME_SETS, PLANS, type PlanId } from "@/lib/plans";
import { HowToButton } from "@/components/v2/HowToPop";

export default function PlansPage() {
  const [setId, setSetId] = useState(NAME_SETS[0].id);
  const [plan, setPlan] = useState<PlanId | "all">("all");
  const names = NAME_SETS.find((s) => s.id === setId) || NAME_SETS[0];
  const label = { good: names.good, better: names.better, best: names.best };

  const rows = useMemo(() => {
    if (plan === "all") return FEATURES;
    return FEATURES.filter((f) => f[plan] && f[plan] !== "—");
  }, [plan]);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="kicker kicker-moss">V2 — prices are a draft</p>
        <h1 className="font-serif text-4xl">Good, better, best</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Pick a name set. Click a plan to see only what it includes. Nothing here is billed yet.
        </p>
        <p className="mt-2">
          <HowToButton id="money-plan" />
        </p>
      </div>

      <section>
        <p className="kicker">Name the rungs</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {NAME_SETS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSetId(s.id)}
              className={`rounded-full px-3 py-1.5 text-xs ${
                setId === s.id ? "bg-ink text-ivory" : "border border-line"
              }`}
            >
              {s.good} / {s.better} / {s.best}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">{names.note}</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlan((cur) => (cur === p.id ? "all" : p.id))}
            className={`rounded-2xl border px-4 py-4 text-left ${
              plan === p.id ? "border-ink bg-surface" : "border-line bg-surface"
            }`}
          >
            <p className="text-[10px] uppercase tracking-wide text-muted">{p.id}</p>
            <p className="font-serif text-3xl">{label[p.id]}</p>
            <p className="mt-1 text-sm">
              {p.price}
              <span className="text-muted">{p.cadence}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">{p.blurb}</p>
            <p className="mt-3 text-xs underline">{plan === p.id ? "Show all features" : "Show only this plan"}</p>
          </button>
        ))}
      </section>

      <section>
        <p className="kicker">Feature selector</p>
        <p className="mt-1 text-sm text-muted">
          {plan === "all" ? "Every row. A dash means that plan does not get it." : `Only what ${label[plan]} includes.`}
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface text-[10px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Feature</th>
                {(plan === "all" ? (["good", "better", "best"] as const) : ([plan] as const)).map((col) => (
                  <th key={col} className="px-3 py-2 font-medium">
                    {label[col]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((group) => {
                const slice = rows.filter((r) => r.group === group);
                if (!slice.length) return null;
                return (
                  <FeatureGroup
                    key={group}
                    group={group}
                    rows={slice}
                    cols={plan === "all" ? ["good", "better", "best"] : [plan]}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FeatureGroup({
  group,
  rows,
  cols,
}: {
  group: string;
  rows: typeof FEATURES;
  cols: PlanId[];
}) {
  return (
    <>
      <tr className="bg-paper">
        <td colSpan={1 + cols.length} className="px-3 py-2 text-[10px] uppercase tracking-wide text-muted">
          {group}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.id} className="border-t border-line">
          <td className="px-3 py-2">{row.label}</td>
          {cols.map((col) => (
            <td key={col} className="px-3 py-2 text-muted">
              {row[col]}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

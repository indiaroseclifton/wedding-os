"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { BUDGET_ENVELOPES, money } from "@/lib/budget-envelopes";

type Line = {
  id: string;
  category: string;
  label: string;
  planned: number;
  actual: number;
  hireEstimate?: number;
  diyEstimate?: number;
  path?: string;
  who?: string;
};

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
  vendorPaid: number;
  vendorOpen: number;
  vendorAll: number;
  diyEst: number;
  linesPlanned: number;
  linesActual: number;
  spent: number;
  inPlay: number;
  cap: number;
  remaining: number | null;
};

type Due = {
  id: string;
  vendorName: string;
  label: string;
  amount: number;
  dueDate?: string;
  vendorId?: string;
};

export default function BudgetPage() {
  const [budget, setBudget] = useState<{ lines: Line[]; overallLimit?: number } | null>(null);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [rollup, setRollup] = useState<Rollup | null>(null);
  const [upcoming, setUpcoming] = useState<Due[]>([]);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [planned, setPlanned] = useState(0);
  const [category, setCategory] = useState("Other");
  const [who, setWho] = useState("couple");
  const [path, setPath] = useState("undecided");
  const [hireEst, setHireEst] = useState("");
  const [diyEst, setDiyEst] = useState("");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/budget");
    if (res.ok) {
      const data = await res.json();
      setBudget(data.budget);
      setEnvelopes(data.envelopes || []);
      setRollup(data.rollup || null);
      setUpcoming(data.upcoming || []);
      setLimit(data.budget?.overallLimit ? String(data.budget.overallLimit) : "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not save");
      return;
    }
    setError(null);
    await load();
  }

  async function addLine(e: React.FormEvent) {
    e.preventDefault();
    await post({
      action: "add_line",
      label,
      planned,
      category,
      who,
      path,
      hireEstimate: hireEst === "" ? undefined : Number(hireEst),
      diyEstimate: diyEst === "" ? undefined : Number(diyEst),
    });
    setLabel("");
    setPlanned(0);
    setHireEst("");
    setDiyEst("");
  }

  const cap = rollup?.cap || 0;
  const committed = rollup?.inPlay || 0;
  const spent = rollup?.spent || 0;
  const left = rollup?.remaining;
  const usedPct = cap ? Math.min(100, Math.round((committed / cap) * 100)) : 0;
  const over = left != null && left < 0 ? Math.abs(left) : 0;

  const grouped = useMemo(() => {
    const map: Record<string, Line[]> = {};
    for (const l of budget?.lines || []) {
      (map[l.category] ||= []).push(l);
    }
    return map;
  }, [budget]);

  return (
    <div className="space-y-6">
      <RoomSubnav room="budget" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Budget</h1>
          <p className="mt-1 text-sm text-muted">
            One cap. Envelopes like a real wedding. Vendors and DIY feed the same number.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <Link href="/payments" className="rounded-full border border-line px-3 py-1.5">
            Payments
          </Link>
          <Link href="/diy" className="rounded-full border border-line px-3 py-1.5">
            DIY lists
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker kicker-moss">In play</p>
            <p className="font-serif text-5xl">{money(committed)}</p>
            <p className="mt-1 text-sm text-muted">
              {cap ? `${money(cap)} cap` : "Set a cap"}
              {left != null ? ` · ${left >= 0 ? `${money(left)} left` : `${money(over)} over`}` : ""}
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              post({ action: "set_limit", overallLimit: limit });
            }}
            className="flex items-end gap-2"
          >
            <label className="text-xs">
              Cap
              <input
                type="number"
                min={0}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="mt-1 block w-32 rounded-lg border border-line bg-paper px-3 py-2 text-sm"
              />
            </label>
            <button type="submit" className="rounded-full border border-line px-3 py-2 text-xs">
              Save
            </button>
          </form>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
          <div
            className={`h-full ${over ? "bg-clay" : "bg-moss"}`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Spent {money(spent)} · vendors {money(rollup?.vendorAll || 0)} · DIY {money(rollup?.diyEst || 0)}
        </p>
        {over > 0 && (
          <p className="mt-3 rounded-xl bg-clay/10 px-3 py-2 text-sm text-clay">
            You're {money(over)} over the cap.
          </p>
        )}
      </section>

      {!(budget?.lines || []).length && (
        <button
          type="button"
          disabled={busy || !limit}
          onClick={() => post({ action: "seed", overallLimit: limit })}
          className="w-full rounded-2xl border border-dashed border-moss/40 bg-moss-soft px-4 py-6 text-sm"
        >
          Build a typical wedding split from this cap
          <span className="mt-1 block text-xs text-muted">
            Venue 25%, food 22%, photo 12% — then you edit the envelopes.
          </span>
        </button>
      )}

      {upcoming.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Coming due</p>
            <Link href="/payments" className="text-xs underline">
              Ledger
            </Link>
          </div>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {upcoming.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{p.vendorName}</p>
                  <p className="text-xs text-muted">
                    {p.label}
                    {p.dueDate ? ` · ${p.dueDate}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span>{money(p.amount)}</span>
                  {p.vendorId && (
                    <Link href={`/vendors/${p.vendorId}`} className="text-xs underline">
                      Vendor
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <p className="mb-2 text-sm font-medium">Envelopes</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {envelopes.map((env) => {
            const denom = env.planned || env.spent + env.open || 1;
            const pct = Math.min(100, Math.round(((env.spent + env.open) / denom) * 100));
            const typical = cap ? Math.round((cap * env.typicalPct) / 100) : 0;
            return (
              <button
                key={env.id}
                type="button"
                onClick={() => {
                  setOpenCat(env.id);
                  setCategory(env.id);
                }}
                className="rounded-2xl border border-line bg-surface p-4 text-left"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-serif text-xl">{env.id}</p>
                  <p className="text-sm">{money(env.planned || typical)}</p>
                </div>
                <p className="mt-0.5 text-[11px] text-muted">{env.hint}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className={`h-full ${env.remaining < 0 ? "bg-clay" : "bg-moss"}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  {money(env.spent)} spent
                  {env.open ? ` · ${money(env.open)} open` : ""}
                  {env.planned
                    ? env.remaining >= 0
                      ? ` · ${money(env.remaining)} left`
                      : ` · ${money(Math.abs(env.remaining))} over`
                    : typical
                      ? ` · typical ${money(typical)}`
                      : ""}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <form onSubmit={addLine} className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm font-medium">Add a line</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="What"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          >
            {BUDGET_ENVELOPES.map((c) => (
              <option key={c.id}>{c.id}</option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            value={planned || ""}
            onChange={(e) => setPlanned(Number(e.target.value) || 0)}
            placeholder="Planned $"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <select
            value={who}
            onChange={(e) => setWho(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          >
            <option value="couple">We pay</option>
            <option value="family">Family pays</option>
            <option value="split">Split</option>
          </select>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            type="number"
            min={0}
            value={hireEst}
            onChange={(e) => setHireEst(e.target.value)}
            placeholder="Hire quote $"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            value={diyEst}
            onChange={(e) => setDiyEst(e.target.value)}
            placeholder="DIY estimate $"
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <select
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          >
            <option value="undecided">Undecided</option>
            <option value="hire">Hire</option>
            <option value="diy">DIY</option>
          </select>
        </div>
        <button type="submit" className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          Add
        </button>
      </form>

      {error && <p className="text-xs text-clay">{error}</p>}

      <section className="space-y-4">
        {(openCat ? [openCat] : Object.keys(grouped)).map((cat) => (
          <div key={cat}>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted">{cat}</p>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {(grouped[cat] || []).map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{l.label}</p>
                    <p className="text-xs text-muted">
                      {l.who === "family" ? "Family" : l.who === "split" ? "Split" : "Us"}
                      {l.path && l.path !== "undecided" ? ` · ${l.path}` : ""}
                      {l.hireEstimate ? ` · hire ${money(l.hireEstimate)}` : ""}
                      {l.diyEstimate ? ` · DIY ${money(l.diyEstimate)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-muted">
                      Spent
                      <input
                        type="number"
                        min={0}
                        defaultValue={l.actual}
                        onBlur={(e) =>
                          post({ action: "update_line", id: l.id, actual: Number(e.target.value) || 0 })
                        }
                        className="ml-2 w-24 rounded border border-line bg-paper px-2 py-1 text-sm"
                      />
                    </label>
                    <span className="text-muted">{money(l.planned)} planned</span>
                    <button
                      type="button"
                      onClick={() => post({ action: "delete_line", id: l.id })}
                      className="text-xs text-muted underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!(budget?.lines || []).length && (
          <p className="text-center text-sm text-muted">No lines yet. Seed the split or add one.</p>
        )}
      </section>
    </div>
  );
}

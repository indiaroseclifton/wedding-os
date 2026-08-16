"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CATEGORIES = [
  "Venue",
  "Food",
  "Photo",
  "Attire",
  "Flowers",
  "Music",
  "Decor",
  "Travel",
  "Other",
];

type Line = { id: string; category: string; label: string; planned: number; actual: number };
type Budget = { overallLimit?: number; lines: Line[]; currency: string };
type Rollup = {
  vendorPaid: number;
  vendorOpen: number;
  vendorAll: number;
  diyEst: number;
  linesPlanned: number;
  linesActual: number;
  inPlay: number;
  cap: number;
  remaining: number | null;
};

export default function BudgetPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [rollup, setRollup] = useState<Rollup | null>(null);
  const [label, setLabel] = useState("");
  const [planned, setPlanned] = useState(0);
  const [actual, setActual] = useState(0);
  const [category, setCategory] = useState("Other");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/budget");
    if (res.ok) {
      const data = await res.json();
      setBudget(data.budget);
      setRollup(data.rollup || null);
      setLimit(data.budget?.overallLimit ? String(data.budget.overallLimit) : "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError("Could not save budget");
      return;
    }
    const data = await res.json();
    setBudget(data.budget);
    setError(null);
    load();
  }

  async function addLine(e: React.FormEvent) {
    e.preventDefault();
    await post({ action: "add_line", label, planned, actual, category });
    setLabel("");
    setPlanned(0);
    setActual(0);
  }

  const plannedTotal = budget?.lines.reduce((s, l) => s + (l.planned || 0), 0) || 0;
  const inPlay = rollup?.inPlay ?? plannedTotal;
  const over =
    rollup?.remaining != null && rollup.remaining < 0 ? Math.abs(rollup.remaining) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget</h1>
          <p className="mt-1 text-sm text-slate-600">
            One number: vendor payments + DIY lists + these lines. Don't enter the same florist twice.
          </p>
        </div>
        <div className="flex gap-3 text-xs font-medium">
          <Link href="/payments" className="underline">
            Payments
          </Link>
          <Link href="/diy" className="underline">
            DIY lists
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-3xl font-semibold tracking-tight">${inPlay.toLocaleString()}</p>
        <p className="text-sm text-slate-500">
          in play
          {rollup?.cap ? ` of $${rollup.cap.toLocaleString()} cap` : ""}
          {rollup?.remaining != null && rollup.remaining >= 0
            ? ` · $${rollup.remaining.toLocaleString()} left`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">${(rollup?.vendorAll || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500">Vendors</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">${(rollup?.diyEst || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500">DIY estimate</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">${(rollup?.linesPlanned || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500">Other planned</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">${(rollup?.vendorPaid || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500">Already paid</p>
        </div>
      </div>

      {over > 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You're ${over.toLocaleString()} over the cap.
        </p>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "set_limit", overallLimit: limit });
        }}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="font-medium">Overall cap $</span>
          <input
            type="number"
            min={0}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="mt-1 block w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">
          Save cap
        </button>
      </form>

      <form onSubmit={addLine} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <span className="font-medium">Line</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">Planned $</span>
          <input
            type="number"
            min={0}
            value={planned}
            onChange={(e) => setPlanned(Number(e.target.value) || 0)}
            className="mt-1 block w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Actual $</span>
          <input
            type="number"
            min={0}
            value={actual}
            onChange={(e) => setActual(Number(e.target.value) || 0)}
            className="mt-1 block w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add
        </button>
      </form>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {(budget?.lines || []).map((l) => (
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{l.label}</p>
              <p className="text-xs text-slate-500">{l.category}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500">
                Actual
                <input
                  type="number"
                  min={0}
                  defaultValue={l.actual}
                  onBlur={(e) =>
                    post({
                      action: "update_line",
                      id: l.id,
                      actual: Number(e.target.value) || 0,
                    })
                  }
                  className="ml-2 w-24 rounded border border-slate-200 px-2 py-1 text-sm"
                />
              </label>
              <span className="text-slate-600">${l.planned.toLocaleString()} planned</span>
              <button
                type="button"
                onClick={() => post({ action: "delete_line", id: l.id })}
                className="text-xs text-slate-400 underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {!budget?.lines?.length && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">No lines yet</li>
        )}
      </ul>
    </div>
  );
}

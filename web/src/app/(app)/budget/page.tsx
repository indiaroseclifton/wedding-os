"use client";

import { useEffect, useState } from "react";

type Line = { id: string; category: string; label: string; planned: number; actual: number };
type Budget = { overallLimit?: number; lines: Line[]; currency: string };

export default function BudgetPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [label, setLabel] = useState("");
  const [planned, setPlanned] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/budget");
    if (res.ok) {
      const data = await res.json();
      setBudget(data.budget);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addLine(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_line", label, planned, category: "General" }),
    });
    if (!res.ok) {
      setError("Could not add line");
      return;
    }
    const data = await res.json();
    setBudget(data.budget);
    setLabel("");
    setPlanned(0);
  }

  const plannedTotal = budget?.lines.reduce((s, l) => s + (l.planned || 0), 0) || 0;
  const actualTotal = budget?.lines.reduce((s, l) => s + (l.actual || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Budget</h1>
        <p className="mt-1 text-sm text-slate-600">Simple planned vs actual lines.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">${plannedTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Planned</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">${actualTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Actual</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">
            {budget?.overallLimit != null ? `$${budget.overallLimit.toLocaleString()}` : "—"}
          </p>
          <p className="text-xs text-slate-500">Limit</p>
        </div>
      </div>

      <form onSubmit={addLine} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <span className="font-medium">Line</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} required className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm">
          <span className="font-medium">Planned $</span>
          <input type="number" min={0} value={planned} onChange={(e) => setPlanned(Number(e.target.value) || 0)} className="mt-1 block w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add
        </button>
      </form>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {(budget?.lines || []).map((l) => (
          <li key={l.id} className="flex justify-between px-4 py-3 text-sm">
            <span>{l.label}</span>
            <span className="text-slate-600">${l.planned.toLocaleString()}</span>
          </li>
        ))}
        {!budget?.lines?.length && (
          <li className="px-4 py-6 text-center text-sm text-slate-500">No lines yet</li>
        )}
      </ul>
    </div>
  );
}

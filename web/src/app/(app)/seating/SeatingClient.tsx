"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SeatingChart } from "./SeatingChart";

type Table = { id: string; name: string; capacity: number; shape: string };
type Guest = {
  id: string;
  name: string;
  tableLabel: string | null;
  dietary: string | null;
  rsvp: string;
};

export function SeatingClient({
  initialTables,
  initialGuests,
}: {
  initialTables: Table[];
  initialGuests: Guest[];
}) {
  const router = useRouter();
  const [tables, setTables] = useState(initialTables);
  const [guests, setGuests] = useState(initialGuests);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(8);
  const [shape, setShape] = useState("ROUND");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showChart, setShowChart] = useState(true);

  async function addTable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, capacity, shape }),
      });
      if (!res.ok) throw new Error("Could not create table");
      const data = await res.json();
      setTables((t) => [...t, data.table]);
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function assign(guestId: string, tableName: string | null) {
    setBusy(true);
    try {
      const res = await fetch(`/api/guests/${guestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableLabel: tableName }),
      });
      if (!res.ok) throw new Error("Could not assign");
      setGuests((gs) =>
        gs.map((g) => (g.id === guestId ? { ...g, tableLabel: tableName } : g))
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const unseated = guests.filter((g) => !g.tableLabel);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowChart((v) => !v)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
        >
          {showChart ? "Hide chart" : "Show chart"}
        </button>
      </div>

      {showChart && <SeatingChart tables={tables} guests={guests} />}

      <form onSubmit={addTable} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm">
          <span className="font-medium">New table</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Table 1"
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Capacity</span>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value) || 8)}
            className="mt-1 block w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Shape</span>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ROUND">Round</option>
            <option value="RECT">Rectangle</option>
            <option value="HEAD">Head table</option>
            <option value="SWEETHEART">Sweetheart</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Add table
        </button>
      </form>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {tables.map((t) => {
          const at = guests.filter((g) => g.tableLabel === t.name);
          const over = at.length > t.capacity;
          return (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className={`text-xs ${over ? "text-rose-600" : "text-slate-500"}`}>
                  {at.length}/{t.capacity}
                </p>
              </div>
              <ul className="mt-3 space-y-2">
                {at.map((g) => (
                  <li key={g.id} className="flex items-center justify-between text-xs">
                    <span>
                      {g.name}
                      {g.dietary ? ` · ${g.dietary}` : ""}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => assign(g.id, null)}
                      className="text-slate-500 underline"
                    >
                      Unseat
                    </button>
                  </li>
                ))}
                {at.length === 0 && <li className="text-xs text-slate-400">Empty</li>}
              </ul>
            </div>
          );
        })}
      </div>

      {unseated.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">Need a table</p>
          <ul className="mt-3 space-y-2">
            {unseated.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center gap-2 text-xs text-amber-900">
                <span className="font-medium">{g.name}</span>
                <select
                  disabled={busy || tables.length === 0}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) assign(g.id, e.target.value);
                  }}
                  className="rounded border border-amber-300 bg-white px-2 py-1"
                >
                  <option value="">Assign…</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

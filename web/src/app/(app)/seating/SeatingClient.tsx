"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SeatingChart } from "./SeatingChart";
import { SeatCanvas } from "./SeatCanvas";
import { RoomCanvas } from "./RoomCanvas";
import { PrintButton } from "@/components/ui/PrintButton";
import {
  type SeatConstraint,
  type SeatFreeze,
  type SeatGuest,
  freezeDiff,
  groupHouseholds,
  seatWeight,
  tableFill,
} from "@/lib/data/seating";

type Table = { id: string; name: string; capacity: number; shape: string };

export function SeatingClient({
  initialTables,
  initialGuests,
}: {
  initialTables: Table[];
  initialGuests: SeatGuest[];
}) {
  const [tables, setTables] = useState(initialTables);
  const [guests, setGuests] = useState(initialGuests);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(8);
  const [shape, setShape] = useState("ROUND");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [printMode, setPrintMode] = useState<"room" | "board" | "escort" | "cards">("room");
  const [view, setView] = useState<"room" | "chairs">("room");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCap, setEditCap] = useState(8);
  const [constraints, setConstraints] = useState<SeatConstraint[]>([]);
  const [freezes, setFreezes] = useState<SeatFreeze[]>([]);
  const [violations, setViolations] = useState<{ id: string; message: string }[]>([]);
  const [kind, setKind] = useState<SeatConstraint["kind"]>("never");
  const [pickA, setPickA] = useState("");
  const [pickB, setPickB] = useState("");
  const [lockTable, setLockTable] = useState("");

  useEffect(() => {
    fetch("/api/seating")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        applyPayload(d);
      })
      .catch(() => {});
  }, []);

  const unseated = guests.filter((g) => !g.tableLabel && g.rsvp !== "NO");
  const filteredUnseated = unseated.filter((g) =>
    !query.trim()
      ? true
      : `${g.name} ${g.partyName || ""} ${g.dietary || ""} ${g.side || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
  );
  const houses = useMemo(() => groupHouseholds(filteredUnseated), [filteredUnseated]);
  const overCapacity = tables.filter((t) => tableFill(t.name, guests) > t.capacity);
  const seatedCount = guests.filter((g) => g.tableLabel).reduce((s, g) => s + seatWeight(g), 0);
  const openCount = unseated.reduce((s, g) => s + seatWeight(g), 0);

  function applyPayload(data: {
    tables?: Table[];
    guests?: SeatGuest[];
    plan?: { constraints?: SeatConstraint[]; freezes?: SeatFreeze[] };
    violations?: { id: string; message: string }[];
  }) {
    if (data.tables) {
      setTables(
        data.tables.map((t) => ({
          id: t.id,
          name: t.name,
          capacity: t.capacity,
          shape: t.shape,
        }))
      );
    }
    if (data.guests) {
      setGuests(
        data.guests
          .filter((g) => g.rsvp !== "NO")
          .map((g) => ({
            id: g.id,
            name: g.name,
            tableLabel: g.tableLabel || null,
            dietary: g.dietary || null,
            rsvp: g.rsvp,
            side: g.side || null,
            partyName: g.partyName || null,
            plusOnes: g.plusOnes || 0,
            plusOneNames: g.plusOneNames || [],
            seatIndex: g.seatIndex ?? null,
          }))
      );
    }
    if (data.plan) {
      setConstraints(data.plan.constraints || []);
      setFreezes(data.plan.freezes || []);
    }
    if (data.violations) setViolations(data.violations);
  }

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function assign(guestIds: string[], tableName: string | null, seatIndex?: number) {
    if (!guestIds.length) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", guestIds, tableName, seatIndex }),
      });
      if (!res.ok) throw new Error("Could not assign");
      const data = await res.json();
      applyPayload(data);
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function autoFill() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auto" }),
      });
      if (!res.ok) throw new Error("Auto-seat failed");
      const data = await res.json();
      applyPayload(data);
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function freezeNow() {
    setBusy(true);
    try {
      const res = await fetch("/api/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "freeze" }),
      });
      if (!res.ok) throw new Error("Could not freeze");
      applyPayload(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function expandNamed() {
    setBusy(true);
    try {
      const res = await fetch("/api/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "expand" }),
      });
      if (!res.ok) throw new Error("Could not expand plus-ones");
      applyPayload(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function saveConstraint(e: React.FormEvent) {
    e.preventDefault();
    if (!pickA) return;
    setBusy(true);
    try {
      const res = await fetch("/api/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "constraint",
          kind,
          a: pickA,
          b: kind === "lock" ? undefined : pickB,
          tableName: kind === "lock" ? lockTable : undefined,
        }),
      });
      if (!res.ok) throw new Error("Could not save rule");
      applyPayload(await res.json());
      setPickA("");
      setPickB("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function dropConstraint(id: string) {
    const res = await fetch("/api/seating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "constraint", remove: id }),
    });
    if (res.ok) applyPayload(await res.json());
  }

  async function saveTable(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, capacity: editCap }),
      });
      if (!res.ok) throw new Error("Could not update table");
      const old = tables.find((t) => t.id === id);
      setTables((ts) =>
        ts.map((t) => (t.id === id ? { ...t, name: editName, capacity: editCap } : t))
      );
      if (old && old.name !== editName) {
        setGuests((gs) =>
          gs.map((g) => (g.tableLabel === old.name ? { ...g, tableLabel: editName } : g))
        );
      }
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function removeTable(id: string) {
    if (!confirm("Remove this table? People on it go back to unseated.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/tables/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete");
      const gone = tables.find((t) => t.id === id);
      setTables((ts) => ts.filter((t) => t.id !== id));
      if (gone) {
        setGuests((gs) =>
          gs.map((g) => (g.tableLabel === gone.name ? { ...g, tableLabel: null } : g))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function toggleHouse(ids: string[]) {
    setSelected((s) => {
      const all = ids.every((id) => s.includes(id));
      return all ? s.filter((id) => !ids.includes(id)) : [...new Set([...s, ...ids])];
    });
  }

  function onDropTable(tableName: string, e: React.DragEvent) {
    e.preventDefault();
    const fromDrag = e.dataTransfer.getData("text/plain");
    const ids = fromDrag ? [fromDrag] : selected;
    assign(ids.length ? ids : selected, tableName);
  }

  const escort = [...guests]
    .filter((g) => g.tableLabel)
    .sort((a, b) => a.name.localeCompare(b.name));
  const namedPlus = guests.filter((g) => (g.plusOneNames || []).some((n) => n.trim())).length;
  const lastFreeze = freezes[0] || null;
  const diff = freezeDiff(guests, lastFreeze);
  const guestById = useMemo(() => new Map(guests.map((g) => [g.id, g])), [guests]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 print:hidden">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{tables.length}</p>
          <p className="text-xs text-slate-500">Tables</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{seatedCount}</p>
          <p className="text-xs text-slate-500">Seats filled</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
          <p className="text-lg font-semibold">{openCount}</p>
          <p className="text-xs text-slate-500">Still open</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        {(["room", "chairs"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`min-h-11 rounded-full px-4 text-sm ${
              view === v ? "bg-moss text-ivory" : "border border-line"
            }`}
          >
            {v === "room" ? "Room" : "Chairs"}
          </button>
        ))}
      </div>

      {view === "room" ? (
        <RoomCanvas tables={tables} guests={guests} selected={selected} onAssign={(ids, name) => assign(ids, name)} />
      ) : (
      <section className="grid gap-6 rounded-2xl border border-line bg-surface/60 p-4 sm:grid-cols-2">
        {tables.map((t) => (
          <SeatCanvas
            key={t.id}
            table={t}
            guests={guests}
            onDropSeat={(id, tableName, seatIndex) => assign([id], tableName, seatIndex)}
          />
        ))}
        {!tables.length && <p className="text-sm text-muted">Add a table to place chairs.</p>}
      </section>
      )}

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setShowChart((v) => !v)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium"
        >
          {showChart ? "Hide preview" : "Chart preview"}
        </button>
        <button
          type="button"
          disabled={busy || !unseated.length}
          onClick={autoFill}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          Auto-seat leftovers
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={freezeNow}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          Freeze {lastFreeze ? `· ${lastFreeze.label}` : "chart"}
        </button>
        {namedPlus > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={expandNamed}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            Name {namedPlus} plus-one{namedPlus === 1 ? "" : "s"}
          </button>
        )}
        <select
          value={printMode}
          onChange={(e) => setPrintMode(e.target.value as typeof printMode)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
        >
          <option value="room">Print: room</option>
          <option value="board">Print: board</option>
          <option value="escort">Print: escort list</option>
          <option value="cards">Print: table cards</option>
        </select>
        <PrintButton label="Print" />
        <Link href="/seating/usher" className="rounded-full border border-line px-3 py-1.5 text-xs print:hidden">
          Usher card
        </Link>
        {selected.length > 0 && (
          <span className="text-xs text-slate-500">{selected.length} selected — tap a table</span>
        )}
      </div>

      {overCapacity.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 print:hidden">
          Over capacity:{" "}
          {overCapacity
            .map((t) => `${t.name} (${tableFill(t.name, guests)}/${t.capacity})`)
            .join(", ")}
        </div>
      )}

      {violations.length > 0 && (
        <div className="rounded-xl border border-clay/40 bg-clay/10 p-4 text-sm text-clay print:hidden">
          {violations.map((v) => v.message).join(" · ")}
        </div>
      )}

      {lastFreeze && (diff.moved || diff.newly || diff.unseated) ? (
        <p className="text-xs text-muted print:hidden">
          Since {lastFreeze.label}: {diff.newly} newly seated · {diff.moved} moved · {diff.unseated} unseated
          {diff.lines[0] ? ` — ${diff.lines[0]}` : ""}
        </p>
      ) : null}

      <form
        onSubmit={saveConstraint}
        className="flex flex-wrap items-end gap-2 rounded-2xl border border-line bg-surface p-4 print:hidden"
      >
        <p className="w-full kicker kicker-moss">Rules</p>
        <label className="text-sm">
          Kind
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as SeatConstraint["kind"])}
            className="mt-1 block rounded-lg border border-line px-2 py-2 text-sm"
          >
            <option value="never">Never together</option>
            <option value="must">Must sit together</option>
            <option value="lock">Lock to table</option>
          </select>
        </label>
        <label className="text-sm">
          Person
          <select
            value={pickA}
            onChange={(e) => setPickA(e.target.value)}
            className="mt-1 block max-w-[10rem] rounded-lg border border-line px-2 py-2 text-sm"
          >
            <option value="">—</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        {kind === "lock" ? (
          <label className="text-sm">
            Table
            <select
              value={lockTable}
              onChange={(e) => setLockTable(e.target.value)}
              className="mt-1 block rounded-lg border border-line px-2 py-2 text-sm"
            >
              <option value="">—</option>
              {tables.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="text-sm">
            With
            <select
              value={pickB}
              onChange={(e) => setPickB(e.target.value)}
              className="mt-1 block max-w-[10rem] rounded-lg border border-line px-2 py-2 text-sm"
            >
              <option value="">—</option>
              {guests
                .filter((g) => g.id !== pickA)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
            </select>
          </label>
        )}
        <button
          type="submit"
          disabled={busy || !pickA || (kind !== "lock" && !pickB) || (kind === "lock" && !lockTable)}
          className="min-h-11 rounded-full bg-moss px-4 text-sm text-ivory disabled:opacity-50"
        >
          Add rule
        </button>
        {constraints.length > 0 && (
          <ul className="w-full space-y-1 text-xs text-muted">
            {constraints.map((c) => (
              <li key={c.id} className="flex justify-between gap-2">
                <span>
                  {c.kind === "never" &&
                    `${guestById.get(c.a)?.name || "?"} never with ${guestById.get(c.b || "")?.name || "?"}`}
                  {c.kind === "must" &&
                    `${guestById.get(c.a)?.name || "?"} with ${guestById.get(c.b || "")?.name || "?"}`}
                  {c.kind === "lock" && `${guestById.get(c.a)?.name || "?"} locked to ${c.tableName}`}
                </span>
                <button type="button" className="underline" onClick={() => dropConstraint(c.id)}>
                  Drop
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {showChart && printMode === "board" && (
        <div className="print:break-inside-avoid">
          <SeatingChart tables={tables} guests={guests} />
        </div>
      )}

      <form
        onSubmit={addTable}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4 print:hidden"
      >
        <label className="text-sm">
          <span className="font-medium">New table</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Table 3"
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Seats</span>
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

      {error && <p className="text-xs text-rose-600 print:hidden">{error}</p>}

      {printMode === "escort" ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Escort list</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {escort.map((g) => (
              <li key={g.id} className="flex justify-between py-1.5">
                <span>{g.name}</span>
                <span className="text-slate-500">{g.tableLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : printMode === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
          {tables.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 bg-white p-4 print:break-inside-avoid"
            >
              <p className="text-lg font-semibold">{t.name}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {guests
                  .filter((g) => g.tableLabel === t.name)
                  .map((g) => (
                    <li key={g.id}>
                      {g.name}
                      {(g.plusOnes || 0) > 0 ? ` +${g.plusOnes}` : ""}
                      {g.dietary ? ` · ${g.dietary}` : ""}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 print:hidden">
            <p className="text-sm font-medium text-amber-900">Need a table</p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, party, diet…"
              className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm"
            />
            <ul className="mt-3 space-y-3">
              {houses.map((h) => (
                <li key={h.key}>
                  <button
                    type="button"
                    onClick={() => toggleHouse(h.members.map((m) => m.id))}
                    className="text-[11px] font-medium uppercase tracking-wide text-amber-800"
                  >
                    {h.key} · {h.weight} seat{h.weight === 1 ? "" : "s"}
                  </button>
                  <ul className="mt-1 space-y-1">
                    {h.members.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", g.id);
                            e.dataTransfer.setData("text/guest-id", g.id);
                          }}
                          onClick={() => toggle(g.id)}
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs ${
                            selected.includes(g.id)
                              ? "bg-slate-900 text-white"
                              : "bg-white text-amber-950"
                          }`}
                        >
                          <span>
                            {g.name}
                            {(g.plusOnes || 0) > 0 ? ` +${g.plusOnes}` : ""}
                            {g.dietary ? ` · ${g.dietary}` : ""}
                          </span>
                          {g.side && <span className="opacity-70">{g.side}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              {!houses.length && (
                <li className="text-xs text-amber-800">Everyone who is coming has a table.</li>
              )}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {tables.map((t) => {
              const at = guests.filter((g) => g.tableLabel === t.name);
              const fill = tableFill(t.name, guests);
              const over = fill > t.capacity;
              return (
                <div
                  key={t.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDropTable(t.name, e)}
                  onClick={() => {
                    if (selected.length) assign(selected, t.name);
                  }}
                  className={`rounded-xl border bg-white p-4 print:break-inside-avoid ${
                    over ? "border-rose-300" : "border-slate-200"
                  }`}
                >
                  {editing === t.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        saveTable(t.id);
                      }}
                      className="flex flex-wrap gap-2 print:hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-28 rounded border border-slate-300 px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        min={1}
                        value={editCap}
                        onChange={(e) => setEditCap(Number(e.target.value) || 1)}
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                      />
                      <button type="submit" className="text-xs underline">
                        Save
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className={`text-xs ${over ? "font-medium text-rose-600" : "text-slate-500"}`}>
                        {fill}/{t.capacity}
                        {over ? " over" : ""}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full ${over ? "bg-rose-500" : "bg-slate-800"}`}
                      style={{ width: `${Math.min(100, (fill / t.capacity) * 100)}%` }}
                    />
                  </div>
                  <ul className="mt-3 space-y-1">
                    {at.map((g) => (
                      <li
                        key={g.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.dataTransfer.setData("text/plain", g.id);
                          e.dataTransfer.setData("text/guest-id", g.id);
                        }}
                        className="flex items-center justify-between text-xs"
                      >
                        <span>
                          {g.name}
                          {(g.plusOnes || 0) > 0 ? ` +${g.plusOnes}` : ""}
                          {g.dietary ? ` · ${g.dietary}` : ""}
                        </span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={(e) => {
                            e.stopPropagation();
                            assign([g.id], null);
                          }}
                          className="text-slate-400 underline print:hidden"
                        >
                          Unseat
                        </button>
                      </li>
                    ))}
                    {at.length === 0 && <li className="text-xs text-slate-400">Drop people here</li>}
                  </ul>
                  <div className="mt-3 flex gap-2 print:hidden" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(t.id);
                        setEditName(t.name);
                        setEditCap(t.capacity);
                      }}
                      className="text-[11px] text-slate-500 underline"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTable(t.id)}
                      className="text-[11px] text-slate-400 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

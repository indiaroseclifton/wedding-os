"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { actionFor } from "@/lib/data/checklist-actions";

type Item = { id: string; phase: string; title: string; done: boolean; custom?: boolean };
type Phase = { id: string; label: string };

export default function ChecklistPage() {
  const params = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState("1");
  const [filter, setFilter] = useState("all");
  const [lane, setLane] = useState<"all" | "couple" | "party">("all");
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/checklist");
    if (res.ok) {
      const data = await res.json();
      setItems(data.checklist?.items || []);
      setPhases(data.phases || []);
    }
  }

  useEffect(() => {
    load();
    const l = params.get("lane");
    if (l === "party" || l === "couple") setLane(l);
  }, [params]);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.checklist?.items) setItems(data.checklist.items);
      return data;
    }
    return null;
  }

  const done = items.filter((i) => i.done).length;
  const visible = items.filter((i) => {
    if (filter !== "all" && i.phase !== filter) return false;
    if (lane === "all") return true;
    const a = actionFor(i.title);
    return (a?.lane || "couple") === lane;
  });

  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Checklist</h1>
          <p className="mt-1 text-sm text-muted">
            Check it off, or tap through to the room that actually does the work.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const data = await post({ action: "to_timeline" });
            if (data?.added != null) setNote(`Added ${data.added} open items to Timeline`);
          }}
          className="text-xs font-medium underline"
        >
          Add open items to Timeline
        </button>
      </div>

      <p className="text-xs text-muted">
        {done} of {items.length} done
      </p>
      {note && <p className="text-xs text-moss">{note}</p>}

      <div className="flex flex-wrap gap-2">
        {(["all", "couple", "party"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLane(l)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              lane === l ? "bg-moss text-ivory" : "border border-line bg-surface"
            }`}
          >
            {l === "all" ? "All" : l === "party" ? "Wedding party" : "Couple"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            filter === "all" ? "bg-ink text-ivory" : "border border-line bg-surface"
          }`}
        >
          All phases
        </button>
        {phases.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilter(p.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === p.id ? "bg-ink text-ivory" : "border border-line bg-surface"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add", title, phase });
          setTitle("");
        }}
        className="flex flex-wrap items-end gap-2 rounded-2xl border border-line bg-surface p-4"
      >
        <label className="text-sm">
          <span className="font-medium">Custom item</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Phase</span>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="mt-1 block rounded-lg border border-line px-3 py-2 text-sm"
          >
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          Add
        </button>
      </form>

      {(filter === "all" ? phases : phases.filter((p) => p.id === filter)).map((p) => {
        const group = visible.filter((i) => i.phase === p.id);
        if (!group.length && filter === "all") return null;
        return (
          <div key={p.id}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{p.label}</p>
            <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
              {group.map((item) => {
                const action = actionFor(item.title);
                return (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <label className="flex min-w-0 flex-1 items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => post({ action: "toggle", id: item.id, done: !item.done })}
                      />
                      <span className={item.done ? "text-muted line-through" : ""}>{item.title}</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {action && !item.done && (
                        <Link href={action.href} className="rounded-full bg-moss px-3 py-1 text-[11px] font-medium text-ivory">
                          {action.cta}
                        </Link>
                      )}
                      {item.custom && (
                        <button
                          type="button"
                          onClick={() => post({ action: "delete", id: item.id })}
                          className="text-xs text-muted underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
              {!group.length && (
                <li className="px-4 py-6 text-center text-sm text-muted">Nothing in this phase</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

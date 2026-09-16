"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { V2_ITEMS, type V2Group, type V2Item } from "@/lib/v2-board";

const KEY = "vowfolk-v2-notes";
type Notes = Record<string, string>;
const GROUPS: V2Group[] = ["Home", "Before", "People", "Studio", "The day", "After", "Money", "V2 add-ons"];

function loadNotes(): Notes {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Notes;
  } catch {
    return {};
  }
}

export default function V2BoardPage() {
  const [notes, setNotes] = useState<Notes>({});
  const [openId, setOpenId] = useState<string>("");
  const [filter, setFilter] = useState<V2Group | "All">("All");

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  function save(id: string, text: string) {
    const next = { ...notes, [id]: text };
    setNotes(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const noted = V2_ITEMS.filter((item) => (notes[item.id] || "").trim()).length;
  const blob = useMemo(() => JSON.stringify({ notes, savedAt: new Date().toISOString() }, null, 2), [notes]);
  const items = filter === "All" ? V2_ITEMS : V2_ITEMS.filter((i) => i.group === filter);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="kicker kicker-moss">V2 preview — not production</p>
        <h1 className="font-serif text-4xl">Every room</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Open a card. Leave what to change. Next chat: continue V2 — notes on [item].
        </p>
        <p className="mt-2 text-xs text-muted">
          {V2_ITEMS.length} rooms · {noted} with notes · first-cut means usable, not finished
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", ...GROUPS] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFilter(g)}
            className={`rounded-full px-3 py-1.5 text-xs ${
              filter === g ? "bg-ink text-ivory" : "border border-line"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {GROUPS.filter((g) => filter === "All" || filter === g).map((group) => (
        <section key={group} id={group === "V2 add-ons" ? "money-plan" : group}>
          <p className="mb-2 kicker kicker-moss">{group}</p>
          <ol className="space-y-3">
            {items
              .filter((item) => item.group === group)
              .map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  note={notes[item.id] || ""}
                  open={openId === item.id}
                  onOpen={() => setOpenId((cur) => (cur === item.id ? "" : item.id))}
                  onNote={(text) => save(item.id, text)}
                />
              ))}
          </ol>
        </section>
      ))}

      <section className="rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-[10px] uppercase tracking-wide text-muted">Copy notes for Grok</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs underline">Notes JSON</summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-paper p-3 text-[11px] leading-5">{blob}</pre>
        </details>
      </section>
    </div>
  );
}

function ItemCard({
  item,
  note,
  open,
  onOpen,
  onNote,
}: {
  item: V2Item;
  note: string;
  open: boolean;
  onOpen: () => void;
  onNote: (text: string) => void;
}) {
  return (
    <li id={item.id} className="rounded-2xl border border-line bg-surface px-4 py-4">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          {item.status.replace("-", " ")}
          {note.trim() ? " · note left" : ""}
        </p>
        <p className="text-sm font-medium">{item.title}</p>
      </button>
      <p className="mt-1 text-sm leading-6 text-muted">{item.why}</p>
      {open ? (
        <div className="mt-3 space-y-3 border-t border-line pt-3">
          <p className="text-sm leading-6">
            <span className="font-medium">Do this. </span>
            {item.doThis}
          </p>
          <p className="text-sm leading-6 text-muted">
            <span className="font-medium text-ink">Already there. </span>
            {item.wrap}
          </p>
          <Link href={item.href} className="inline-block text-xs underline">
            Open the room
          </Link>
          <label className="block text-sm">
            <span className="font-medium">Your notes</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => onNote(e.target.value)}
              placeholder="What to change, add, or fix…"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
        </div>
      ) : null}
    </li>
  );
}

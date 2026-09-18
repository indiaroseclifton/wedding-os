"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HowToButton } from "@/components/v2/HowToPop";
import { V2_ITEMS, type V2Item } from "@/lib/v2-board";

const KEY = "vowfolk-v2-notes";
type Notes = Record<string, string>;
const GROUPS = [
  "Home",
  "Before",
  "People",
  "Studio",
  "The day",
  "After",
  "Budget & Books",
  "Connect",
  "Not built yet",
  "Business",
] as const;
type BoardGroup = (typeof GROUPS)[number];

const ITEMS: V2Item[] = V2_ITEMS.map((item) => {
  const group = (item.group === "Money" ? "Budget & Books" : item.group) as V2Item["group"];
  if (item.id === "floor-print") {
    return {
      ...item,
      group,
      title: "Floor Planner",
      why: "Draw the room. Tables, stage, bar, dance floor.",
      doThis: "Build the plan here. Print opens Print Center.",
      wrap: "EditorShell on /floorplan",
      href: "/floorplan",
      status: "first-cut",
    };
  }
  if (item.id === "print-mass") {
    return {
      ...item,
      id: "print-center",
      group,
      title: "Print Center",
      why: "The press. Floor sheets, cards, signs.",
      doThis: "Open from Studio or press Print inside Floor Planner.",
      wrap: "/studio/print-center",
      href: "/studio/print-center",
      status: "first-cut",
    };
  }
  return { ...item, group };
});

function loadNotes(): Notes {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Notes;
  } catch {
    return {};
  }
}

function packNotes(notes: Notes) {
  const filled = ITEMS.filter((item) => (notes[item.id] || "").trim()).map((item) => ({
    id: item.id,
    group: item.group,
    title: item.title,
    href: item.href,
    note: (notes[item.id] || "").trim(),
  }));
  return {
    savedAt: new Date().toISOString(),
    count: filled.length,
    notes: filled,
  };
}

export default function V2BoardPage() {
  const [notes, setNotes] = useState<Notes>({});
  const [openId, setOpenId] = useState<string>("");
  const [filter, setFilter] = useState<BoardGroup | "All">("All");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  function save(id: string, text: string) {
    const next = { ...notes, [id]: text };
    setNotes(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const packed = useMemo(() => packNotes(notes), [notes]);
  const blob = useMemo(() => JSON.stringify(packed, null, 2), [packed]);
  const items = filter === "All" ? ITEMS : ITEMS.filter((i) => i.group === filter);

  async function copyAll() {
    await navigator.clipboard.writeText(blob);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker kicker-moss">V2 preview — not production</p>
          <h1 className="font-serif text-4xl">Every feature</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Built, first-cut, or not started — each card still takes notes. Copy once and paste in chat.
          </p>
          <p className="mt-2 text-xs text-muted">
            {ITEMS.length} cards · {packed.count} with notes
          </p>
        </div>
        <button type="button" onClick={copyAll} className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">
          {copied ? "Copied" : `Copy all notes (${packed.count})`}
        </button>
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
        <section key={group} id={group === "Business" ? "money-plan" : group}>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-wide text-muted">One paste for Grok</p>
          <button type="button" onClick={copyAll} className="text-xs underline">
            {copied ? "Copied" : "Copy all notes"}
          </button>
        </div>
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
      <p className="mt-2">
        <HowToButton id={item.id} />
      </p>
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
            Open
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

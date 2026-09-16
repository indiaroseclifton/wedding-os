"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { V2_ITEMS, type V2Item } from "@/lib/v2-board";

const KEY = "vowfolk-v2-notes";

type Notes = Record<string, string>;

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
  const [openId, setOpenId] = useState<string>(V2_ITEMS[0]?.id || "");

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  function save(id: string, text: string) {
    const next = { ...notes, [id]: text };
    setNotes(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const noted = useMemo(
    () => V2_ITEMS.filter((item) => (notes[item.id] || "").trim()).length,
    [notes],
  );

  const blob = useMemo(() => JSON.stringify({ notes, savedAt: new Date().toISOString() }, null, 2), [notes]);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="kicker kicker-moss">V2 preview — not production</p>
        <h1 className="font-serif text-4xl">V2 board</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Hers plus what we add. Leave a note on the item you are looking at. Next chat: continue V2 — I left notes on [item].
        </p>
        <p className="mt-2 text-xs text-muted">
          {V2_ITEMS.length} open items · {noted} with notes · main is untouched
        </p>
      </div>

      <ol className="space-y-3">
        {V2_ITEMS.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            note={notes[item.id] || ""}
            open={openId === item.id}
            onOpen={() => setOpenId(item.id)}
            onNote={(text) => save(item.id, text)}
          />
        ))}
      </ol>

      <section id="money" className="rounded-2xl border border-line bg-surface px-4 py-4">
        <p className="text-[10px] uppercase tracking-wide text-muted">How to talk to Grok</p>
        <p className="mt-1 text-sm leading-6">
          Look at the room. Type the note on that card. Then say <span className="font-medium">continue V2</span> and name the item.
        </p>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs underline">Copy notes JSON</summary>
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
    <li className="rounded-2xl border border-line bg-surface px-4 py-4">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <p className="text-[10px] uppercase tracking-wide text-muted">
          {item.rank}. {item.status.replace("-", " ")}
          {note.trim() ? " · you left a note" : ""}
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
            <span className="font-medium text-ink">Already solved. </span>
            {item.wrap}
          </p>
          <Link href={item.href} className="inline-block text-xs underline">
            Open the room
          </Link>
          <label className="block text-sm">
            <span className="font-medium">Note for Grok</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => onNote(e.target.value)}
              placeholder="What you want built, while you are looking at it…"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </label>
        </div>
      ) : null}
    </li>
  );
}

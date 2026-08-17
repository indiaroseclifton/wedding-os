"use client";

import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { motion, fadeUp, stagger } from "@/components/motion";

type NamePath = "unset" | "keep" | "hyphen" | "change";

type Item = {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  notes?: string;
  done: boolean;
};

const PATHS: { id: NamePath; title: string; line: string }[] = [
  { id: "keep", title: "Keep", line: "The names you have. Nothing to file." },
  { id: "hyphen", title: "Hyphen", line: "Same papers as a change. Both names stay." },
  { id: "change", title: "Change", line: "Social Security first. Then the rest follows." },
];

export default function LegalPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [countyState, setCountyState] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [namePath, setNamePath] = useState<NamePath>("unset");
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function apply(legal: {
    items?: Item[];
    countyState?: string;
    privateNotes?: string;
    namePath?: NamePath;
  }) {
    setItems(legal.items || []);
    if (legal.countyState != null) setCountyState(legal.countyState);
    if (legal.privateNotes != null) setPrivateNotes(legal.privateNotes);
    if (legal.namePath) setNamePath(legal.namePath);
  }

  async function load() {
    const res = await fetch("/api/legal");
    if (res.ok) apply((await res.json()).legal);
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch("/api/legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      if (data.legal) apply(data.legal);
      return data;
    }
    return null;
  }

  const license = items.filter((i) => i.category === "License" || i.category === "Private" || i.category === "Other");
  const names = items.filter((i) => i.category === "Name change");
  const showNames = namePath === "hyphen" || namePath === "change";
  const nameOpen = names.filter((i) => !i.done).length;
  const licenseOpen = license.filter((i) => !i.done).length;

  return (
    <div className="space-y-10">
      <RoomSubnav room="planning" />

      <header className="max-w-2xl">
        <p className="kicker kicker-moss">After the papers</p>
        <h1 className="mt-3 font-serif text-[clamp(2.4rem,7vw,4rem)] leading-none tracking-tight text-balance">
          Names
        </h1>
        <p className="deck mt-4 max-w-xl text-pretty">
          Keep, hyphen, or change. The rest of the desk stays quiet until you pick.
        </p>
      </header>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:grid-cols-3"
      >
        {PATHS.map((p) => {
          const on = namePath === p.id;
          return (
            <motion.button
              key={p.id}
              type="button"
              variants={fadeUp}
              disabled={busy}
              onClick={() => post({ action: "path", namePath: p.id })}
              className={`min-h-28 rounded-[1.6rem] p-5 text-left transition-[background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.96] ${
                on ? "bg-moss text-moss-fg" : "glass-panel hover:bg-surface"
              }`}
            >
              <p className="font-serif text-3xl leading-none tracking-tight">{p.title}</p>
              <p className={`mt-3 text-sm text-pretty ${on ? "text-moss-fg/80" : "text-muted"}`}>{p.line}</p>
            </motion.button>
          );
        })}
      </motion.div>

      {namePath === "keep" && (
        <p className="max-w-xl text-pretty text-sm text-ink-soft">
          You keep the names you have. No Social Security, no DMV, no bank line. License still matters.
        </p>
      )}

      {showNames && (
        <section className="space-y-4">
          <div>
            <p className="kicker kicker-moss">{namePath === "hyphen" ? "Hyphen" : "Change"}</p>
            <h2 className="mt-1 font-serif text-3xl tracking-tight text-balance">The papers, in order</h2>
            <p className="mt-2 text-sm text-muted text-pretty">
              {nameOpen} left. Social Security first — everything else wants that card.
            </p>
          </div>
          <ol className="space-y-2">
            {names.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => post({ action: "toggle", id: item.id, done: !item.done })}
                  className={`flex min-h-14 w-full items-start gap-4 rounded-2xl px-4 py-3 text-left transition-colors duration-150 ${
                    item.done ? "opacity-50" : "bg-surface"
                  }`}
                >
                  <span className="mt-1 w-6 font-serif text-xl tabular-nums text-muted">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block font-serif text-2xl leading-tight ${item.done ? "line-through" : ""}`}>
                      {item.title}
                    </span>
                    {item.notes ? <span className="mt-1 block text-sm text-muted text-pretty">{item.notes}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-4">
          <div>
            <p className="kicker">License</p>
            <h2 className="mt-1 font-serif text-3xl tracking-tight">The county still has a clock</h2>
          </div>
          <ul className="divide-y divide-line">
            {license.map((item) => (
              <li key={item.id} className="flex min-h-14 items-center justify-between gap-3 py-3">
                <div>
                  <p className={`font-serif text-xl leading-tight ${item.done ? "text-muted line-through" : ""}`}>
                    {item.title}
                  </p>
                  {item.dueDate ? <p className="text-xs text-muted">{item.dueDate}</p> : null}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => post({ action: "toggle", id: item.id, done: !item.done })}
                  className="btn btn-ghost shrink-0"
                >
                  {item.done ? "Undo" : "Done"}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await post({ action: "meta", countyState, privateNotes });
              setNote("Saved");
            }}
            className="glass-panel space-y-4 rounded-[1.6rem] p-5"
          >
            <label className="block">
              <span className="kicker">County / state</span>
              <input
                value={countyState}
                onChange={(e) => setCountyState(e.target.value)}
                className="field mt-2"
                placeholder="Fulton County, GA"
              />
            </label>
            <label className="block">
              <span className="kicker">Private notes</span>
              <input
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                className="field mt-2"
              />
            </label>
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>
              Save
            </button>
            {note ? <p className="text-xs text-moss">{note}</p> : null}
          </form>
          <p className="text-xs tabular-nums text-muted">
            {licenseOpen} license open
            {showNames ? ` · ${nameOpen} name papers` : ""}
          </p>
        </aside>
      </section>
    </div>
  );
}

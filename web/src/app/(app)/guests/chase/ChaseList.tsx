"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PLUS_SCRIPTS } from "@/lib/plus-scripts";

type Row = {
  id: string;
  name: string;
  rsvp: string;
  email?: string;
  meal?: string;
  plusPolicy?: string;
  showed?: boolean;
  missingAddress: boolean;
  silentYes: boolean;
};

export function ChaseList({ guests, after }: { guests: Row[]; after: boolean }) {
  const [tab, setTab] = useState<"wait" | "incomplete" | "show">("wait");
  const [copied, setCopied] = useState<string | null>(null);
  const [rows, setRows] = useState(guests);

  const visible = useMemo(() => {
    if (tab === "wait") return rows.filter((g) => ["UNKNOWN", "INVITED", "MAYBE"].includes(g.rsvp));
    if (tab === "incomplete") return rows.filter((g) => g.rsvp === "YES" && (g.missingAddress || !g.meal || g.silentYes));
    return rows.filter((g) => g.rsvp === "YES");
  }, [rows, tab]);

  async function markShow(id: string, showed: boolean) {
    const res = await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showed }),
    });
    if (res.ok) setRows((prev) => prev.map((g) => (g.id === id ? { ...g, showed } : g)));
  }

  function copy(body: string, name: string) {
    const text = body.replace("[name]", name);
    void navigator.clipboard.writeText(text);
    setCopied(text.slice(0, 40));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["wait", "Waiting"],
            ["incomplete", "Incomplete yes"],
            ["show", after ? "Showed up" : "Said yes"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`min-h-10 rounded-full px-4 text-sm ${tab === id ? "bg-moss text-moss-fg" : "border border-line"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="panel p-4">
        <p className="kicker">A line you can send</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PLUS_SCRIPTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => copy(s.body, "there")}
              className="min-h-10 rounded-full border border-line px-3 text-xs"
            >
              {s.title}
            </button>
          ))}
        </div>
        {copied ? <p className="mt-2 text-xs text-muted">Copied. Paste it into a text.</p> : null}
      </div>

      <ul className="divide-y divide-line rounded-[1.4rem] border border-line bg-surface">
        {visible.map((g) => (
          <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <Link href={`/guests/${g.id}`} className="font-medium">
                {g.name}
              </Link>
              <p className="text-xs text-muted">
                {g.rsvp}
                {g.missingAddress ? " · no address" : ""}
                {!g.meal && g.rsvp === "YES" ? " · no meal" : ""}
                {g.plusPolicy === "none" ? " · no plus-one" : ""}
                {g.silentYes ? " · yes with no reply date" : ""}
              </p>
            </div>
            {after && tab === "show" ? (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => markShow(g.id, true)}
                  className={`min-h-9 rounded-full px-3 text-xs ${g.showed === true ? "bg-moss text-moss-fg" : "border border-line"}`}
                >
                  Showed
                </button>
                <button
                  type="button"
                  onClick={() => markShow(g.id, false)}
                  className={`min-h-9 rounded-full px-3 text-xs ${g.showed === false ? "bg-moss text-moss-fg" : "border border-line"}`}
                >
                  No-show
                </button>
              </div>
            ) : (
              <Link href={`/guests/${g.id}`} className="text-xs underline">
                Open
              </Link>
            )}
          </li>
        ))}
      </ul>
      {!visible.length ? <p className="text-sm text-muted">This pile is empty.</p> : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { GUT_LABEL, GUT_MARKS, type GutMark } from "@/lib/vendor-gut";

export function VendorGut({
  vendorId,
  mark,
  note,
  onSaved,
}: {
  vendorId: string;
  mark?: GutMark;
  note?: string;
  onSaved?: (next: { gutMark?: GutMark; gutNote?: string }) => void;
}) {
  const [current, setCurrent] = useState<GutMark | undefined>(mark);
  const [why, setWhy] = useState(note || "");
  const [busy, setBusy] = useState(false);

  async function save(next: Partial<{ gutMark: GutMark | ""; gutNote: string }>) {
    setBusy(true);
    const res = await fetch(`/api/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setBusy(false);
    if (!res.ok) return;
    const markNext = next.gutMark === "" ? undefined : (next.gutMark ?? current);
    if (next.gutMark !== undefined) setCurrent(markNext);
    if (next.gutNote !== undefined) setWhy(next.gutNote);
    onSaved?.({ gutMark: markNext, gutNote: next.gutNote ?? why });
  }

  return (
    <div className="space-y-2" onClick={(e) => e.preventDefault()}>
      <div className="flex flex-wrap gap-1.5">
        {GUT_MARKS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={busy}
            onClick={() => save({ gutMark: current === m ? "" : m })}
            className={`min-h-9 rounded-full px-3 text-xs ${
              current === m ? "bg-moss text-moss-fg" : "border border-line bg-surface"
            }`}
          >
            {GUT_LABEL[m]}
          </button>
        ))}
      </div>
      {current ? (
        <input
          value={why}
          disabled={busy}
          onChange={(e) => setWhy(e.target.value)}
          onBlur={() => {
            if (why !== (note || "")) save({ gutNote: why });
          }}
          placeholder={
            current === "yes"
              ? "Why we’d hire them"
              : current === "no"
                ? "So we don’t write again"
                : "What’s holding us"
          }
          className="field text-sm"
        />
      ) : null}
    </div>
  );
}

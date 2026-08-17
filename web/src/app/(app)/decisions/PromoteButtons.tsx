"use client";

import { useState } from "react";

export function PromoteButtons({ decisionId }: { decisionId: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function promote(opts: { createTask?: boolean; createTimeline?: boolean }) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/decisions/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId, ...opts }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const parts: string[] = [];
      if (data.task) parts.push("task");
      if (data.timelineItem) parts.push("timeline");
      setMsg(parts.length ? `Added ${parts.join(" + ")}` : "Done");
    } catch {
      setMsg("Could not promote");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => promote({ createTask: true, createTimeline: true })}
        className="text-xs font-medium underline disabled:opacity-50"
      >
        → Task + timeline
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => promote({ createTask: true, createTimeline: false })}
        className="text-xs font-medium text-muted underline disabled:opacity-50"
      >
        Task only
      </button>
      {msg && <span className="text-xs text-emerald-700">{msg}</span>}
    </div>
  );
}

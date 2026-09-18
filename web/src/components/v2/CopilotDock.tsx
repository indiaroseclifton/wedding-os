"use client";

import { useState } from "react";

export function CopilotDock() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [log, setLog] = useState<string[]>([]);

  function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLog((rows) => [
      ...rows,
      `You: ${q}`,
      "Copilot: Noted. This shell will write tasks into This week once the character and tokens are named. It will not replace the week list.",
    ]);
    setQ("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-40 rounded-full bg-ink px-4 py-2 text-xs text-ivory print:hidden lg:bottom-6"
      >
        Copilot
      </button>
      {open ? (
        <div className="fixed bottom-32 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-paper p-4 shadow-lg print:hidden lg:bottom-16">
          <p className="text-[10px] uppercase tracking-wide text-muted">Token add-on · unnamed</p>
          <p className="mt-1 font-serif text-xl">Ask, then it writes a task</p>
          <div className="mt-3 max-h-40 space-y-2 overflow-y-auto text-sm">
            {log.length ? log.map((line, i) => <p key={i}>{line}</p>) : <p className="text-muted">Character and name later.</p>}
          </div>
          <form onSubmit={ask} className="mt-3 flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm" placeholder="What should we do this week?" />
            <button type="submit" className="rounded-lg bg-ink px-3 text-xs text-ivory">
              Ask
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

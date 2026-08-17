"use client";

import { useState } from "react";
import type { SpeechRow } from "@/lib/data/speech-store";

export function SpeechDesk({ initial }: { initial: SpeechRow }) {
  const [row, setRow] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(next: SpeechRow) {
    setRow(next);
    const res = await fetch("/api/speeches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setMsg(res.ok ? "Saved" : "Could not save");
  }

  return (
    <form
      className="mt-6 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        save(row);
      }}
    >
      <label className="block text-sm">
        Role
        <input
          value={row.role}
          onChange={(e) => setRow({ ...row, role: e.target.value })}
          className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3"
        />
      </label>
      <label className="block text-sm">
        Status
        <select
          value={row.status}
          onChange={(e) => setRow({ ...row, status: e.target.value as SpeechRow["status"] })}
          className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3"
        >
          <option value="not_started">Not started</option>
          <option value="drafting">Drafting</option>
          <option value="ready">Ready</option>
        </select>
      </label>
      <label className="block text-sm">
        Due
        <input
          type="date"
          value={row.due || ""}
          onChange={(e) => setRow({ ...row, due: e.target.value })}
          className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3"
        />
      </label>
      <label className="block text-sm">
        Draft (only you see this)
        <textarea
          value={row.notes || ""}
          onChange={(e) => setRow({ ...row, notes: e.target.value })}
          rows={8}
          className="mt-1 block w-full rounded-xl border border-line px-3 py-2"
          placeholder="Keep it under four minutes. One story. One toast."
        />
      </label>
      <button type="submit" className="min-h-11 rounded-full bg-moss px-4 text-sm text-moss-fg">
        Save
      </button>
      {msg && (
        <p role="status" className="text-xs text-moss">
          {msg}
        </p>
      )}
    </form>
  );
}

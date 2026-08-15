"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPollPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description") || undefined,
          optionsText: form.get("optionsText"),
          mode: form.get("mode"),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not create poll");
      }
      const data = await res.json();
      router.push(`/polls/${data.poll.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create poll");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New poll</h1>
        <p className="mt-1 text-sm text-slate-600">
          Single choice or ranked preference (Borda-style points).
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="font-medium">Question</span>
          <input name="title" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="First dance song?" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Mode</span>
          <select name="mode" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="SINGLE">Single choice</option>
            <option value="RANKED">Ranked preference</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Options (one per line)</span>
          <textarea name="optionsText" required rows={5} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={"Option A\nOption B\nOption C"} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Notes (optional)</span>
          <input name="description" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {loading ? "Creating…" : "Create poll"}
        </button>
      </form>
    </div>
  );
}

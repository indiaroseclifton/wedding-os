"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTaskPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description") || undefined,
          ownerId: form.get("ownerId") || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save task");
      }
      router.push("/tasks");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save task");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add task</h1>
        <p className="mt-1 text-sm text-slate-600">Assign work so nothing lives only in a spreadsheet.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Title</span>
          <input name="title" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Description</span>
          <textarea name="description" rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Owner</span>
          <select name="ownerId" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="user_alex">Alex Rivera</option>
            <option value="user_jordan">Jordan Lee</option>
          </select>
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save task"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Poll = {
  id: string;
  title: string;
  description?: string;
  status: string;
  options: { id: string; label: string }[];
  votes: Record<string, string>;
};

export default function PollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/polls/${id}`);
    if (!res.ok) {
      setError("Not found");
      return;
    }
    const data = await res.json();
    setPoll(data.poll);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function vote(optionId: string) {
    const res = await fetch(`/api/polls/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "vote", optionId }),
    });
    if (res.ok) {
      const data = await res.json();
      setPoll(data.poll);
    }
  }

  async function close() {
    const res = await fetch(`/api/polls/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close" }),
    });
    if (res.ok) {
      const data = await res.json();
      setPoll(data.poll);
    }
  }

  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!poll) return <p className="text-sm text-slate-600">Loading…</p>;

  const counts: Record<string, number> = {};
  for (const opt of poll.options) counts[opt.id] = 0;
  for (const optId of Object.values(poll.votes || {})) {
    counts[optId] = (counts[optId] || 0) + 1;
  }
  const total = Object.keys(poll.votes || {}).length;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{poll.title}</h1>
        {poll.description && <p className="mt-1 text-sm text-slate-600">{poll.description}</p>}
        <p className="mt-2 text-xs text-slate-500">
          {poll.status} · {total} vote{total === 1 ? "" : "s"}
        </p>
      </div>

      <ul className="space-y-2">
        {poll.options.map((o) => {
          const n = counts[o.id] || 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <li key={o.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{o.label}</span>
                <span className="text-xs text-slate-500">
                  {n} ({pct}%)
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
              </div>
              {poll.status === "OPEN" && (
                <button
                  type="button"
                  onClick={() => vote(o.id)}
                  className="mt-2 text-xs font-medium underline"
                >
                  Vote for this
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {poll.status === "OPEN" && (
        <button
          type="button"
          onClick={close}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
        >
          Close poll
        </button>
      )}
    </div>
  );
}

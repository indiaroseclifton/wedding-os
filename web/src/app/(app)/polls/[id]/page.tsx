"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Poll = {
  id: string;
  title: string;
  description?: string;
  status: string;
  mode: "SINGLE" | "RANKED";
  options: { id: string; label: string }[];
  votes: Record<string, string | string[]>;
};

export default function PollDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [rankedTally, setRankedTally] = useState<{ optionId: string; points: number }[] | null>(null);
  const [ranking, setRanking] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/polls/${id}`);
    if (!res.ok) {
      setError("Not found");
      return;
    }
    const data = await res.json();
    setPoll(data.poll);
    setRankedTally(data.rankedTally || null);
    if (data.poll?.mode === "RANKED" && ranking.length === 0) {
      setRanking(data.poll.options.map((o: { id: string }) => o.id));
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  function move(optionId: string, dir: -1 | 1) {
    setRanking((prev) => {
      const i = prev.indexOf(optionId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function voteSingle(optionId: string) {
    const res = await fetch(`/api/polls/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "vote", optionId }),
    });
    if (res.ok) {
      const data = await res.json();
      setPoll(data.poll);
      setRankedTally(data.rankedTally || null);
    }
  }

  async function voteRanked() {
    const res = await fetch(`/api/polls/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "vote", ranking }),
    });
    if (res.ok) {
      const data = await res.json();
      setPoll(data.poll);
      setRankedTally(data.rankedTally || null);
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

  const totalVoters = Object.keys(poll.votes || {}).length;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{poll.title}</h1>
        {poll.description && <p className="mt-1 text-sm text-slate-600">{poll.description}</p>}
        <p className="mt-2 text-xs text-slate-500">
          {poll.mode === "RANKED" ? "Ranked" : "Single"} · {poll.status} · {totalVoters} vote
          {totalVoters === 1 ? "" : "s"}
        </p>
      </div>

      {poll.mode === "SINGLE" ? (
        <ul className="space-y-2">
          {poll.options.map((o) => {
            const n = Object.values(poll.votes).filter((v) => v === o.id).length;
            const pct = totalVoters ? Math.round((n / totalVoters) * 100) : 0;
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
                  <button type="button" onClick={() => voteSingle(o.id)} className="mt-2 text-xs font-medium underline">
                    Vote for this
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="space-y-4">
          {poll.status === "OPEN" && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Your ranking (1 = favorite)
              </p>
              <ul className="mt-3 space-y-2">
                {ranking.map((optionId, index) => {
                  const opt = poll.options.find((o) => o.id === optionId);
                  return (
                    <li key={optionId} className="flex items-center gap-2 text-sm">
                      <span className="w-5 text-xs text-slate-400">{index + 1}</span>
                      <span className="flex-1">{opt?.label}</span>
                      <button type="button" onClick={() => move(optionId, -1)} className="text-xs">↑</button>
                      <button type="button" onClick={() => move(optionId, 1)} className="text-xs">↓</button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={voteRanked}
                className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              >
                Submit ranking
              </button>
            </div>
          )}
          {rankedTally && (
            <ul className="space-y-2">
              {rankedTally.map((row) => {
                const opt = poll.options.find((o) => o.id === row.optionId);
                const max = rankedTally[0]?.points || 1;
                const pct = Math.round((row.points / max) * 100);
                return (
                  <li key={row.optionId} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{opt?.label}</span>
                      <span className="text-xs text-slate-500">{row.points} pts</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {poll.status === "OPEN" && (
        <button type="button" onClick={close} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium">
          Close poll
        </button>
      )}
    </div>
  );
}

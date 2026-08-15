"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Result = { type: string; title: string; href: string; meta?: string };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.results || []))
        .catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-slate-600">Guests, tasks, and vendors.</p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type at least 2 characters…"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
        autoFocus
      />
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {results.map((r, i) => (
          <li key={`${r.href}-${i}`}>
            <Link href={r.href} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-slate-500">
                  {r.type}
                  {r.meta ? ` · ${r.meta}` : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
        {q.trim().length >= 2 && !results.length && (
          <li className="px-4 py-8 text-center text-sm text-slate-500">No matches</li>
        )}
      </ul>
    </div>
  );
}

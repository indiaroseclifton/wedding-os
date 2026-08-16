"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Project = {
  id: string;
  playbookSlug: string;
  title: string;
  status: string;
  tables: number;
  guests: number;
  shopping: { bought: boolean }[];
};

type Book = { slug: string; title: string; summary: string };

export default function DiyHubPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  async function load() {
    const res = await fetch("/api/diy");
    if (res.ok) {
      const data = await res.json();
      setBooks(
        (data.playbooks || []).map((p: Book) => ({
          slug: p.slug,
          title: p.title,
          summary: p.summary,
        }))
      );
      setProjects(data.diy?.projects || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">DIY studio</h1>
        <p className="mt-1 text-sm text-slate-600">
          Playbooks for couples who make it themselves — flowers, tables, signs, light.
          Compare sources, get a shopping list, skip the 40-tab YouTube spiral.
        </p>
      </div>

      {projects.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Your projects</p>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {projects.map((p) => {
              const bought = p.shopping.filter((s) => s.bought).length;
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.status} · {p.tables} tables · {p.guests} guests · {bought}/{p.shopping.length} bought
                    </p>
                  </div>
                  <Link href={`/diy/${p.playbookSlug}`} className="text-xs font-medium underline">
                    Open
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {books.map((b) => (
          <Link
            key={b.slug}
            href={`/diy/${b.slug}`}
            className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
          >
            <p className="text-sm font-semibold">{b.title}</p>
            <p className="mt-1 text-xs text-slate-600">{b.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

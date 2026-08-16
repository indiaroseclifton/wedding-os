"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Task = { day: string; what: string; slug: string; title: string };

export default function DiyCalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("/api/diy")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const committed = (data.diy?.projects || []).filter(
          (p: { status: string }) => p.status === "committed"
        );
        const books = data.playbooks || [];
        const rows: Task[] = [];
        for (const p of committed) {
          const book = books.find((b: { slug: string }) => b.slug === p.playbookSlug);
          for (const t of book?.weekTasks || []) {
            rows.push({ day: t.day, what: t.what, slug: p.playbookSlug, title: p.title });
          }
        }
        setTasks(rows);
      });
  }, []);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/diy" className="text-xs underline">
          DIY
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Week-of calendar</h1>
        <p className="mt-1 text-sm text-slate-600">
          From committed playbooks. Commit a project to drop its shopping days here.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {days.map((d) => (
          <div key={d} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{d}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {tasks
                .filter((t) => t.day === d)
                .map((t) => (
                  <li key={t.slug + t.what}>
                    <Link href={`/diy/${t.slug}`} className="underline">
                      {t.title}
                    </Link>
                    <span className="text-slate-600"> — {t.what}</span>
                  </li>
                ))}
              {!tasks.some((t) => t.day === d) && (
                <li className="text-xs text-slate-400">—</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

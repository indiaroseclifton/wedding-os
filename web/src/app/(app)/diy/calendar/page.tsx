"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Task = { day: string; what: string; slug: string; title: string };

function weekAround(date?: string) {
  const wedding = date ? new Date(`${date}T00:00:00`) : new Date();
  if (Number.isNaN(wedding.getTime())) return [];
  const friday = new Date(wedding);
  const dow = friday.getDay();
  const back = dow === 0 ? 2 : dow === 6 ? 1 : dow + 2;
  friday.setDate(friday.getDate() - back);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(friday);
    d.setDate(friday.getDate() + i);
    days.push({
      key: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"][i] || d.toLocaleDateString(undefined, { weekday: "short" }),
      label: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      iso: d.toISOString().slice(0, 10),
    });
  }
  // Map playbook weekdays onto Fri–Thu of wedding week
  return days;
}

const DAY_MAP: Record<string, number> = { Fri: 0, Sat: 1, Sun: 2, Mon: 3, Tue: 4, Wed: 5, Thu: 6 };

export default function DiyCalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState<string | undefined>();

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
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.meta?.weddingDate) setDate(d.meta.weddingDate);
      })
      .catch(() => {});
  }, []);

  const days = useMemo(() => weekAround(date), [date]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/diy" className="text-xs underline">
          DIY
        </Link>
        <h1 className="mt-2 font-serif text-4xl">Week-of</h1>
        <p className="mt-1 text-sm text-muted">
          Friday through Thursday of the wedding week. Commit a playbook to drop the work here.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {days.map((d) => (
          <div key={d.iso} className="rounded-xl border border-line bg-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-moss">{d.label}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {tasks
                .filter((t) => DAY_MAP[t.day] === days.findIndex((x) => x.iso === d.iso) || t.day === d.key)
                .map((t) => (
                  <li key={t.slug + t.what}>
                    <Link href={`/diy/${t.slug}`} className="underline">
                      {t.title}
                    </Link>
                    <span className="text-muted"> — {t.what}</span>
                  </li>
                ))}
              {!tasks.filter((t) => DAY_MAP[t.day] === days.findIndex((x) => x.iso === d.iso) || t.day === d.key)
                .length && <li className="text-xs text-muted">—</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

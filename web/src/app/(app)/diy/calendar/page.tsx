"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

type Task = { day: string; what: string; href: string; title: string; source: "Studio" | "DIY" };

function buildWindow(date?: string) {
  if (!date) return [];
  const wedding = new Date(`${date}T00:00:00`);
  if (Number.isNaN(wedding.getTime())) return [];
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(wedding);
    day.setDate(wedding.getDate() + index - 3);
    return {
      key: day.toLocaleDateString("en-US", { weekday: "short" }),
      label: day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      iso: day.toISOString().slice(0, 10),
      wedding: index === 3,
    };
  });
}

function isOnDay(task: Task, key: string) {
  return task.day.trim().toLowerCase().startsWith(key.toLowerCase());
}

export default function DiyCalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState<string | undefined>();

  useEffect(() => {
    Promise.all([
      fetch("/api/diy").then((response) => response.ok ? response.json() : null),
      fetch("/api/studio/projects").then((response) => response.ok ? response.json() : null),
      fetch("/api/workspace").then((response) => response.ok ? response.json() : null),
    ]).then(([diyData, studioData, workspaceData]) => {
      const rows: Task[] = [];
      const committed = (diyData?.diy?.projects || []).filter((project: { status: string }) => project.status === "committed");
      for (const project of committed) {
        const book = (diyData?.playbooks || []).find((playbook: { slug: string }) => playbook.slug === project.playbookSlug);
        for (const task of book?.weekTasks || []) rows.push({ day: task.day, what: task.what, href: `/diy/${project.playbookSlug}`, title: project.title, source: "DIY" });
      }
      for (const project of studioData?.studio?.projects || []) {
        for (const step of project.steps || []) {
          if (!/^(mon|tue|wed|thu|fri|sat|sun)/i.test(step.when || "")) continue;
          rows.push({
            day: step.when,
            what: step.what,
            href: project.kind === "floral" ? "/diy/studio/floral" : project.kind === "table" ? "/diy/studio/table" : "/studio",
            title: project.title,
            source: "Studio",
          });
        }
      }
      setTasks(rows);
      if (workspaceData?.meta?.weddingDate) setDate(workspaceData.meta.weddingDate);
    }).catch(() => {});
  }, []);

  const days = useMemo(() => buildWindow(date), [date]);
  const earlier = tasks.filter((task) => !days.some((day) => isOnDay(task, day.key)));

  return (
    <div className="space-y-8">
      <RoomSubnav room="studio" />
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
        <div>
          <p className="kicker kicker-moss">Studio · build week</p>
          <h1 className="mt-2 font-serif text-[clamp(2.6rem,7vw,4.6rem)] leading-none tracking-tight">One date. Every build.</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-soft">The window is calculated from the wedding date. Studio steps and committed DIY playbooks land here automatically.</p>
        </div>
        <Link href="/studio" className="btn btn-primary">Studio projects</Link>
      </header>

      {!date ? (
        <div className="rounded-[1.5rem] border border-dashed border-line bg-surface p-8 text-center">
          <p className="font-serif text-3xl">Set the wedding date first</p>
          <p className="mt-2 text-sm text-muted">Build week will never guess or reuse an old date.</p>
          <Link href="/settings" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm text-ivory">Set the date</Link>
        </div>
      ) : (
        <section aria-labelledby="week-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="week-heading" className="font-serif text-3xl">Wedding week</h2>
            <p className="text-sm text-muted">Wedding date · {date}</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {days.map((day) => {
              const rows = tasks.filter((task) => isOnDay(task, day.key));
              return (
                <article key={day.iso} className={`rounded-[1.4rem] border p-4 ${day.wedding ? "border-ink bg-ink text-ivory" : "border-line bg-surface"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${day.wedding ? "text-champagne" : "text-moss"}`}>{day.label}</p>
                    {day.wedding ? <span className="text-xs text-white/70">Wedding</span> : null}
                  </div>
                  {rows.length ? (
                    <ul className={`mt-4 divide-y ${day.wedding ? "divide-white/20" : "divide-line"}`}>
                      {rows.map((task, index) => (
                        <li key={`${task.href}-${task.what}-${index}`} className="py-3">
                          <p className={`text-xs uppercase tracking-wide ${day.wedding ? "text-white/60" : "text-muted"}`}>{task.source}</p>
                          <Link href={task.href} className="mt-1 block font-medium underline-offset-4 hover:underline">{task.title}</Link>
                          <p className={`mt-1 text-sm ${day.wedding ? "text-white/75" : "text-muted"}`}>{task.what}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className={`mt-5 text-sm ${day.wedding ? "text-white/65" : "text-muted"}`}>No build assigned.</p>}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {earlier.length ? (
        <section className="rounded-[1.5rem] border border-line bg-surface p-5">
          <p className="kicker">Earlier prep</p>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {earlier.map((task, index) => <li key={`${task.href}-earlier-${index}`} className="rounded-xl bg-paper p-4"><p className="text-xs text-muted">{task.day}</p><Link href={task.href} className="mt-1 block font-medium">{task.title}</Link><p className="mt-1 text-sm text-muted">{task.what}</p></li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}


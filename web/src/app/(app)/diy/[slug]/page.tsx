"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { diyPhoto } from "@/lib/brand";

type Source = {
  id: string;
  name: string;
  cost: string;
  effort: string;
  lead: string;
  bestFor: string;
  watch: string;
};
type Recipe = { id: string; name: string; forWhat: string; pieces: string[] };
type Playbook = {
  slug: string;
  title: string;
  summary: string;
  whenDiy: string;
  whenHire: string;
  timeline: { when: string; what: string }[];
  recipes: Recipe[];
  sources: Source[];
  pitfalls: string[];
  steps?: { title: string; detail: string }[];
  weekTasks?: { day: string; what: string }[];
};
type Shop = { id: string; label: string; qty: number; unit: string; bought: boolean; estEach?: number; note?: string };
type Project = {
  id: string;
  playbookSlug: string;
  title: string;
  status: "exploring" | "committed" | "done";
  tables: number;
  guests: number;
  chosenSourceId?: string;
  notes?: string;
  shopping: Shop[];
};

const COST: Record<string, string> = { low: "$", mid: "$$", high: "$$$" };

export default function DiyPlaybookPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [book, setBook] = useState<Playbook | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tables, setTables] = useState(10);
  const [guests, setGuests] = useState(80);
  const [missing, setMissing] = useState(false);

  async function load() {
    const res = await fetch("/api/diy");
    if (!res.ok) return;
    const data = await res.json();
    const found = (data.playbooks || []).find((p: Playbook) => p.slug === slug);
    if (!found) {
      setMissing(true);
      return;
    }
    setBook(found);
    const mine = (data.diy?.projects || []).find((p: Project) => p.playbookSlug === slug) || null;
    setProject(mine);
    if (mine) {
      setTables(mine.tables);
      setGuests(mine.guests);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/diy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      const mine = (data.diy?.projects || []).find((p: Project) => p.playbookSlug === slug) || null;
      setProject(mine);
    }
  }

  if (missing) {
    return (
      <p className="text-sm text-slate-600">
        Unknown playbook. <Link href="/diy" className="underline">Back to DIY</Link>
      </p>
    );
  }
  if (!book) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl">
        <div className="relative h-36 sm:h-48">
          <img src={diyPhoto(book.slug)} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <Link href="/diy" className="text-[11px] font-medium text-moss-fg/80 underline">
              All DIY
            </Link>
            <h1 className="mt-1 font-serif text-3xl tracking-tight text-moss-fg">{book.title}</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-soft">{book.summary}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium">DIY this if</p>
          <p className="mt-1 text-slate-600">{book.whenDiy}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium">Hire it if</p>
          <p className="mt-1 text-slate-600">{book.whenHire}</p>
        </div>
      </div>

      {book.steps && book.steps.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold">How it looks</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {book.steps.map((s, i) => (
              <li key={s.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex h-16 items-center justify-center rounded-lg bg-slate-100">
                  <span className="text-2xl text-slate-400">{i + 1}</span>
                </div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="mt-1 text-xs text-slate-600">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {book.weekTasks && book.weekTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold">Week-of</h2>
          <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {book.weekTasks.map((t) => (
              <li key={t.day + t.what} className="flex gap-3 px-4 py-2 text-sm">
                <span className="w-10 font-medium text-slate-500">{t.day}</span>
                <span>{t.what}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (project) {
            await post({ action: "recalc", id: project.id, tables, guests });
          } else {
            await post({ action: "start", slug: book.slug, tables, guests });
          }
        }}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="font-medium">Tables</span>
          <input
            type="number"
            min={1}
            value={tables}
            onChange={(e) => setTables(Number(e.target.value) || 1)}
            className="mt-1 block w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Guests</span>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value) || 1)}
            className="mt-1 block w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          {project ? "Update list" : "Start this project"}
        </button>
      </form>

      {project && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Shopping list</p>
            <select
              value={project.status}
              onChange={(e) => post({ action: "status", id: project.id, status: e.target.value })}
              className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="exploring">Exploring</option>
              <option value="committed">Committed</option>
              <option value="done">Done</option>
            </select>
          </div>
          <ul className="divide-y divide-slate-100">
            {project.shopping.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={s.bought}
                    onChange={() =>
                      post({ action: "toggle_item", projectId: project.id, itemId: s.id })
                    }
                  />
                  <span className={s.bought ? "text-slate-400 line-through" : ""}>
                    {s.label}
                    <span className="text-xs text-slate-500">
                      {" "}
                      · {s.qty} {s.unit}
                      {s.estEach
                        ? ` · ~$${Math.round(s.qty * s.estEach).toLocaleString()}`
                        : ""}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Source comparison
        </p>
        <ul className="space-y-3">
          {book.sources.map((s) => {
            const chosen = project?.chosenSourceId === s.id;
            return (
              <li key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {COST[s.cost] || s.cost} · effort {s.effort} · {s.lead}
                    </p>
                  </div>
                  {project && (
                    <button
                      type="button"
                      onClick={() =>
                        post({ action: "status", id: project.id, chosenSourceId: s.id, status: project.status })
                      }
                      className="text-xs font-medium underline"
                    >
                      {chosen ? "Chosen" : "Choose this"}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-slate-600">{s.bestFor}</p>
                <p className="mt-1 text-xs text-slate-500">Watch: {s.watch}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Recipes</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {book.recipes.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-medium">{r.name}</p>
              <p className="text-xs text-slate-500">{r.forWhat}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                {r.pieces.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Timeline</p>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {book.timeline.map((t) => (
            <li key={t.when} className="px-4 py-3 text-sm">
              <p className="font-medium">{t.when}</p>
              <p className="text-slate-600">{t.what}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Don’t learn this the hard way</p>
        <ul className="list-disc space-y-1 rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm text-slate-600">
          {book.pitfalls.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

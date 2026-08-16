"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { diyPhoto } from "@/lib/brand";
import { motion, fadeUp, stagger } from "@/components/motion";
import { playbookFitsVibe } from "@/lib/vision-match";
import { Icon } from "@/components/icons";
import { MixBoard } from "@/components/diy/MixBoard";

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
  const [vibe, setVibe] = useState("");

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
    fetch("/api/decisions/style-vibe")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const v = d?.decision?.payload?.vibe;
        if (typeof v === "string") setVibe(v);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="text-2xl font-medium tracking-tight">DIY studio</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Lock the mix first. Then mock a look and take a list to the store.
        </p>
      </motion.div>

      <MixBoard />

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/diy/studio/floral"
          className="group overflow-hidden rounded-2xl border border-line bg-surface"
        >
          <div className="aspect-[16/8] overflow-hidden">
            <img src="/brand/flowers.jpg" alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          </div>
          <div className="p-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-moss">
              <Icon name="flower" className="h-3.5 w-3.5" /> Tool
            </p>
            <p className="mt-1 text-sm text-muted">Mock the bouquet or bowl. Palettes, looks, then a shopping list.</p>
          </div>
        </Link>
        <Link
          href="/diy/studio/table"
          className="group overflow-hidden rounded-2xl border border-line bg-surface"
        >
          <div className="aspect-[16/8] overflow-hidden">
            <img src="/brand/tablescape.jpg" alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          </div>
          <div className="p-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-moss">
              <Icon name="plate" className="h-3.5 w-3.5" /> Tool
            </p>
            <p className="mt-1 text-sm text-muted">Set one table. See the math for all of them.</p>
          </div>
        </Link>
        <Link
          href="/diy/studio/trends"
          className="group overflow-hidden rounded-2xl border border-line bg-surface sm:col-span-2"
        >
          <div className="grid sm:grid-cols-2">
            <div className="aspect-[16/8] overflow-hidden sm:aspect-auto">
              <img src="/brand/candles.jpg" alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-moss">2026</p>
              <p className="mt-1 font-serif text-2xl">Decoration trends</p>
              <p className="mt-1 text-sm text-muted">
                Meadow aisles, fruit on the table, little lamps — and the DIY version of each.
              </p>
            </div>
          </div>
        </Link>
      </section>

      {projects.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Your projects</p>
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {projects.map((p) => {
              const bought = p.shopping.filter((s) => s.bought).length;
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted">
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

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:grid-cols-2"
      >
        {books
          .slice()
          .sort((a, b) => Number(playbookFitsVibe(b.slug, vibe)) - Number(playbookFitsVibe(a.slug, vibe)))
          .map((b) => (
          <motion.div
            key={b.slug}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <Link
              href={`/diy/${b.slug}`}
              className="block overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img src={diyPhoto(b.slug)} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-base font-medium tracking-tight">{b.title}</p>
                {vibe && playbookFitsVibe(b.slug, vibe) && (
                  <p className="mt-1 text-[11px] text-moss">Fits {vibe}</p>
                )}
                <p className="mt-1 text-xs text-ink-soft">{b.summary}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { diyPhoto } from "@/lib/brand";
import { motion, fadeUp, stagger } from "@/components/motion";

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="overflow-hidden rounded-xl"
      >
        <div className="relative h-40 sm:h-52">
          <img src="/brand/flowers.jpg" alt="" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h1 className="font-serif text-3xl tracking-tight text-moss-fg">DIY studio</h1>
            <p className="mt-1 text-sm text-moss-fg/80">
              Playbooks for couples who make it themselves — skip the 40-tab YouTube spiral.
            </p>
          </div>
        </div>
      </motion.div>

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
        {books.map((b) => (
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
                <p className="font-serif text-lg">{b.title}</p>
                <p className="mt-1 text-xs text-ink-soft">{b.summary}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

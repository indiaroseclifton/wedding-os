"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Cat = { id: string; label: string; hireHref: string; diyHref: string };
type Choice = "undecided" | "hire" | "diy" | "mix";

const OPTIONS: { id: Choice; label: string }[] = [
  { id: "undecided", label: "Not yet" },
  { id: "hire", label: "Hire" },
  { id: "diy", label: "DIY" },
  { id: "mix", label: "Mix" },
];

export default function PathPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [choices, setChoices] = useState<Record<string, Choice>>({});

  useEffect(() => {
    fetch("/api/path")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setCats(data.categories || []);
        setChoices(data.path?.choices || {});
      })
      .catch(() => {});
  }, []);

  async function setChoice(category: string, choice: Choice) {
    setChoices((prev) => ({ ...prev, [category]: choice }));
    await fetch("/api/path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, choice }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/decisions" className="text-xs underline">
          Decisions
        </Link>
        <h1 className="mt-2 title">Hire vs DIY</h1>
        <p className="mt-1 text-sm text-muted">
          One choice per category. Hire opens the directory. DIY opens the playbook.
        </p>
      </div>
      <ul className="space-y-3">
        {cats.map((c) => {
          const choice = choices[c.id] || "undecided";
          return (
            <li key={c.id} className="glass-panel rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{c.label}</p>
                <div className="flex flex-wrap gap-1">
                  {OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setChoice(c.id, o.id)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        choice === o.id
                          ? "bg-moss text-moss-fg"
                          : "border border-line text-ink-soft"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {(choice === "hire" || choice === "mix") && (
                  <Link href={c.hireHref} className="underline">
                    Browse vendors
                  </Link>
                )}
                {(choice === "diy" || choice === "mix") && c.diyHref && (
                  <Link href={c.diyHref} className="underline">
                    Open playbook
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

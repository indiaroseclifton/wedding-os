"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { kindTitle, type HouseEvent } from "@/lib/house";

export function EventSwitch() {
  const router = useRouter();
  const wrap = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<HouseEvent[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/house");
    if (!res.ok) return;
    const data = await res.json();
    setEvents(data.events || []);
    setActiveId(data.activeId || null);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function pick(id: string) {
    if (id === activeId) {
      setOpen(false);
      return;
    }
    await fetch("/api/house", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeId: id }),
    });
    setOpen(false);
    await load();
    router.refresh();
  }

  const active = events.find((e) => e.id === activeId) || events[0];

  return (
    <div ref={wrap} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[14rem] items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-left"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="min-w-0 truncate text-xs font-medium">{active?.title || "Events"}</span>
        <span className="text-[9px] text-muted" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-40 mt-2 w-72 rounded-2xl border border-line bg-paper p-2 shadow-[0_16px_40px_-20px_rgba(28,26,22,0.35)]"
        >
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {events.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => pick(ev.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left ${
                    ev.id === activeId ? "bg-ink text-ivory" : "hover:bg-surface"
                  }`}
                >
                  <p className="truncate text-sm font-medium">{ev.title}</p>
                  <p className={`text-[11px] ${ev.id === activeId ? "text-ivory/70" : "text-muted"}`}>
                    {kindTitle(ev.kind)}
                    {ev.date ? ` · ${ev.date}` : ""}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/intake?new=1"
            role="menuitem"
            className="mt-2 flex min-h-10 items-center justify-center rounded-full bg-ink px-3 text-sm text-ivory"
            onClick={() => setOpen(false)}
          >
            Add event
          </Link>
        </div>
      ) : null}
    </div>
  );
}

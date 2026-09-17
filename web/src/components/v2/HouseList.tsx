"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { kindTitle, type HouseEvent } from "@/lib/house";

export function HouseList() {
  const router = useRouter();
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

  async function openEvent(id: string) {
    await fetch("/api/house", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeId: id }),
    });
    await load();
    router.refresh();
    router.push("/dashboard");
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="title">Events</h1>
          <p className="mt-1 text-sm text-muted">More than one gathering can live here. Add event starts Blanche’s walk.</p>
        </div>
        <Link href="/intake?new=1" className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">
          Add event
        </Link>
      </div>
      <ul className="space-y-3">
        {events.map((ev) => (
          <li key={ev.id} className={`rounded-2xl border px-4 py-4 ${ev.id === activeId ? "border-ink" : "border-line"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{ev.title}</p>
                <p className="text-xs text-muted">
                  {kindTitle(ev.kind)}
                  {ev.date ? ` · ${ev.date}` : ""}
                  {ev.location ? ` · ${ev.location}` : ""}
                </p>
              </div>
              {ev.id === activeId ? (
                <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] text-ivory">Open</span>
              ) : (
                <button type="button" onClick={() => openEvent(ev.id)} className="text-xs underline">
                  Open this one
                </button>
              )}
            </div>
          </li>
        ))}
        {!events.length ? <li className="py-6 text-center text-sm text-muted">No events yet. Add the first one.</li> : null}
      </ul>
    </section>
  );
}

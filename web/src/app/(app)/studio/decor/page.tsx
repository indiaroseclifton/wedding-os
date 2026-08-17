"use client";

import { useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { DECOR_BUILDS } from "@/lib/decor-builds";

export default function DecorPage() {
  const [open, setOpen] = useState(DECOR_BUILDS[0]?.id || "");
  const [msg, setMsg] = useState<string | null>(null);
  const build = DECOR_BUILDS.find((b) => b.id === open) || DECOR_BUILDS[0];

  async function pack() {
    if (!build) return;
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", name: build.title, zone: "Décor", takeTo: "Venue" }),
    });
    if (!res.ok) {
      setMsg("Could not pack");
      return;
    }
    const data = await res.json();
    const box = data.inventory?.boxes?.at(-1);
    if (box) {
      for (const row of build.materials) {
        await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add_item", id: box.id, label: `${row.qty} ${row.item}` }),
        });
      }
    }
    setMsg("Packed into Boxes");
  }

  if (!build) return null;

  return (
    <div className="space-y-8">
      <RoomSubnav room="studio" />
      <header className="max-w-2xl">
        <p className="kicker kicker-moss">Studio</p>
        <h1 className="mt-3 font-serif text-[clamp(2.4rem,7vw,4rem)] leading-none tracking-tight">Décor</h1>
        <p className="deck mt-4 max-w-xl">A build is a list: materials, time, and who holds what. Not a Pinterest save.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {DECOR_BUILDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setOpen(b.id)}
            className={`min-h-11 rounded-full px-4 text-sm ${
              open === b.id ? "bg-moss text-moss-fg" : "border border-line"
            }`}
          >
            {b.title}
          </button>
        ))}
      </div>

      <article className="glass-hero rounded-[1.8rem] p-5 sm:p-7">
        <p className="kicker kicker-moss">{build.difficulty} · {build.time} · {build.people} people</p>
        <h2 className="mt-2 font-serif text-3xl tracking-tight text-balance">{build.title}</h2>
        <p className="mt-3 max-w-xl text-sm text-muted text-pretty">{build.line}</p>
        <ul className="mt-6 divide-y divide-line">
          {build.materials.map((m) => (
            <li key={m.item} className="flex min-h-11 items-center justify-between gap-3 py-2">
              <span className="font-serif text-xl">{m.item}</span>
              <span className="tabular-nums text-sm text-muted">{m.qty}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <p className="kicker">Hands</p>
          <ul className="mt-2 space-y-2">
            {build.jobs.map((j) => (
              <li key={j.task} className="text-sm">
                <span className="font-medium">{j.task}</span>
                <span className="text-muted"> · {j.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <button type="button" onClick={pack} className="btn btn-primary mt-6">
          Pack this into a box
        </button>
        {msg ? <p className="mt-2 text-xs text-moss">{msg}</p> : null}
      </article>
    </div>
  );
}

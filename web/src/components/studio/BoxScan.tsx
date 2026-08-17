"use client";

import { useState } from "react";
import type { InventoryBox } from "@/lib/data/inventory-store";

export function BoxScan({
  token,
  names,
  box: initial,
}: {
  token: string;
  names: string;
  box: InventoryBox;
}) {
  const [box, setBox] = useState(initial);

  async function toggle(itemId: string) {
    const res = await fetch(`/api/public/box/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.box) setBox(data.box);
  }

  return (
    <div className="min-h-screen bg-paper px-5 py-10 text-ink">
      <div className="mx-auto max-w-md">
        <p className="kicker">Vowfolk · {names}</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">{box.name}</h1>
        <p className="mt-2 text-sm text-muted">
          {[box.takeTo && `Goes to ${box.takeTo}`, box.owner && `Owner ${box.owner}`, box.setupBy && `Set up by ${box.setupBy}`]
            .filter(Boolean)
            .join(" · ") || "No destination yet"}
        </p>
        <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-surface">
          {box.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={`flex min-h-12 w-full items-center px-4 text-left text-sm ${item.done ? "text-muted line-through" : ""}`}
              >
                {item.label}
              </button>
            </li>
          ))}
          {box.items.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">Empty box.</li>
          ) : null}
        </ul>
        <p className="mt-6 text-xs text-muted">Tap a line when it’s on the table. That’s the whole job.</p>
      </div>
    </div>
  );
}

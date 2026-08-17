"use client";

import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrintButton } from "@/components/ui/PrintButton";
import type { InventoryBox, InventoryFate } from "@/lib/data/inventory-store";

const FATES: { id: InventoryFate; label: string }[] = [
  { id: "keep", label: "Keep" },
  { id: "return", label: "Return" },
  { id: "sell", label: "Sell" },
  { id: "donate", label: "Donate" },
  { id: "reuse", label: "Reuse at home" },
];

export default function InventoryPage() {
  const [boxes, setBoxes] = useState<InventoryBox[]>([]);
  const [name, setName] = useState("");
  const [takeTo, setTakeTo] = useState("");
  const [owner, setOwner] = useState("");
  const [itemDraft, setItemDraft] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch("/api/inventory");
    if (res.ok) {
      const data = await res.json();
      setBoxes(data.inventory?.boxes || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      setBoxes(data.inventory?.boxes || []);
    }
  }

  return (
    <div className="space-y-8">
      <RoomSubnav room="studio" />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker kicker-moss">Studio</p>
          <h1 className="mt-2 font-serif text-[clamp(2.4rem,7vw,4rem)] leading-none tracking-tight">
            Boxes
          </h1>
          <p className="deck mt-3 max-w-xl">
            Ceremony, cocktail, tables 1–5. Scan the label on the day. After, say keep, sell, or donate.
          </p>
        </div>
        <PrintButton label="Print labels" />
      </header>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add", name, takeTo, owner });
          setName("");
          setTakeTo("");
          setOwner("");
        }}
        className="flex flex-wrap items-end gap-3 print:hidden"
      >
        <label className="text-sm">
          <span className="kicker">Box name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="field mt-1" placeholder="Ceremony" />
        </label>
        <label className="text-sm">
          <span className="kicker">Take to</span>
          <input value={takeTo} onChange={(e) => setTakeTo(e.target.value)} className="field mt-1" placeholder="Ballroom" />
        </label>
        <label className="text-sm">
          <span className="kicker">Owner</span>
          <input value={owner} onChange={(e) => setOwner(e.target.value)} className="field mt-1" placeholder="Sophie" />
        </label>
        <button type="submit" className="btn btn-primary">
          Add box
        </button>
      </form>

      {boxes.length === 0 ? (
        <EmptyState title="No boxes yet" body="Pack a décor build, or add a box for ceremony, cocktail, tables." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {boxes.map((box, i) => {
            const href = typeof window === "undefined" ? `/box/${box.scanToken}` : `${window.location.origin}/box/${box.scanToken}`;
            const qr = box.scanToken
              ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  typeof window === "undefined" ? `/box/${box.scanToken}` : `${window.location.origin}/box/${box.scanToken}`
                )}`
              : "";
            return (
            <article key={box.id} className="rounded-[1.4rem] border border-line bg-surface p-5 print:break-inside-avoid">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="kicker">Box {String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-1 font-serif text-3xl tracking-tight">{box.name}</h2>
                  <p className="mt-2 text-sm text-muted">
                    {[box.takeTo && `Take to ${box.takeTo}`, box.owner && `Owner ${box.owner}`, box.setupBy && `By ${box.setupBy}`]
                      .filter(Boolean)
                      .join(" · ") || "No destination yet"}
                  </p>
                </div>
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt="" className="h-20 w-20 shrink-0 bg-white p-1" />
                ) : null}
              </div>
              <p className="mt-2 hidden font-mono text-[10px] text-muted print:block">{href}</p>
              <ul className="mt-4 divide-y divide-line">
                {box.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => post({ action: "toggle_item", id: box.id, itemId: item.id })}
                      className={`flex min-h-11 w-full items-center text-left text-sm print:min-h-0 ${
                        item.done ? "text-muted line-through" : ""
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
              <form
                className="mt-3 flex gap-2 print:hidden"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const label = (itemDraft[box.id] || "").trim();
                  if (!label) return;
                  await post({ action: "add_item", id: box.id, label });
                  setItemDraft((d) => ({ ...d, [box.id]: "" }));
                }}
              >
                <input
                  value={itemDraft[box.id] || ""}
                  onChange={(e) => setItemDraft((d) => ({ ...d, [box.id]: e.target.value }))}
                  className="field flex-1"
                  placeholder="Add what’s in it"
                />
                <button type="submit" className="btn btn-ghost">
                  Add
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-1 print:hidden">
                {FATES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => post({ action: "patch", id: box.id, fate: f.id })}
                    className={`min-h-9 rounded-full px-3 text-xs ${
                      box.fate === f.id ? "bg-moss text-moss-fg" : "border border-line"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => post({ action: "delete", id: box.id })}
                  className="min-h-9 px-2 text-xs text-muted underline"
                >
                  Remove
                </button>
              </div>
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

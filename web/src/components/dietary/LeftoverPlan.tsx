"use client";

import { useState } from "react";
import type { StoredDietary } from "@/lib/data/dietary-store";

export function LeftoverPlan({ initial }: { initial: StoredDietary }) {
  const [form, setForm] = useState({
    packOut: initial.packOut || "",
    fridge: initial.fridge || "",
    leftoverTo: initial.leftoverTo || "",
    donate: initial.donate || "",
    notes: initial.notes || "",
  });
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/dietary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMsg(res.ok ? "Saved" : "Could not save");
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <h2 className="font-serif text-2xl">Leftover plan</h2>
      <label className="block text-sm">
        Who packs out
        <input value={form.packOut} onChange={(e) => setForm({ ...form, packOut: e.target.value })} className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3" />
      </label>
      <label className="block text-sm">
        Fridge / cooler
        <input value={form.fridge} onChange={(e) => setForm({ ...form, fridge: e.target.value })} className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3" />
      </label>
      <label className="block text-sm">
        Who takes extra
        <input value={form.leftoverTo} onChange={(e) => setForm({ ...form, leftoverTo: e.target.value })} className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3" />
      </label>
      <label className="block text-sm">
        Donate / compost
        <input value={form.donate} onChange={(e) => setForm({ ...form, donate: e.target.value })} className="mt-1 block min-h-11 w-full rounded-xl border border-line px-3" />
      </label>
      <label className="block text-sm">
        Notes for the kitchen
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1 block w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <button type="submit" className="min-h-11 rounded-full bg-moss px-4 text-sm text-ivory print:hidden">
        Save leftover plan
      </button>
      {msg && <p role="status" className="text-xs text-moss">{msg}</p>}
    </form>
  );
}

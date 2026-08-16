"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewGuestPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email") || undefined,
          side: form.get("side") || "OTHER",
          rsvp: form.get("rsvp") || "UNKNOWN",
          plusOnes: Number(form.get("plusOnes") || 0),
          dietary: form.get("dietary") || undefined,
          address: form.get("address") || undefined,
          city: form.get("city") || undefined,
          region: form.get("region") || undefined,
          postal: form.get("postal") || undefined,
          phone: form.get("phone") || undefined,
          notes: form.get("notes") || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save guest");
      }
      router.push("/guests");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save guest");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add guest</h1>
        <p className="mt-1 text-sm text-slate-600">Name is required. Everything else is optional.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Name</span>
          <input name="name" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Email</span>
          <input name="email" type="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Side</span>
            <select name="side" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="OTHER">Other</option>
              <option value="A">Partner A</option>
              <option value="B">Partner B</option>
              <option value="BOTH">Both</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">RSVP</span>
            <select name="rsvp" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="UNKNOWN">Unknown</option>
              <option value="INVITED">Invited</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
              <option value="MAYBE">Maybe</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Plus-ones</span>
          <input name="plusOnes" type="number" min={0} defaultValue={0} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Street</span>
          <input name="address" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium text-slate-800">City</span>
            <input name="city" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">State</span>
            <input name="region" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium text-slate-800">ZIP</span>
            <input name="postal" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Phone</span>
            <input name="phone" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Dietary</span>
          <input name="dietary" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Notes</span>
          <textarea name="notes" rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save guest"}
        </button>
      </form>
    </div>
  );
}

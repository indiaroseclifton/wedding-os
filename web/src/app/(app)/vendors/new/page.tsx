"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  "Venue",
  "Photographer",
  "Videographer",
  "Florist",
  "Catering",
  "DJ / Band",
  "Planner",
  "Officiant",
  "Cake",
  "Other",
];

export default function NewVendorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          category: form.get("category"),
          status: form.get("status"),
          contactName: form.get("contactName") || undefined,
          email: form.get("email") || undefined,
          phone: form.get("phone") || undefined,
          website: form.get("website") || undefined,
          notes: form.get("notes") || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save vendor");
      }
      router.push("/vendors");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save vendor");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add vendor</h1>
        <p className="mt-1 text-sm text-slate-600">Keep contact details and status together.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="font-medium">Name</span>
          <input name="name" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Category</span>
          <select name="category" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Status</span>
          <select name="status" defaultValue="RESEARCHING" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="RESEARCHING">Researching</option>
            <option value="CONTACTED">Contacted</option>
            <option value="BOOKED">Booked</option>
            <option value="PAID_DEPOSIT">Paid deposit</option>
            <option value="DONE">Done</option>
            <option value="DECLINED">Declined</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Contact name</span>
          <input name="contactName" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Email</span>
          <input name="email" type="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Phone</span>
          <input name="phone" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Website</span>
          <input name="website" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Notes</span>
          <textarea name="notes" rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save vendor"}
        </button>
      </form>
    </div>
  );
}

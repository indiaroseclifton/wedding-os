"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

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
      <RoomSubnav room="planning" />
      <div>
        <p className="kicker kicker-moss">Vendors</p>
        <h1 className="title mt-2">Add vendor</h1>
        <p className="deck mt-2">Name, category, how far along.</p>
      </div>
      <form onSubmit={onSubmit} className="glass-panel space-y-4 rounded-2xl p-5">
        <label className="block text-sm">
          <span className="kicker">Name</span>
          <input name="name" required className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Category</span>
          <select name="category" className="field mt-1">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="kicker">Status</span>
          <select name="status" defaultValue="RESEARCHING" className="field mt-1">
            <option value="RESEARCHING">Researching</option>
            <option value="CONTACTED">Contacted</option>
            <option value="BOOKED">Booked</option>
            <option value="PAID_DEPOSIT">Paid deposit</option>
            <option value="DONE">Done</option>
            <option value="DECLINED">Declined</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="kicker">Contact name</span>
          <input name="contactName" className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Email</span>
          <input name="email" type="email" className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Phone</span>
          <input name="phone" className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Website</span>
          <input name="website" className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Notes</span>
          <textarea name="notes" rows={3} className="field mt-1" />
        </label>
        {error && <p className="text-xs text-clay">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save vendor"}
        </button>
      </form>
    </div>
  );
}

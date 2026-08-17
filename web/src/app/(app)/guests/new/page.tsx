"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

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
          plusOneText: form.get("plusOneText") || "",
          dietary: form.get("dietary") || undefined,
          address: form.get("address") || undefined,
          city: form.get("city") || undefined,
          region: form.get("region") || undefined,
          postal: form.get("postal") || undefined,
          phone: form.get("phone") || undefined,
          partyName: form.get("partyName") || undefined,
          listTier: form.get("listTier") || "A",
          meal: form.get("meal") || undefined,
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
      <RoomSubnav room="guests" />
      <div>
        <p className="kicker kicker-moss">Guests</p>
        <h1 className="title mt-2">Add one</h1>
        <p className="deck mt-2">A name is enough to start.</p>
      </div>
      <form onSubmit={onSubmit} className="glass-panel space-y-4 rounded-2xl p-5">
        <label className="block text-sm">
          <span className="kicker">Name</span>
          <input name="name" required className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Email</span>
          <input name="email" type="email" className="field mt-1" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="kicker">Side</span>
            <select name="side" className="field mt-1">
              <option value="OTHER">Other</option>
              <option value="A">Partner A</option>
              <option value="B">Partner B</option>
              <option value="BOTH">Both</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="kicker">RSVP</span>
            <select name="rsvp" className="field mt-1">
              <option value="UNKNOWN">Unknown</option>
              <option value="INVITED">Invited</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
              <option value="MAYBE">Maybe</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="kicker">Plus-ones — names if you know them</span>
          <input name="plusOnes" type="number" min={0} defaultValue={0} className="field mt-1" />
          <textarea
            name="plusOneText"
            rows={2}
            placeholder="One name per line — Sam Chen"
            className="field mt-2"
          />
        </label>
        <label className="block text-sm">
          <span className="kicker">Street</span>
          <input name="address" className="field mt-1" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="kicker">City</span>
            <input name="city" className="field mt-1" />
          </label>
          <label className="block text-sm">
            <span className="kicker">State</span>
            <input name="region" className="field mt-1" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="kicker">ZIP</span>
            <input name="postal" className="field mt-1" />
          </label>
          <label className="block text-sm">
            <span className="kicker">Phone</span>
            <input name="phone" className="field mt-1" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="kicker">List</span>
          <select name="listTier" defaultValue="A" className="field mt-1">
            <option value="A">A — invited first</option>
            <option value="B">B — if space opens. No save-the-date.</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="kicker">Household</span>
          <input name="partyName" placeholder="The Garcias" className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Meal</span>
          <input name="meal" placeholder="Chicken, fish, veg" className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Dietary</span>
          <input name="dietary" className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Notes</span>
          <textarea name="notes" rows={3} className="field mt-1" />
        </label>
        {error && <p className="text-xs text-clay">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Saving…" : "Save guest"}
          </button>
          <Link href="/guests" className="btn btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

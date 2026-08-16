"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Guest = {
  id: string;
  name: string;
  email?: string;
  side?: string;
  rsvp: string;
  plusOnes: number;
  dietary?: string;
  tableLabel?: string;
  notes?: string;
  address?: string;
  city?: string;
  region?: string;
  postal?: string;
  phone?: string;
  partyName?: string;
};

export default function EditGuestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/guests/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Guest not found");
        const data = await res.json();
        setGuest(data.guest);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!guest) return;
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email") || undefined,
          side: form.get("side"),
          rsvp: form.get("rsvp"),
          plusOnes: Number(form.get("plusOnes") || 0),
          dietary: form.get("dietary") || undefined,
          tableLabel: form.get("tableLabel") || undefined,
          address: form.get("address") || undefined,
          city: form.get("city") || undefined,
          region: form.get("region") || undefined,
          postal: form.get("postal") || undefined,
          phone: form.get("phone") || undefined,
          partyName: form.get("partyName") || undefined,
          notes: form.get("notes") || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save");
      }
      router.push("/guests");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Remove this guest?")) return;
    const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/guests");
      router.refresh();
    } else {
      setError("Could not delete guest");
    }
  }

  if (loading) return <p className="text-sm text-slate-600">Loading…</p>;
  if (!guest) return <p className="text-sm text-rose-600">{error || "Not found"}</p>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit guest</h1>
        <p className="mt-1 text-sm text-slate-600">Update RSVP, dietary notes, or table.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="font-medium">Name</span>
          <input name="name" required defaultValue={guest.name} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Email</span>
          <input name="email" type="email" defaultValue={guest.email || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium">Side</span>
            <select name="side" defaultValue={guest.side || "OTHER"} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="OTHER">Other</option>
              <option value="A">Partner A</option>
              <option value="B">Partner B</option>
              <option value="BOTH">Both</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">RSVP</span>
            <select name="rsvp" defaultValue={guest.rsvp} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="UNKNOWN">Unknown</option>
              <option value="INVITED">Invited</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
              <option value="MAYBE">Maybe</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium">Plus-ones</span>
          <input name="plusOnes" type="number" min={0} defaultValue={guest.plusOnes || 0} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Table label</span>
          <input name="tableLabel" defaultValue={guest.tableLabel || ""} placeholder="e.g. Table 1" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Street</span>
          <input name="address" defaultValue={guest.address || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium">City</span>
            <input name="city" defaultValue={guest.city || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">State</span>
            <input name="region" defaultValue={guest.region || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium">ZIP</span>
            <input name="postal" defaultValue={guest.postal || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Phone</span>
            <input name="phone" defaultValue={guest.phone || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium">Household</span>
          <input name="partyName" defaultValue={guest.partyName || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Dietary</span>
          <input name="dietary" defaultValue={guest.dietary || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Notes</span>
          <textarea name="notes" rows={3} defaultValue={guest.notes || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onDelete} className="rounded-lg border border-rose-200 px-3 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50">
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

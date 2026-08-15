"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Vendor = {
  id: string;
  name: string;
  category: string;
  status: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
};

export default function EditVendorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/vendors/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setVendor(data.vendor);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "PATCH",
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
      if (!res.ok) throw new Error("Could not save");
      router.push("/vendors");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Remove this vendor?")) return;
    const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/vendors");
      router.refresh();
    }
  }

  if (loading) return <p className="text-sm text-slate-600">Loading…</p>;
  if (!vendor) return <p className="text-sm text-rose-600">{error || "Not found"}</p>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit vendor</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="font-medium">Name</span>
          <input name="name" required defaultValue={vendor.name} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Category</span>
          <input name="category" defaultValue={vendor.category} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Status</span>
          <select name="status" defaultValue={vendor.status} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="RESEARCHING">Researching</option>
            <option value="CONTACTED">Contacted</option>
            <option value="BOOKED">Booked</option>
            <option value="PAID_DEPOSIT">Paid deposit</option>
            <option value="DONE">Done</option>
            <option value="DECLINED">Declined</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Contact</span>
          <input name="contactName" defaultValue={vendor.contactName || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Email</span>
          <input name="email" defaultValue={vendor.email || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Phone</span>
          <input name="phone" defaultValue={vendor.phone || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Website</span>
          <input name="website" defaultValue={vendor.website || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Notes</span>
          <textarea name="notes" rows={3} defaultValue={vendor.notes || ""} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onDelete} className="rounded-lg border border-rose-200 px-3 py-2.5 text-sm text-rose-700">
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

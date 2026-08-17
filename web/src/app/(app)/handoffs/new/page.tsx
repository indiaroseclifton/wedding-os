"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

type Vendor = { id: string; name: string; category: string };

export default function NewHandoffPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/vendors")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list = d?.vendors || [];
        setVendors(list);
        if (list[0]) setVendorId(list[0].id);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorId) {
      setError("Add a vendor first.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "note", vendorId, handoffNote: note }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    router.push(`/send/${vendorId}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <RoomSubnav room="planning" />
      <div>
        <p className="kicker kicker-moss">Send</p>
        <h1 className="title mt-2">A note for their packet</h1>
        <p className="deck mt-2">This lands on Send. They never see this page.</p>
      </div>
      {vendors.length === 0 ? (
        <p className="text-sm text-muted">
          Add someone under{" "}
          <Link href="/vendors" className="underline">
            Vendors
          </Link>{" "}
          first.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="glass-panel space-y-4 rounded-2xl p-5">
          <label className="block text-sm">
            <span className="kicker">Vendor</span>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="field mt-1"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.category}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="kicker">Note</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={8}
              required
              placeholder="Load-in is the side gate. Must-play is on Music. Dietary is the kitchen packet."
              className="field mt-1"
            />
          </label>
          {error && <p className="text-xs text-clay">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Saving…" : "Put on their packet"}
            </button>
            <Link href="/send" className="btn btn-ghost">
              Open Send
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

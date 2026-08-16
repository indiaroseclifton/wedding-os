"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Vendor = {
  id: string;
  name: string;
  category: string;
  status: string;
  email?: string;
  moneyHint?: string;
};

const STATUSES = [
  "RESEARCHING",
  "CONTACTED",
  "PROPOSAL",
  "BOOKED",
  "PAID_DEPOSIT",
  "DONE",
  "PASSED",
] as const;

export function VendorsClient({ vendors }: { vendors: Vendor[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(vendors);
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRows((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="space-y-3">
      {rows.map((v) => (
        <li key={v.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
          <Link href={`/vendors/${v.id}`} className="flex min-w-0 flex-1 items-center gap-4">
            <img src="/brand/flowers.jpg" alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="font-medium">{v.name}</p>
              <p className="text-xs text-muted">
                {v.category}
                {v.moneyHint ? ` · ${v.moneyHint}` : ""}
              </p>
            </div>
          </Link>
          <select
            disabled={busy === v.id}
            value={v.status}
            onChange={(e) => setStatus(v.id, e.target.value)}
            className="rounded-full border border-line bg-paper px-2 py-1 text-[11px]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}

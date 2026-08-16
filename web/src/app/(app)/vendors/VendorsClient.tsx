"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";

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
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {rows.map((v) => (
        <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{v.name}</p>
            <p className="text-xs text-slate-500">
              {v.category}
              {v.email ? ` · ${v.email}` : ""}
              {v.moneyHint ? ` · ${v.moneyHint}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={v.status} />
            <select
              disabled={busy === v.id}
              value={v.status}
              onChange={(e) => setStatus(v.id, e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <Link href={`/vendors/${v.id}`} className="text-xs font-medium underline">
              Open
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

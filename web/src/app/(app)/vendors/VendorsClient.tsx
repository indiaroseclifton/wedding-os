"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { coverFor } from "@/lib/vendor-face";

type Vendor = {
  id: string;
  name: string;
  category: string;
  status: string;
  email?: string;
  moneyHint?: string;
  strip?: string;
  faceHint?: string;
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
    <ul className="grid gap-3">
      {rows.map((v) => (
        <li key={v.id}>
          <article className="overflow-hidden rounded-[1.25rem] border border-line bg-surface transition hover:border-moss/40">
            <div className="desk-row gap-3 p-3 sm:gap-4">
              <Link href={`/vendors/${v.id}`} className="contents">
                <img
                  src={coverFor(v.category)}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
                />
                <span className="min-w-0 py-0.5">
                  <span className="block font-serif text-2xl leading-tight">{v.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {v.category}
                    {v.faceHint ? ` · ${v.faceHint}` : ""}
                  </span>
                  {(v.strip || v.moneyHint) && (
                    <span
                      className={`mt-2 block text-xs ${
                        v.strip && !v.strip.startsWith("Not") && !v.strip.startsWith("Draft") ? "text-moss" : "text-muted"
                      }`}
                    >
                      {v.strip || v.moneyHint}
                    </span>
                  )}
                </span>
              </Link>
              <select
                disabled={busy === v.id}
                value={v.status}
                aria-label={`Status for ${v.name}`}
                onChange={(e) => setStatus(v.id, e.target.value)}
                className="rounded-full border border-line bg-paper px-3 py-2 text-[11px]"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

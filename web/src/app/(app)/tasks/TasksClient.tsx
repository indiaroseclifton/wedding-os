"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Task = {
  id: string;
  title: string;
  ownerName?: string;
  status: string;
  dueDate?: string;
};

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "DONE", "BLOCKED"] as const;

export function TasksClient({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(tasks);
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRows((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  if (!rows.length) return null;

  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {rows.map((t) => (
        <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{t.title}</p>
            <p className="text-xs text-slate-500">
              {t.ownerName || "Unassigned"}
              {t.dueDate ? ` · due ${t.dueDate}` : ""}
            </p>
          </div>
          <select
            disabled={busy === t.id}
            value={t.status}
            onChange={(e) => setStatus(t.id, e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
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

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL");

  const owners = useMemo(() => {
    const set = new Set<string>();
    for (const t of rows) set.add(t.ownerName || "Unassigned");
    return Array.from(set).sort();
  }, [rows]);

  const visible = useMemo(() => {
    return rows.filter((t) => {
      if (statusFilter === "OPEN" && t.status === "DONE") return false;
      if (statusFilter !== "OPEN" && statusFilter !== "ALL" && t.status !== statusFilter)
        return false;
      if (ownerFilter !== "ALL" && (t.ownerName || "Unassigned") !== ownerFilter)
        return false;
      return true;
    });
  }, [rows, statusFilter, ownerFilter]);

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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {["OPEN", "ALL", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusFilter === s
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            {s === "OPEN" ? "Open" : s === "ALL" ? "All" : s.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOwnerFilter("ALL")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            ownerFilter === "ALL"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          All people
        </button>
        {owners.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOwnerFilter(o)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              ownerFilter === o
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {visible.map((t) => (
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
        {!visible.length && (
          <li className="px-4 py-8 text-center text-sm text-slate-500">No tasks in this filter</li>
        )}
      </ul>
    </div>
  );
}

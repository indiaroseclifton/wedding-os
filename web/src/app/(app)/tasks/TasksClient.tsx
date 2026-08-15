"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  ownerId?: string;
  ownerName?: string;
  status: string;
  dueDate?: string;
};

type Member = { userId: string; name: string };

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "DONE", "BLOCKED"] as const;

function isOverdue(dueDate?: string, status?: string) {
  if (!dueDate || status === "DONE") return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function TasksClient({
  tasks,
  members = [],
}: {
  tasks: Task[];
  members?: Member[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(tasks);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [bulkStatus, setBulkStatus] = useState("DONE");
  const [bulkOwnerId, setBulkOwnerId] = useState(members[0]?.userId || "");

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

  const allVisibleSelected =
    visible.length > 0 && visible.every((t) => selected.has(t.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const t of visible) next.delete(t.id);
      } else {
        for (const t of visible) next.add(t.id);
      }
      return next;
    });
  }

  async function setStatus(id: string, status: string) {
    setBusy(true);
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
      setBusy(false);
    }
  }

  async function runBulk(body: Record<string, unknown>) {
    if (!selected.size) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Bulk action failed");

      if (body.action === "delete") {
        const ids = selected;
        setRows((prev) => prev.filter((t) => !ids.has(t.id)));
        setSelected(new Set());
      } else if (body.action === "status") {
        const status = String(body.status);
        setRows((prev) =>
          prev.map((t) => (selected.has(t.id) ? { ...t, status } : t))
        );
      } else if (body.action === "owner") {
        const ownerId = String(body.ownerId);
        const member = members.find((m) => m.userId === ownerId);
        const ownerName = member?.name || "Unassigned";
        setRows((prev) =>
          prev.map((t) =>
            selected.has(t.id) ? { ...t, ownerId, ownerName } : t
          )
        );
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk action failed");
    } finally {
      setBusy(false);
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

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={toggleAllVisible}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium"
        >
          {allVisibleSelected ? "Clear visible" : "Select visible"}
        </button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium"
          >
            Clear ({selected.size})
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="space-y-3 rounded-xl border border-slate-900/10 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            Bulk actions · {selected.size} selected
          </p>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="font-medium">Status</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="mt-1 block rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => runBulk({ action: "status", status: bulkStatus })}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Apply status
            </button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs">
                <span className="font-medium">Owner</span>
                <select
                  value={bulkOwnerId}
                  onChange={(e) => setBulkOwnerId(e.target.value)}
                  className="mt-1 block rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"
                >
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={busy || !bulkOwnerId}
                onClick={() => runBulk({ action: "owner", ownerId: bulkOwnerId })}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                Reassign
              </button>
            </div>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (
                confirm(
                  `Delete ${selected.size} task${selected.size === 1 ? "" : "s"}? This cannot be undone.`
                )
              ) {
                runBulk({ action: "delete" });
              }
            }}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-50"
          >
            Delete selected
          </button>

          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
      )}

      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {visible.map((t) => {
          const overdue = isOverdue(t.dueDate, t.status);
          return (
            <li
              key={t.id}
              className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
                overdue ? "bg-rose-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(t.id)}
                onChange={() => toggleOne(t.id)}
                className="h-4 w-4 rounded border-slate-300"
                aria-label={`Select ${t.title}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{t.title}</p>
                <p className={`text-xs ${overdue ? "font-medium text-rose-700" : "text-slate-500"}`}>
                  {t.ownerName || "Unassigned"}
                  {t.dueDate ? ` · due ${t.dueDate}` : ""}
                  {overdue ? " · overdue" : ""}
                </p>
              </div>
              <select
                disabled={busy}
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
          );
        })}
        {!visible.length && (
          <li className="px-4 py-8 text-center text-sm text-slate-500">No tasks in this filter</li>
        )}
      </ul>
    </div>
  );
}

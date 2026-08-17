"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";

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

  const chip = (on: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium ${
      on ? "bg-moss text-moss-fg" : "text-ink-soft hover:bg-surface"
    }`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {["OPEN", "ALL", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={chip(statusFilter === s)}
          >
            {s === "OPEN" ? "Open" : s === "ALL" ? "All" : s.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOwnerFilter("ALL")}
          className={chip(ownerFilter === "ALL")}
        >
          All people
        </button>
        {owners.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOwnerFilter(o)}
            className={chip(ownerFilter === o)}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={toggleAllVisible}
          className="btn btn-ghost !min-h-8 px-3 text-xs"
        >
          {allVisibleSelected ? "Clear visible" : "Select visible"}
        </button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="btn btn-ghost !min-h-8 px-3 text-xs"
          >
            Clear ({selected.size})
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="glass-panel space-y-3 rounded-2xl p-5">
          <p className="text-sm font-medium text-ink">
            Bulk actions · {selected.size} selected
          </p>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="kicker">Status</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="field mt-1"
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
              className="btn btn-primary !min-h-8 px-3 text-xs disabled:opacity-50"
            >
              Apply status
            </button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs">
                <span className="kicker">Owner</span>
                <select
                  value={bulkOwnerId}
                  onChange={(e) => setBulkOwnerId(e.target.value)}
                  className="field mt-1"
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
                className="btn btn-primary !min-h-8 px-3 text-xs disabled:opacity-50"
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
            className="btn btn-ghost !min-h-8 px-3 text-xs text-clay disabled:opacity-50"
          >
            Delete selected
          </button>

          {error && <p className="text-xs text-clay">{error}</p>}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState title="No tasks in this filter" body="Try another chip, or add a task." />
      ) : (
        <ul className="panel divide-y divide-line">
          {visible.map((t) => {
            const overdue = isOverdue(t.dueDate, t.status);
            return (
              <li
                key={t.id}
                className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
                  overdue ? "bg-clay-soft" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggleOne(t.id)}
                  className="h-4 w-4 rounded border-line"
                  aria-label={`Select ${t.title}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{t.title}</p>
                  <p className={`text-xs ${overdue ? "font-medium text-clay" : "text-muted"}`}>
                    {t.ownerName || "Unassigned"}
                    {t.dueDate ? ` · due ${t.dueDate}` : ""}
                    {overdue ? " · overdue" : ""}
                  </p>
                </div>
                <select
                  disabled={busy}
                  value={t.status}
                  onChange={(e) => setStatus(t.id, e.target.value)}
                  className="field w-auto"
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
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
};

export function PartyMyTasks({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function mark(id: string, status: string) {
    setBusy(id);
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((rows) => rows.map((t) => (t.id === id ? { ...t, status: data.task.status } : t)));
    }
    setBusy(null);
  }

  if (!tasks.length) {
    return <p className="text-sm text-muted">No tasks assigned to you yet.</p>;
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {tasks.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className={`text-sm font-medium ${t.status === "DONE" ? "line-through opacity-60" : ""}`}>
              {t.title}
            </p>
            {t.description && <p className="text-xs text-muted">{t.description}</p>}
            {t.dueDate && <p className="text-[11px] text-muted">Due {t.dueDate}</p>}
          </div>
          <button
            type="button"
            disabled={busy === t.id}
            onClick={() => mark(t.id, t.status === "DONE" ? "NOT_STARTED" : "DONE")}
            className="rounded-full border border-line px-3 py-1 text-xs disabled:opacity-50"
          >
            {t.status === "DONE" ? "Undo" : "Mark done"}
          </button>
        </li>
      ))}
    </ul>
  );
}

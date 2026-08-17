"use client";

import { useState } from "react";

export function FollowUpButton({ decisionId }: { decisionId: string }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const res = await fetch("/api/decisions/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId }),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <span className="text-xs text-moss">Task created</span>;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={create}
      className="text-xs font-medium underline disabled:opacity-50"
    >
      Follow-up task
    </button>
  );
}

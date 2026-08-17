"use client";

import { useState } from "react";

export function ReceivePacket({
  token,
  receivedAt,
  receivedName,
}: {
  token: string;
  receivedAt?: string;
  receivedName?: string;
}) {
  const [name, setName] = useState(receivedName || "");
  const [done, setDone] = useState(Boolean(receivedAt));
  const [busy, setBusy] = useState(false);

  async function mark() {
    setBusy(true);
    try {
      const res = await fetch(`/api/public/send/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) setDone(true);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="mt-8 text-sm text-moss print:hidden">
        Marked received{name ? ` · ${name}` : ""}.
      </p>
    );
  }

  return (
    <form
      className="mt-8 flex flex-wrap items-end gap-2 print:hidden"
      onSubmit={(e) => {
        e.preventDefault();
        void mark();
      }}
    >
      <label className="text-sm">
        Your name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block min-h-11 rounded-full border border-line bg-surface px-4 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="min-h-11 rounded-full bg-moss px-5 text-sm font-medium text-moss-fg disabled:opacity-50"
      >
        I have this
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";

export function PortalActions({
  token,
  recipientName,
  slots,
  receivedAt,
}: {
  token: string;
  recipientName?: string;
  slots: { id: string; title: string; time: string }[];
  receivedAt?: string;
}) {
  const [name, setName] = useState(recipientName || "");
  const [note, setNote] = useState("");
  const [acked, setAcked] = useState(Boolean(receivedAt));
  const [msg, setMsg] = useState<string | null>(receivedAt ? "Packet received" : null);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/public/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...body }),
    });
    return res.ok;
  }

  return (
    <div className="space-y-3 glass-panel rounded-2xl p-4 print:hidden">
      <p className="text-sm font-medium">Your call sheet</p>
      {!acked ? (
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-lg border border-line px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={async () => {
              if (await post({ action: "ack", name })) {
                setAcked(true);
                setMsg("Got it — they can see you received this.");
              }
            }}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            I have this
          </button>
        </div>
      ) : (
        <p className="text-xs text-emerald-700">{msg}</p>
      )}
      <ul className="space-y-2">
        {slots.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>
              {s.time} · {s.title}
            </span>
            <button
              type="button"
              onClick={async () => {
                if (await post({ action: "confirm", slotId: s.id, who: name || "Vendor" })) {
                  setMsg(`Confirmed ${s.title}`);
                }
              }}
              className="underline"
            >
              Confirm
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Comment on first beat…"
          className="flex-1 rounded-lg border border-line px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          disabled={!note.trim() || !slots[0]}
          onClick={async () => {
            if (slots[0] && (await post({ action: "comment", slotId: slots[0].id, author: name || "Vendor", body: note }))) {
              setNote("");
              setMsg("Comment sent");
            }
          }}
          className="text-xs underline"
        >
          Send
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { PacketSlot } from "@/lib/send/assemble";
import type { VendorNeed, VendorQuestion } from "@/lib/send/needs";

export function VendorDesk({
  token,
  receivedAt,
  receivedName,
  slots,
  needs,
  questions,
}: {
  token: string;
  receivedAt?: string;
  receivedName?: string;
  slots: PacketSlot[];
  needs: VendorNeed[];
  questions: VendorQuestion[];
}) {
  const [name, setName] = useState(receivedName || "");
  const [done, setDone] = useState(Boolean(receivedAt));
  const [needRows, setNeedRows] = useState(needs);
  const [qs, setQs] = useState(questions);
  const [ask, setAsk] = useState("");
  const [slotNote, setSlotNote] = useState("");
  const [slotId, setSlotId] = useState(slots[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function post(body: Record<string, unknown>) {
    const res = await fetch(`/api/public/send/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not save");
    if (data.send?.needs) setNeedRows(data.send.needs);
    if (data.send?.questions) setQs(data.send.questions);
    if (data.send?.receivedAt) setDone(true);
    return data;
  }

  return (
    <div className="mt-10 space-y-6 print:hidden">
      <section className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-moss">Your desk</p>
        <label className="mt-3 block text-sm">
          Your name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block min-h-11 w-full rounded-full border border-line bg-paper px-4 text-sm"
          />
        </label>
        {!done ? (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await post({ action: "ack" });
                setMsg("They can see you have this.");
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "Could not save");
              } finally {
                setBusy(false);
              }
            }}
            className="mt-3 min-h-11 rounded-full bg-moss px-5 text-sm font-medium text-ivory disabled:opacity-50"
          >
            I have this
          </button>
        ) : (
          <p className="mt-3 text-sm text-moss">Marked received{name ? ` · ${name}` : ""}.</p>
        )}
      </section>

      {needRows.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-serif text-2xl">They still need</h2>
          <ul className="mt-3 space-y-3">
            {needRows.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={n.done}
                    onChange={async (e) => {
                      setBusy(true);
                      try {
                        await post({ action: "need", needId: n.id, done: e.target.checked });
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                  <span className={n.done ? "text-muted line-through" : ""}>{n.label}</span>
                </label>
                <label className="text-xs underline">
                  {n.fileName || "Attach"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setBusy(true);
                      try {
                        const form = new FormData();
                        form.append("file", file);
                        const up = await fetch(`/api/public/send/${token}/upload`, { method: "POST", body: form });
                        const data = await up.json();
                        if (!up.ok) throw new Error(data.error || "Upload failed");
                        await post({
                          action: "need",
                          needId: n.id,
                          done: true,
                          fileUrl: data.upload.url,
                          fileName: data.upload.name,
                        });
                      } catch (err) {
                        setMsg(err instanceof Error ? err.message : "Upload failed");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {slots.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-serif text-2xl">Confirm a cue</h2>
          <ul className="mt-3 space-y-2">
            {slots.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <span className="tabular-nums text-moss">{s.time}</span> {s.title}
                </span>
                <button
                  type="button"
                  className="underline"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await post({ action: "confirm", slotId: s.id });
                      setMsg(`Confirmed ${s.title}`);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Confirm
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <select
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              className="rounded-full border border-line px-3 py-2 text-sm"
            >
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.time} {s.title}
                </option>
              ))}
            </select>
            <input
              value={slotNote}
              onChange={(e) => setSlotNote(e.target.value)}
              placeholder="Note on that cue"
              className="min-h-11 flex-1 rounded-full border border-line px-4 text-sm"
            />
            <button
              type="button"
              disabled={!slotNote.trim() || !slotId}
              onClick={async () => {
                setBusy(true);
                try {
                  await post({ action: "comment", slotId, body: slotNote });
                  setSlotNote("");
                  setMsg("Note sent");
                } finally {
                  setBusy(false);
                }
              }}
              className="text-sm underline disabled:opacity-50"
            >
              Send note
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-serif text-2xl">Ask them one thing</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {qs.map((q) => (
            <li key={q.id}>
              <p>{q.body}</p>
              {q.answer ? <p className="text-xs text-moss">They said: {q.answer}</p> : <p className="text-xs text-muted">Waiting</p>}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="Load-in from the side gate?"
            className="min-h-11 flex-1 rounded-full border border-line px-4 text-sm"
          />
          <button
            type="button"
            disabled={!ask.trim() || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await post({ action: "question", body: ask });
                setAsk("");
              } finally {
                setBusy(false);
              }
            }}
            className="min-h-11 rounded-full bg-moss px-4 text-sm text-ivory disabled:opacity-50"
          >
            Ask
          </button>
        </div>
      </section>
      {msg && <p className="text-sm text-ink-soft">{msg}</p>}
    </div>
  );
}

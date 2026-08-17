"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { PacketView } from "@/components/send/PacketView";
import type { AssembledPacket } from "@/lib/send/assemble";
import { ATTACHMENTS, type AttachmentId } from "@/lib/send/attachments";

export function SendComposer({
  vendorId,
  packet,
  initialAttachments,
  initialNote,
  sharePath,
  lastSentAt,
  lastSentTo,
  emailedAt,
  receivedAt,
  emailConnected = false,
}: {
  vendorId: string;
  packet: AssembledPacket;
  initialAttachments: AttachmentId[];
  initialNote?: string;
  sharePath?: string | null;
  lastSentAt?: string;
  lastSentTo?: string;
  emailedAt?: string;
  receivedAt?: string;
  emailConnected?: boolean;
}) {
  const [on, setOn] = useState<AttachmentId[]>(initialAttachments);
  const [note, setNote] = useState(initialNote || "");
  const [email, setEmail] = useState(packet.vendor.email || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    if (sharePath) setLink(`${window.location.origin}${sharePath}`);
  }, [sharePath]);

  const readyCount = useMemo(
    () => packet.readiness.filter((r) => on.includes(r.id) && r.ready).length,
    [packet.readiness, on]
  );

  function toggle(id: AttachmentId) {
    setOn((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  async function submit(action: "save" | "send") {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          attachments: on,
          note,
          email,
          action,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send");
      if (data.sharePath) {
        setLink(`${window.location.origin}${data.sharePath}`);
      }
      if (action === "send") {
        if (data.emailed) setMsg(`Sent to ${data.sentTo || email}.`);
        else if (data.emailError) setMsg(`Link is ready. Email didn’t go: ${data.emailError}`);
        else setMsg("Link is ready. Copy it.");
      } else {
        setMsg("Saved.");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not send");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <aside className="space-y-5 print:hidden lg:sticky lg:top-6 lg:self-start">
        <div>
          <p className="kicker kicker-moss">Include</p>
          <p className="mt-1 text-xs text-muted">
            {readyCount} of {on.length} live
          </p>
        </div>
        <ul className="space-y-2">
          {packet.readiness.map((row) => {
            const checked = on.includes(row.id);
            return (
              <li key={row.id}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(row.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium">{row.label}</span>
                    <span className={`block text-xs ${row.ready ? "text-muted" : "text-clay"}`}>
                      {row.hint}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <label className="block text-sm">
          A note for them
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Load-in is the side gate. We’ll be in the oaks at 2."
            className="mt-1 w-full rounded-2xl border border-line bg-surface px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          Email {emailConnected ? "" : "— mail is off, copy the link"}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vendor@studio.com"
            className="field mt-1"
            disabled={!emailConnected}
          />
        </label>

        {packet.gaps.length > 0 && (
          <ul className="space-y-1 text-xs text-clay">
            {packet.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || on.length === 0}
            onClick={() => submit("send")}
            className="btn btn-primary"
          >
            {busy ? "Working…" : emailConnected && email ? "Send packet" : "Make their link"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => submit("save")}
            className="btn btn-ghost"
          >
            Save
          </button>
          {link ? <CopyButton value={link} label="Copy link" /> : null}
        </div>

        {msg && <p className="text-sm text-ink-soft">{msg}</p>}

        {link && (
          <div className="rounded-2xl border border-line bg-surface p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">Their link</p>
              <CopyButton value={link} />
            </div>
            <p className="mt-2 break-all text-xs text-muted">{link}</p>
            {lastSentAt && (
              <p className="mt-2 text-xs text-muted">
                Last sent {new Date(lastSentAt).toLocaleString(undefined, { month: "short", day: "numeric" })}
                {lastSentTo ? ` · ${lastSentTo}` : ""}
                {emailedAt ? " · emailed" : ""}
                {receivedAt ? " · they opened it" : ""}
              </p>
            )}
          </div>
        )}

        <p className="text-xs text-muted">
          Same link every time. Re-send after you change the room, the cues, or the kitchen.
        </p>
      </aside>

      <div className="rounded-[1.6rem] border border-line bg-surface px-5 py-6 sm:px-8">
        <p className="mb-4 kicker kicker-moss print:hidden">
          Preview · {on.map((id) => ATTACHMENTS[id].label).join(" · ")}
        </p>
        <PacketView packet={packet} attachments={on} note={note} />
      </div>
    </div>
  );
}

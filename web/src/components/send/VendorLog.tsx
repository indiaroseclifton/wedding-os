"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { sendStrip } from "@/lib/send/status";

type Line = { id: string; at: string; direction: "out" | "in"; body: string; emailedAt?: string };

export function VendorLog({
  vendorId,
  sendHref,
  initial,
}: {
  vendorId: string;
  sendHref: string;
  initial: Line[];
}) {
  const [rows, setRows] = useState(initial);
  const [line, setLine] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/send")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const send = (d?.sends || []).find((s: { vendorId: string }) => s.vendorId === vendorId);
        setLine(sendStrip(send).line);
      })
      .catch(() => {});
  }, [vendorId]);

  async function save(as: "note" | "email") {
    if (!body.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: as === "email" ? "email" : "note",
          body,
          direction: "out",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      if (data.vendor?.inquiries) setRows(data.vendor.inquiries);
      setBody("");
      if (as === "email") {
        const bits = [];
        if (data.emailedYou) bits.push("copy to you");
        if (data.emailedVendor) bits.push("sent");
        setMsg(bits.length ? bits.join(" · ") : data.emailError || "Saved");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Log</p>
          <p className="text-xs text-muted">{line || "Nothing sent yet — this fills when they use their page."}</p>
        </div>
        <Link href={sendHref} className="min-h-11 rounded-full bg-moss px-4 py-2 text-xs font-medium text-moss-fg">
          Their page
        </Link>
      </div>
      <ul className="space-y-2 text-sm">
        {rows.map((m) => (
          <li
            key={m.id}
            className={`rounded-lg px-3 py-2 ${m.direction === "in" ? "bg-moss/10" : "bg-paper"}`}
          >
            <p className="text-[11px] text-muted">
              {m.direction === "in" ? "Them" : "You"} · {m.at.slice(0, 10)}
              {m.emailedAt ? " · emailed" : ""}
            </p>
            <p className="whitespace-pre-wrap">{m.body}</p>
          </li>
        ))}
        {!rows.length && <li className="text-xs text-muted">Empty. Send the packet, or write them below.</li>}
      </ul>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="A note from you…"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => save("note")} className="text-xs underline disabled:opacity-50">
          Save note
        </button>
        <button type="button" disabled={busy || !body.trim()} onClick={() => save("email")} className="text-xs underline disabled:opacity-50">
          Email them
        </button>
      </div>
      {msg && <p className="text-xs text-ink-soft">{msg}</p>}
    </section>
  );
}

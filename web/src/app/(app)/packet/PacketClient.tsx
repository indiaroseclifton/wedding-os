"use client";

import { useMemo, useState } from "react";
import { PrintButton } from "@/components/ui/PrintButton";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

const SECTIONS = [
  { id: "ros", label: "Run of show" },
  { id: "seating", label: "Seating" },
  { id: "vendors", label: "Vendors" },
  { id: "dietary", label: "Dietary" },
] as const;

export function PacketClient({
  children,
  text,
  couple,
}: {
  children: React.ReactNode;
  text: string;
  couple: string;
}) {
  const [on, setOn] = useState<Record<string, boolean>>({
    ros: true,
    seating: true,
    vendors: true,
    dietary: true,
  });
  const [audience, setAudience] = useState("coordinator");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const hide = useMemo(
    () =>
      SECTIONS.filter((s) => !on[s.id])
        .map((s) => `[data-packet="${s.id}"]{display:none !important}`)
        .join(""),
    [on]
  );

  async function send() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/packet/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: `${couple} — day-of packet (${audience})`,
        text,
      }),
    });
    setBusy(false);
    setMsg(res.ok ? "Sent" : "Could not send — check Resend, or print instead.");
  }

  function changeAudience(value: string) {
    setAudience(value);
    if (value === "vendor") setOn({ ros: true, seating: false, vendors: true, dietary: true });
    else if (value === "party") setOn({ ros: true, seating: true, vendors: false, dietary: false });
    else setOn({ ros: true, seating: true, vendors: true, dietary: true });
  }

  return (
    <div className="space-y-6">
      <style>{hide}</style>
      <RoomSubnav room="day" />
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-serif text-4xl">Day-of packet</h1>
          <p className="mt-1 text-sm text-muted">Preview each role, trim the sections, then print or email the handoff.</p>
        </div>
        <PrintButton label="Print / PDF" />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
        <span className="kicker">Preview as</span>
        <select
          value={audience}
          onChange={(e) => changeAudience(e.target.value)}
          className="min-h-11 rounded-lg border border-line bg-paper px-3 text-sm"
          aria-label="Packet audience preview"
        >
          <option value="coordinator">Coordinator</option>
          <option value="vendor">Vendor</option>
          <option value="party">Wedding party</option>
        </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
        {SECTIONS.map((s) => (
          <label key={s.id} className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={on[s.id]}
              onChange={(e) => setOn((p) => ({ ...p, [s.id]: e.target.checked }))}
            />
            {s.label}
          </label>
        ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 print:hidden">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="coordinator@…"
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={busy || !email}
          onClick={send}
          className="btn btn-primary disabled:opacity-50"
        >
          Email packet
        </button>
        {msg && <p className="text-sm text-muted" aria-live="polite">{msg}</p>}
      </div>

      {children}
    </div>
  );
}

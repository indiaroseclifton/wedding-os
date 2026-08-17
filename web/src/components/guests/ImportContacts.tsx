"use client";

import { useState } from "react";

type Contact = { name: string; email?: string; phone?: string; address?: string };

function parseCsv(text: string): Contact[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(",").map((c) => c.trim().replace(/^"|"$/g, "")))
    .filter((cols) => cols[0] && cols[0].toLowerCase() !== "name")
    .map((cols) => ({ name: cols[0], email: cols[1], phone: cols[2], address: cols[3] }));
}

function parseVcard(text: string): Contact[] {
  const cards = text.split(/BEGIN:VCARD/i).slice(1);
  return cards
    .map((block) => {
      const fn = block.match(/^FN:(.+)$/im)?.[1]?.trim();
      const n = block.match(/^N:([^;]*);([^;]*)/im);
      const name = fn || (n ? `${n[2]} ${n[1]}`.trim() : "");
      const email = block.match(/^EMAIL[^:]*:(.+)$/im)?.[1]?.trim();
      const phone = block.match(/^TEL[^:]*:(.+)$/im)?.[1]?.trim();
      return { name, email, phone };
    })
    .filter((c) => c.name);
}

export function ImportContacts({ onImported }: { onImported?: () => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const picker =
    typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window;

  async function send(guests: Contact[]) {
    if (!guests.length) {
      setMsg("No contacts found");
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/guests/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guests }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Import failed");
      return;
    }
    setMsg(`Added ${data.added}${data.skipped ? ` · skipped ${data.skipped} already on the list` : ""}`);
    onImported?.();
  }

  async function fromPhone() {
    try {
      const nav = navigator as Navigator & {
        contacts?: { select: (p: string[], o: { multiple: boolean }) => Promise<Record<string, string[] | undefined>[]> };
      };
      const rows = await nav.contacts!.select(["name", "email", "tel", "address"], { multiple: true });
      await send(
        rows.map((r) => ({
          name: r.name?.[0] || "",
          email: r.email?.[0],
          phone: r.tel?.[0],
          address: r.address?.[0],
        })).filter((r) => r.name)
      );
    } catch {
      setMsg("Phone picker cancelled, or this browser doesn’t support it. Use a file instead.");
    }
  }

  async function fromFile(file: File) {
    const text = await file.text();
    const guests = file.name.endsWith(".vcf") || text.includes("BEGIN:VCARD") ? parseVcard(text) : parseCsv(text);
    await send(guests);
  }

  return (
    <div className="space-y-2 rounded-2xl border border-line bg-surface/60 p-4 text-sm">
      <p className="font-medium">Import contacts</p>
      <p className="text-xs text-muted">
        On Android Chrome you can pick people from your phone. Everywhere else, drop a Contacts .vcf or a CSV (name, email, phone).
      </p>
      <div className="flex flex-wrap gap-2">
        {picker && (
          <button type="button" disabled={busy} onClick={fromPhone} className="rounded-full bg-moss px-3 py-1.5 text-xs font-medium text-moss-fg">
            From this phone
          </button>
        )}
        <label className="cursor-pointer rounded-full border border-line px-3 py-1.5 text-xs font-medium">
          Upload CSV / vCard
          <input
            type="file"
            accept=".csv,.vcf,text/csv,text/vcard"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void fromFile(file);
            }}
          />
        </label>
      </div>
      {msg && <p className="text-xs text-moss">{msg}</p>}
    </div>
  );
}

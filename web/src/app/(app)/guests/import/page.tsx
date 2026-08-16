"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  return rows;
}

function mapHeader(h: string): string | null {
  const x = h.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["name", "guest", "fullname"].some((k) => x.includes(k))) return "name";
  if (x.includes("email")) return "email";
  if (x.includes("rsvp")) return "rsvp";
  if (x.includes("side") || x.includes("party")) return "side";
  if (x.includes("diet") || x.includes("allerg")) return "dietary";
  if (x.includes("plus") || x.includes("guestcount")) return "plusOnes";
  if (x.includes("note")) return "notes";
  if (x.includes("address") || x.includes("street")) return "address";
  if (x === "city") return "city";
  if (x.includes("state") || x.includes("region")) return "region";
  if (x.includes("zip") || x.includes("postal")) return "postal";
  if (x.includes("phone")) return "phone";
  if (x.includes("household") || x === "party" || x.includes("partyname")) return "partyName";
  return null;
}

export default function ImportGuestsPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onFile(file: File) {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const rows = parseCsv(text);
      if (rows.length < 2) {
        setError("Need a header row and at least one guest");
        return;
      }
      const headers = rows[0].map(mapHeader);
      if (!headers.includes("name")) {
        setError("Could not find a Name column");
        return;
      }
      const mapped = rows.slice(1).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((key, i) => {
          if (key && row[i] != null) obj[key] = row[i];
        });
        return obj;
      }).filter((r) => r.name);
      setPreview(mapped);
    };
    reader.readAsText(file);
  }

  async function importRows() {
    if (!preview?.length) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/guests/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guests: preview.map((r) => ({
            name: r.name,
            email: r.email,
            side: r.side || "OTHER",
            rsvp: (r.rsvp || "UNKNOWN").toUpperCase(),
            plusOnes: Number(r.plusOnes || 0) || 0,
            dietary: r.dietary,
            notes: r.notes,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Import failed");
      }
      router.push("/guests");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import guests</h1>
        <p className="mt-1 text-sm text-slate-600">
          CSV with a Name column. Email, RSVP, Side, Dietary, Plus-ones optional.
        </p>
      </div>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="block w-full text-sm"
      />
      {preview && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium">{preview.length} guests ready</p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-slate-600">
            {preview.slice(0, 20).map((r, i) => (
              <li key={i}>{r.name}</li>
            ))}
            {preview.length > 20 && <li>…and {preview.length - 20} more</li>}
          </ul>
          <button
            type="button"
            disabled={loading}
            onClick={importRows}
            className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Importing…" : "Import all"}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

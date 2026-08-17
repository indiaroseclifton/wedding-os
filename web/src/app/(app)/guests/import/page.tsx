"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

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
  if (x === "name" || x === "fullname" || x === "guest" || x === "guestname") return "name";
  if (x.includes("email")) return "email";
  if (x.includes("rsvp")) return "rsvp";
  if (x.includes("household") || x === "partyname" || x === "party" || x === "householdname") return "partyName";
  if (x === "side" || x === "sidea" || x === "whoside") return "side";
  if (x.includes("diet") || x.includes("allerg")) return "dietary";
  if (x.includes("plusonename") || x.includes("plusnames")) return "plusOneNames";
  if (x.includes("plus") || x === "guestcount" || x === "extras") return "plusOnes";
  if (x.includes("note")) return "notes";
  if (x.includes("address") || x.includes("street")) return "address";
  if (x === "city") return "city";
  if (x.includes("state") || x.includes("region")) return "region";
  if (x.includes("zip") || x.includes("postal")) return "postal";
  if (x.includes("phone") || x === "tel" || x === "mobile") return "phone";
  if (x === "meal" || x.includes("entree") || x.includes("dinner")) return "meal";
  if (x === "list" || x === "tier" || x === "ab" || x === "listtier" || x === "alist" || x === "blist") {
    return "listTier";
  }
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
            plusOneNames: r.plusOneNames,
            dietary: r.dietary,
            meal: r.meal,
            notes: r.notes,
            address: r.address,
            city: r.city,
            region: r.region,
            postal: r.postal,
            phone: r.phone,
            partyName: r.partyName,
            listTier: r.listTier,
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
      <RoomSubnav room="guests" />
      <div>
        <p className="kicker kicker-moss">Guests</p>
        <h1 className="title mt-2">Import guests</h1>
        <p className="deck mt-2">
          Name is required. Household, street, city, meal, and A/B list come through if the columns exist.
        </p>
      </div>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="field"
      />
      {preview && (
        <div className="glass-panel rounded-2xl p-5 text-sm">
          <p className="font-medium">{preview.length} guests ready</p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-ink-soft">
            {preview.slice(0, 20).map((r, i) => (
              <li key={i}>
                {r.name}
                {r.partyName ? ` · ${r.partyName}` : ""}
                {r.city ? ` · ${r.city}` : r.address ? ` · ${r.address}` : ""}
                {r.listTier ? ` · ${r.listTier}` : ""}
              </li>
            ))}
            {preview.length > 20 && <li>…and {preview.length - 20} more</li>}
          </ul>
          <button
            type="button"
            disabled={loading}
            onClick={importRows}
            className="btn btn-primary mt-4 w-full disabled:opacity-50"
          >
            {loading ? "Importing…" : "Import all"}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-clay">{error}</p>}
    </div>
  );
}

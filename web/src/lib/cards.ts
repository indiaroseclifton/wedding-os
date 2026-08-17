import type { StoredGuest } from "@/lib/data/store";

export type CardMode = "plates" | "holding";
export type CardKind = "escort" | "place";

export type CardRow = {
  id: string;
  guestId: string;
  name: string;
  table: string | null;
  seat: number | null;
  meal: string;
  rsvp: string;
  source: "guest" | "plus";
};

export type CardProof = {
  noTable: CardRow[];
  unnamedPlus: { guestId: string; name: string; missing: number }[];
};

export function inCardPool(g: Pick<StoredGuest, "rsvp">, mode: CardMode) {
  if (g.rsvp === "NO") return false;
  if (mode === "plates") return g.rsvp === "YES";
  return true;
}

function clean(s?: string | null) {
  return (s || "").trim();
}

export function mergeCards(guests: StoredGuest[], mode: CardMode) {
  const rows: CardRow[] = [];
  const unnamedPlus: CardProof["unnamedPlus"] = [];

  for (const g of guests) {
    if (!inCardPool(g, mode)) continue;
    const table = clean(g.tableLabel) || null;
    rows.push({
      id: g.id,
      guestId: g.id,
      name: clean(g.name) || "Guest",
      table,
      seat: g.seatIndex ?? null,
      meal: clean(g.meal),
      rsvp: g.rsvp,
      source: "guest",
    });
    const named = (g.plusOneNames || []).map(clean).filter(Boolean);
    const slots = Math.max(0, g.plusOnes || 0);
    named.forEach((plusName, i) => {
      rows.push({
        id: `${g.id}-plus-${i}`,
        guestId: g.id,
        name: plusName,
        table,
        seat: g.seatIndex != null ? g.seatIndex + 1 + i : null,
        meal: "",
        rsvp: g.rsvp,
        source: "plus",
      });
    });
    const missing = Math.max(0, slots - named.length);
    if (missing) unnamedPlus.push({ guestId: g.id, name: clean(g.name) || "Guest", missing });
  }

  const noTable = rows.filter((r) => !r.table);
  return { rows, proof: { noTable, unnamedPlus } };
}

export function sortCards(rows: CardRow[], kind: CardKind) {
  const copy = [...rows];
  if (kind === "escort") {
    copy.sort((a, b) => a.name.localeCompare(b.name) || (a.table || "").localeCompare(b.table || ""));
  } else {
    copy.sort(
      (a, b) =>
        (a.table || "zzz").localeCompare(b.table || "zzz") ||
        (a.seat ?? 99) - (b.seat ?? 99) ||
        a.name.localeCompare(b.name)
    );
  }
  return copy;
}

export function cardsCsv(rows: CardRow[]) {
  const header = "Name,Table,Seat,Meal,Rsvp";
  const body = rows.map((r) =>
    [r.name, r.table || "", r.seat != null ? String(r.seat + 1) : "", r.meal, r.rsvp]
      .map((c) => `"${c.replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...body].join("\n");
}

export function mealMark(meal: string) {
  const s = meal.toLowerCase();
  if (!s) return "";
  if (/\bvegan\b/.test(s)) return "VG";
  if (/vegetarian|veggie/.test(s)) return "V";
  if (/gluten|gf\b/.test(s)) return "GF";
  if (/pescatarian|fish/.test(s)) return "P";
  if (/kid|child/.test(s)) return "K";
  return meal.length <= 4 ? meal.toUpperCase() : meal.slice(0, 3).toUpperCase();
}

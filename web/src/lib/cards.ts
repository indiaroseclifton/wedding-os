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
  party: string;
  first: string;
  last: string;
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

function splitName(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { first: name, last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function mergeCards(guests: StoredGuest[], mode: CardMode) {
  const rows: CardRow[] = [];
  const unnamedPlus: CardProof["unnamedPlus"] = [];

  for (const g of guests) {
    if (!inCardPool(g, mode)) continue;
    const table = clean(g.tableLabel) || null;
    const party = clean(g.partyName) || clean(g.name);
    const guestName = clean(g.name) || "Guest";
    const guestParts = splitName(guestName);
    rows.push({
      id: g.id,
      guestId: g.id,
      name: guestName,
      table,
      seat: g.seatIndex ?? null,
      meal: clean(g.meal),
      rsvp: g.rsvp,
      source: "guest",
      party,
      first: guestParts.first,
      last: guestParts.last,
    });
    const named = (g.plusOneNames || []).map(clean).filter(Boolean);
    const slots = Math.max(0, g.plusOnes || 0);
    named.forEach((plusName, i) => {
      const parts = splitName(plusName);
      rows.push({
        id: `${g.id}-plus-${i}`,
        guestId: g.id,
        name: plusName,
        table,
        seat: g.seatIndex != null ? g.seatIndex + 1 + i : null,
        meal: "",
        rsvp: g.rsvp,
        source: "plus",
        party,
        first: parts.first,
        last: parts.last,
      });
    });
    const missing = Math.max(0, slots - named.length);
    if (missing) unnamedPlus.push({ guestId: g.id, name: guestName, missing });
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

function csvEscape(c: string) {
  return `"${c.replace(/"/g, '""')}"`;
}

export const CANVA_FIELDS = [
  { token: "{{Name}}", col: "Name", line: "Full name on the card" },
  { token: "{{First}}", col: "First", line: "First word" },
  { token: "{{Last}}", col: "Last", line: "The rest of the name" },
  { token: "{{Table}}", col: "Table", line: "Table 12" },
  { token: "{{Seat}}", col: "Seat", line: "Seat number, if you have one" },
  { token: "{{Meal}}", col: "Meal", line: "Kitchen mark" },
  { token: "{{Party}}", col: "Party", line: "Household" },
] as const;

export const CANVA_SIZES = [
  { id: "letter-8", label: "Letter · 8-up escort", size: "3.75\" × 2.5\"" },
  { id: "letter-tent", label: "Letter · tent", size: "3.75\" × 5\" (fold in half)" },
  { id: "avery-5302", label: "Avery 5302 tent", size: "2\" × 3.5\" · 4 per sheet" },
  { id: "avery-5371", label: "Avery 5371 / 8371", size: "2\" × 3.5\" · 10 per sheet" },
  { id: "menu", label: "Menu", size: "5\" × 7\" or 4.25\" × 9.5\"" },
  { id: "program", label: "Program", size: "5\" × 7\"" },
] as const;

export function cardsCsv(rows: CardRow[]) {
  const header = "Name,First,Last,Table,Seat,Meal,Party,Rsvp";
  const body = rows.map((r) =>
    [r.name, r.first, r.last, r.table || "", r.seat != null ? String(r.seat + 1) : "", r.meal, r.party, r.rsvp]
      .map(csvEscape)
      .join(",")
  );
  return [header, ...body].join("\n");
}

export function menuCsv(input: { names: string; date: string; heading?: string; courses?: string }) {
  const header = "Names,Date,Heading,Courses";
  const row = [input.names, input.date, input.heading || "Menu", (input.courses || "").replace(/\n/g, " · ")].map(csvEscape).join(",");
  return [header, row].join("\n");
}

export type PrintKind = "inkjet" | "laser";

export type PrintProfile = {
  kind: PrintKind;
  borderless: boolean;
  scale: number;
  offsetX: number;
  offsetY: number;
};

export const PRINT_KEY = "vowfolk-print";
export const PRINT_STEP = 1 / 16;

export function defaultPrint(): PrintProfile {
  return { kind: "inkjet", borderless: false, scale: 1, offsetX: 0, offsetY: 0 };
}

export function clampOffset(n: number) {
  if (!Number.isFinite(n)) return 0;
  const stepped = Math.round(n / PRINT_STEP) * PRINT_STEP;
  return Math.max(-0.5, Math.min(0.5, Math.round(stepped * 1000) / 1000));
}

export function formatOffset(n: number) {
  if (!n) return "0";
  const sixteenths = Math.round(n / PRINT_STEP);
  const sign = sixteenths > 0 ? "+" : "−";
  const abs = Math.abs(sixteenths);
  if (abs === 16) return `${sign}1″`;
  if (abs % 16 === 0) return `${sign}${abs / 16}″`;
  return `${sign}${abs}/16″`;
}

export function scaleFromMeasure(inches: number) {
  if (!Number.isFinite(inches) || inches < 1.5 || inches > 2.6) return 1;
  return Math.round((2 / inches) * 1000) / 1000;
}

export function pressAdvice(kind: PrintKind, stock: "letter" | "avery5302" | "avery5371" | "menu") {
  const lines = [
    "Scale: Actual size / 100%. Never Fit to page.",
    "Tray: manual or rear — the straightest path.",
    "Media: Labels, Heavyweight, or Cardstock.",
  ];
  if (kind === "inkjet") lines.push("Inkjet: let it dry before you cut. Don’t stack wet sheets.");
  if (kind === "laser") lines.push("Laser: only packs marked laser-safe. Heat warps some tents.");
  if (stock === "avery5302") lines.push("5302: one side first. Avery’s duplex flip ruins a box.");
  if (stock === "avery5371") lines.push("5371 / 8371: this side up, top-left of the sheet.");
  if (stock === "menu") lines.push("5×7 menu: borderless if you have it, or 2-up on letter and trim.");
  return lines;
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

import type { Stem } from "./floral-studio";

const ZONES: { match: RegExp; zone: string; frost: string }[] = [
  { match: /atlanta|savannah|charleston|austin|dallas|houston/i, zone: "8a", frost: "late March" },
  { match: /miami|tampa|orlando|honolulu/i, zone: "10b", frost: "almost never" },
  { match: /los angeles|san diego|phoenix/i, zone: "10a", frost: "rare" },
  { match: /san francisco|oakland|portland|seattle/i, zone: "9a", frost: "light" },
  { match: /new york|brooklyn|philadelphia|washington|dc|baltimore/i, zone: "7b", frost: "April" },
  { match: /boston|chicago|detroit|minneapolis|denver/i, zone: "6a", frost: "May" },
  { match: /nashville|charlotte|raleigh|richmond/i, zone: "7b", frost: "April" },
  { match: /new orleans|mobile|jacksonville/i, zone: "9a", frost: "rare" },
];

export function zoneForCity(city?: string) {
  if (!city) return { zone: "7b", frost: "April", city: "your city" };
  const hit = ZONES.find((z) => z.match.test(city));
  return { zone: hit?.zone || "7b", frost: hit?.frost || "April", city };
}

export function weddingMonth(date?: string) {
  if (!date || !/^\d{4}-\d{2}/.test(date)) return new Date().getMonth() + 1;
  return Number(date.slice(5, 7));
}

const MONTH_MAP: Record<string, number[]> = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  fall: [9, 10, 11],
  autumn: [9, 10, 11],
  winter: [12, 1, 2],
};

export function stemMonths(stem: Stem): number[] | "any" {
  if (stem.material === "silk" || stem.kind === "dried") return "any";
  const s = stem.season.toLowerCase();
  if (s.includes("year-round") || s.includes("anytime")) return "any";
  const months = new Set<number>();
  for (const [word, ms] of Object.entries(MONTH_MAP)) {
    if (s.includes(word)) ms.forEach((m) => months.add(m));
  }
  if (s.includes("late summer")) [7, 8, 9].forEach((m) => months.add(m));
  return months.size ? [...months] : "any";
}

export type SeasonFit = "in" | "stretch" | "out" | "silk" | "dried";

export function stemFit(stem: Stem, month: number): SeasonFit {
  if (stem.material === "silk") return "silk";
  if (stem.kind === "dried") return "dried";
  const months = stemMonths(stem);
  if (months === "any") return "in";
  if (months.includes(month)) return "in";
  const near = months.some((m) => Math.abs(m - month) === 1 || Math.abs(m - month) === 11);
  return near ? "stretch" : "out";
}

export function fitLabel(fit: SeasonFit) {
  if (fit === "silk") return "silk — anytime";
  if (fit === "dried") return "dried — anytime";
  if (fit === "in") return "in season";
  if (fit === "stretch") return "shoulder — pricey";
  return "off season — silk instead";
}

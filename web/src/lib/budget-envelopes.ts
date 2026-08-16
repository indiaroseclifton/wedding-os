/** Typical US wedding split. Percents add to 100. */
export const BUDGET_ENVELOPES = [
  { id: "Venue", pct: 25, hint: "Room, ceremony site, rentals" },
  { id: "Food", pct: 22, hint: "Catering, bar, cake" },
  { id: "Photo", pct: 12, hint: "Photographer and video" },
  { id: "Attire", pct: 8, hint: "Dress, suits, alterations" },
  { id: "Flowers", pct: 8, hint: "Florist or your own stems" },
  { id: "Music", pct: 8, hint: "DJ, band, ceremony" },
  { id: "Decor", pct: 7, hint: "Tables, lighting, signs" },
  { id: "Beauty", pct: 3, hint: "Hair and makeup" },
  { id: "Travel", pct: 3, hint: "Cars, hotel, shuttle" },
  { id: "Other", pct: 4, hint: "Tips, extras, a little buffer" },
] as const;

export type EnvelopeId = (typeof BUDGET_ENVELOPES)[number]["id"];

const PATH_TO_ENVELOPE: Record<string, EnvelopeId> = {
  flowers: "Flowers",
  tables: "Decor",
  signs: "Decor",
  lighting: "Decor",
  cake: "Food",
  backdrop: "Flowers",
  favors: "Other",
  photo: "Photo",
};

const VENDOR_HINTS: { re: RegExp; cat: EnvelopeId }[] = [
  { re: /venue|barn|estate|hall|garden/i, cat: "Venue" },
  { re: /cater|food|bar |bartender|cake|dessert/i, cat: "Food" },
  { re: /photo|video|film/i, cat: "Photo" },
  { re: /dress|suit|attire|alter/i, cat: "Attire" },
  { re: /flor|bloom|stem/i, cat: "Flowers" },
  { re: /dj|band|music|string/i, cat: "Music" },
  { re: /rental|linen|light|decor|sign/i, cat: "Decor" },
  { re: /hair|makeup|beauty|hmua/i, cat: "Beauty" },
  { re: /hotel|shuttle|limo|transport/i, cat: "Travel" },
];

export function envelopeForPath(pathId: string): EnvelopeId | null {
  return PATH_TO_ENVELOPE[pathId] || null;
}

export function envelopeForVendor(name: string): EnvelopeId {
  for (const h of VENDOR_HINTS) {
    if (h.re.test(name)) return h.cat;
  }
  return "Other";
}

export function money(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

export const SHAPES = ["us", "small", "weekend", "two"] as const;
export type WeddingShape = (typeof SHAPES)[number];

export const ENTER_WAYS = ["together", "one-then", "already", "none"] as const;
export type EnterHow = (typeof ENTER_WAYS)[number];

export type ShapeCard = {
  id: WeddingShape;
  title: string;
  line: string;
  cover: string;
};

export const SHAPE_CARDS: ShapeCard[] = [
  {
    id: "us",
    title: "Just us",
    line: "License, a witness, a photograph.",
    cover: "/brand/garden.jpg",
  },
  {
    id: "small",
    title: "A small room",
    line: "Under forty. One space.",
    cover: "/brand/setting.jpg",
  },
  {
    id: "weekend",
    title: "The whole weekend",
    line: "Ceremony, dinner, a night.",
    cover: "/brand/tablescape.jpg",
  },
  {
    id: "two",
    title: "Two days",
    line: "We marry. Then we gather.",
    cover: "/brand/paper.jpg",
  },
];

export const ENTER_CARDS: { id: EnterHow; title: string; line: string }[] = [
  { id: "together", title: "We walk in together", line: "No one is given away." },
  { id: "one-then", title: "One, then the other", line: "A last walk, if you want it." },
  { id: "already", title: "We’re already there", line: "Guests sit. You stand." },
  { id: "none", title: "No procession", line: "A circle, a clerk, a hillside." },
];

export function isShape(v: unknown): v is WeddingShape {
  return SHAPES.includes(v as WeddingShape);
}

export function isEnterHow(v: unknown): v is EnterHow {
  return ENTER_WAYS.includes(v as EnterHow);
}

export function shapeOf(v?: string | null): WeddingShape {
  return isShape(v) ? v : "weekend";
}

export function enterOf(v?: string | null): EnterHow {
  return isEnterHow(v) ? v : "one-then";
}

export function shapeCard(id?: string | null) {
  const s = shapeOf(id);
  return SHAPE_CARDS.find((c) => c.id === s) || SHAPE_CARDS[2];
}

/** Rooms that do not belong on this desk. */
export function hiddenHrefs(shape?: string | null): string[] {
  const s = shapeOf(shape);
  if (s === "us") {
    return ["/seating", "/floorplan", "/dietary", "/planning/party", "/party"];
  }
  if (s === "small") {
    return ["/planning/party"];
  }
  return [];
}

export function roomVisible(href: string, shape?: string | null) {
  return !hiddenHrefs(shape).some((h) => href === h || href.startsWith(h + "/"));
}

export function siteModeFor(shape?: string | null): "invite" | "announce" {
  return shapeOf(shape) === "us" ? "announce" : "invite";
}

export function nextShapeDate(weddingDate?: string, gatheringDate?: string) {
  const dates = [weddingDate, gatheringDate].filter(Boolean) as string[];
  if (!dates.length) return undefined;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = dates.filter((d) => d >= today).sort();
  return upcoming[0] || dates.sort().at(-1);
}

const PROCESSIONAL = new Set([
  "family_seating",
  "party_processional",
  "kids_processional",
  "processional",
]);

export function cueHidden(id: string, enter?: string | null, shape?: string | null) {
  const e = enterOf(enter);
  const s = shapeOf(shape);
  if (s === "us" && (id === "cocktail" || id === "grand_entrance" || id === "last_dance")) return true;
  if (e === "together") return id === "processional" || id === "party_processional" || id === "kids_processional";
  if (e === "already" || e === "none") return PROCESSIONAL.has(id);
  return false;
}

export function vendorCatsFor(shape?: string | null): string[] | null {
  const s = shapeOf(shape);
  if (s === "us") return ["Photographer", "Videographer", "Officiant", "Florist"];
  if (s === "small") {
    return ["Photographer", "Videographer", "Officiant", "Florist", "Catering", "Venue", "Cake"];
  }
  return null;
}

export function envelopesForShape(shape?: string | null) {
  const s = shapeOf(shape);
  if (s === "us") {
    return [
      { id: "Photo", pct: 35 },
      { id: "Travel", pct: 20 },
      { id: "Attire", pct: 15 },
      { id: "Food", pct: 12 },
      { id: "Flowers", pct: 8 },
      { id: "Other", pct: 10 },
    ];
  }
  if (s === "small") {
    return [
      { id: "Food", pct: 28 },
      { id: "Photo", pct: 20 },
      { id: "Venue", pct: 18 },
      { id: "Attire", pct: 10 },
      { id: "Flowers", pct: 8 },
      { id: "Decor", pct: 6 },
      { id: "Other", pct: 10 },
    ];
  }
  return null;
}

export function decisionHints(id: string, shape?: string | null, enter?: string | null) {
  if (id !== "first-look") return null;
  const e = enterOf(enter);
  if (shapeOf(shape) === "us" || e === "none" || e === "already") {
    return ["Yes — portraits before anyone else", "No — we see each other in the moment", "Private vow read"];
  }
  if (e === "together") {
    return ["Yes — quieter portraits first", "No — first time is walking in together", "Private vow read"];
  }
  return null;
}

export function skipDecisions(shape?: string | null) {
  const s = shapeOf(shape);
  if (s === "us") return new Set(["cocktail-where", "after-party", "kids", "party-size", "hotel-block", "shuttle", "first-dance", "parent-dances", "welcome-bags"]);
  if (s === "small") return new Set(["after-party"]);
  return new Set<string>();
}

import { COLOR_STORIES } from "@/lib/floral-studio";

export const VIBES = [
  "Romantic classic",
  "Modern minimal",
  "Garden / outdoor",
  "City chic",
  "Rustic warm",
  "Bold & colorful",
] as const;

export const FORMAL = ["Black tie", "Cocktail", "Garden party", "Casual", "Not sure"] as const;

export const MUSTS = ["Photos first", "Food first", "Dancing first", "Guest comfort", "Stay on budget"] as const;

export type VisionPin = {
  id: string;
  url: string;
  tag: string;
  why?: string;
};

export type VisionPalette = {
  hex: string[];
  story?: string;
};

export type VisionPayload = {
  vibe: string;
  formal: string;
  colors: string;
  palette?: VisionPalette;
  must: string[];
  avoid: string;
  notes: string;
  venueType?: string;
  feel: VisionPin[];
  reject: VisionPin[];
  story?: string;
  lockedAt?: string;
};

export const EMPTY_VISION: VisionPayload = {
  vibe: "",
  formal: "",
  colors: "",
  must: [],
  avoid: "",
  notes: "",
  feel: [],
  reject: [],
};

export type PairSide = {
  id: string;
  url: string;
  tag: string;
  label: string;
  vibe: (typeof VIBES)[number];
  story: string;
  formal?: (typeof FORMAL)[number];
};

export type VisionPair = {
  id: string;
  set: "Light" | "Place" | "Dress" | "Density";
  ask: string;
  left: PairSide;
  right: PairSide;
};

export const VISION_PAIRS: VisionPair[] = [
  {
    id: "light-1",
    set: "Light",
    ask: "Which light is yours?",
    left: {
      id: "linen-day",
      url: "/brand/vision/linen-day.jpg",
      tag: "light",
      label: "Daylight, linen",
      vibe: "Romantic classic",
      story: "linen",
    },
    right: {
      id: "candle-dusk",
      url: "/brand/vision/candle-dusk.jpg",
      tag: "light",
      label: "Candles, dusk",
      vibe: "Romantic classic",
      story: "midnight",
    },
  },
  {
    id: "light-2",
    set: "Light",
    ask: "A pale room, or a darker one?",
    left: {
      id: "gallery",
      url: "/brand/vision/gallery.jpg",
      tag: "light",
      label: "Gallery light",
      vibe: "Modern minimal",
      story: "coast",
    },
    right: {
      id: "home-dinner",
      url: "/brand/vision/home-dinner.jpg",
      tag: "light",
      label: "Low lamps",
      vibe: "Romantic classic",
      story: "linen",
    },
  },
  {
    id: "light-3",
    set: "Light",
    ask: "Paper and air, or gold and night?",
    left: {
      id: "paper-suite",
      url: "/brand/vision/paper-suite.jpg",
      tag: "paper",
      label: "Paper, daylight",
      vibe: "Modern minimal",
      story: "linen",
    },
    right: {
      id: "black-tie",
      url: "/brand/vision/black-tie.jpg",
      tag: "light",
      label: "Crystal, evening",
      vibe: "Romantic classic",
      story: "midnight",
      formal: "Black tie",
    },
  },
  {
    id: "place-1",
    set: "Place",
    ask: "Where does the table live?",
    left: {
      id: "aisle-trees",
      url: "/brand/vision/aisle-trees.jpg",
      tag: "place",
      label: "Under trees",
      vibe: "Garden / outdoor",
      story: "garden",
    },
    right: {
      id: "city-dining",
      url: "/brand/vision/city-dining.jpg",
      tag: "place",
      label: "A city room",
      vibe: "City chic",
      story: "coast",
    },
  },
  {
    id: "place-2",
    set: "Place",
    ask: "Outside wood, or a room you already have?",
    left: {
      id: "rustic-wood",
      url: "/brand/vision/rustic-wood.jpg",
      tag: "place",
      label: "Farm table",
      vibe: "Rustic warm",
      story: "citrus",
    },
    right: {
      id: "home-place",
      url: "/brand/vision/home-dinner.jpg",
      tag: "place",
      label: "At home",
      vibe: "Romantic classic",
      story: "linen",
    },
  },
  {
    id: "place-3",
    set: "Place",
    ask: "A backyard, or a long formal room?",
    left: {
      id: "backyard",
      url: "/brand/vision/backyard.jpg",
      tag: "place",
      label: "Backyard",
      vibe: "Garden / outdoor",
      story: "garden",
      formal: "Garden party",
    },
    right: {
      id: "gallery-place",
      url: "/brand/vision/gallery.jpg",
      tag: "place",
      label: "A long room",
      vibe: "Modern minimal",
      story: "coast",
    },
  },
  {
    id: "dress-1",
    set: "Dress",
    ask: "How dressed is the table?",
    left: {
      id: "black-tie-dress",
      url: "/brand/vision/black-tie.jpg",
      tag: "dress",
      label: "Black tie",
      vibe: "Romantic classic",
      story: "midnight",
      formal: "Black tie",
    },
    right: {
      id: "backyard-dress",
      url: "/brand/vision/backyard.jpg",
      tag: "dress",
      label: "Garden party",
      vibe: "Garden / outdoor",
      story: "garden",
      formal: "Garden party",
    },
  },
  {
    id: "dress-2",
    set: "Dress",
    ask: "Cocktail city, or Sunday casual?",
    left: {
      id: "city-dress",
      url: "/brand/vision/city-dining.jpg",
      tag: "dress",
      label: "Cocktail",
      vibe: "City chic",
      story: "coast",
      formal: "Cocktail",
    },
    right: {
      id: "rustic-dress",
      url: "/brand/vision/rustic-wood.jpg",
      tag: "dress",
      label: "Casual",
      vibe: "Rustic warm",
      story: "citrus",
      formal: "Casual",
    },
  },
  {
    id: "dress-3",
    set: "Dress",
    ask: "Heirloom china, or a spare modern plate?",
    left: {
      id: "home-dress",
      url: "/brand/vision/home-dinner.jpg",
      tag: "dress",
      label: "Heirloom",
      vibe: "Romantic classic",
      story: "linen",
      formal: "Cocktail",
    },
    right: {
      id: "one-bud-dress",
      url: "/brand/vision/one-bud.jpg",
      tag: "dress",
      label: "Spare",
      vibe: "Modern minimal",
      story: "coast",
      formal: "Cocktail",
    },
  },
  {
    id: "density-1",
    set: "Density",
    ask: "One flower, or the whole garden?",
    left: {
      id: "one-bud",
      url: "/brand/vision/one-bud.jpg",
      tag: "flower",
      label: "One stem",
      vibe: "Modern minimal",
      story: "coast",
    },
    right: {
      id: "garden-full",
      url: "/brand/vision/garden-full.jpg",
      tag: "flower",
      label: "Overflowing",
      vibe: "Garden / outdoor",
      story: "garden",
    },
  },
  {
    id: "density-2",
    set: "Density",
    ask: "A low bowl, or a packed dusk table?",
    left: {
      id: "linen-density",
      url: "/brand/vision/linen-day.jpg",
      tag: "table",
      label: "A low bowl",
      vibe: "Romantic classic",
      story: "linen",
    },
    right: {
      id: "candle-density",
      url: "/brand/vision/candle-dusk.jpg",
      tag: "table",
      label: "Packed dusk",
      vibe: "Bold & colorful",
      story: "midnight",
    },
  },
  {
    id: "density-3",
    set: "Density",
    ask: "A sculptural line, or a farm spread?",
    left: {
      id: "gallery-density",
      url: "/brand/vision/gallery.jpg",
      tag: "table",
      label: "Sculptural",
      vibe: "Modern minimal",
      story: "coast",
    },
    right: {
      id: "rustic-density",
      url: "/brand/vision/rustic-wood.jpg",
      tag: "table",
      label: "A spread",
      vibe: "Rustic warm",
      story: "citrus",
    },
  },
];

export function paletteForStory(story?: string): VisionPalette | undefined {
  if (!story) return undefined;
  const found = COLOR_STORIES.find((s) => s.id === story);
  if (!found) return undefined;
  return { hex: found.chips.map((c) => c.hex), story: found.id };
}

export function storyLabel(id?: string) {
  return COLOR_STORIES.find((s) => s.id === id)?.name || "";
}

export function normalizeVision(raw: unknown): VisionPayload {
  const p = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const vibe = typeof p.vibe === "string" ? p.vibe : "";
  const formal =
    typeof p.formal === "string" && p.formal
      ? p.formal
      : typeof p.formality === "string"
        ? p.formality
        : "";
  const mappedVibe =
    vibe === "Warm modern" ? "Garden / outdoor" : vibe === "Not sure yet" ? "" : vibe;
  const mappedFormal =
    formal === "Semi-formal" ? "Cocktail" : formal === "Not sure yet" ? "Not sure" : formal;
  let colors = typeof p.colors === "string" ? p.colors : "";
  let palette: VisionPalette | undefined;
  if (p.palette && typeof p.palette === "object") {
    const pal = p.palette as Record<string, unknown>;
    const hex = Array.isArray(pal.hex) ? pal.hex.filter((x): x is string => typeof x === "string") : [];
    palette = { hex, story: typeof pal.story === "string" ? pal.story : undefined };
    if (!colors && hex.length) colors = hex.join(" · ");
  }
  const feel = Array.isArray(p.feel) ? p.feel.filter(isPin) : [];
  const reject = Array.isArray(p.reject) ? p.reject.filter(isPin) : [];
  const must = Array.isArray(p.must) ? p.must.filter((x): x is string => typeof x === "string") : [];
  return {
    vibe: mappedVibe,
    formal: mappedFormal,
    colors,
    palette,
    must,
    avoid: typeof p.avoid === "string" ? p.avoid : "",
    notes: typeof p.notes === "string" ? p.notes : "",
    venueType: typeof p.venueType === "string" ? p.venueType : "",
    feel,
    reject,
    story: typeof p.story === "string" ? p.story : palette?.story,
    lockedAt: typeof p.lockedAt === "string" ? p.lockedAt : undefined,
  };
}

function isPin(x: unknown): x is VisionPin {
  if (!x || typeof x !== "object") return false;
  const p = x as Record<string, unknown>;
  return typeof p.id === "string" && typeof p.url === "string" && typeof p.tag === "string";
}

export function mergeVision(prev: VisionPayload, next: Partial<VisionPayload>): VisionPayload {
  return {
    vibe: next.vibe || prev.vibe,
    formal: next.formal || prev.formal,
    colors: next.colors || prev.colors,
    palette: next.palette?.hex?.length ? next.palette : prev.palette,
    must: next.must && (next.must.length || next.vibe) ? next.must : prev.must,
    avoid: next.vibe || (next.feel && next.feel.length) ? (next.avoid ?? "") : next.avoid || prev.avoid,
    notes: next.vibe || (next.feel && next.feel.length) ? (next.notes ?? "") : next.notes || prev.notes,
    venueType: next.venueType || prev.venueType,
    feel: next.feel && next.feel.length ? next.feel : prev.feel,
    reject: next.reject && next.reject.length ? next.reject : prev.reject,
    story: next.story || prev.story,
    lockedAt: next.lockedAt || prev.lockedAt,
  };
}

export function suggestFromSides(sides: PairSide[]) {
  const vibeScore = new Map<string, number>();
  const storyScore = new Map<string, number>();
  const formalScore = new Map<string, number>();
  for (const side of sides) {
    vibeScore.set(side.vibe, (vibeScore.get(side.vibe) || 0) + 1);
    storyScore.set(side.story, (storyScore.get(side.story) || 0) + 1);
    if (side.formal) formalScore.set(side.formal, (formalScore.get(side.formal) || 0) + 1);
  }
  const vibe = topKey(vibeScore) || "";
  const story = topKey(storyScore) || "";
  const formal = topKey(formalScore) || "";
  return { vibe, story, formal, palette: paletteForStory(story) };
}

function topKey(map: Map<string, number>) {
  let best = "";
  let n = 0;
  for (const [k, v] of map) {
    if (v > n) {
      best = k;
      n = v;
    }
  }
  return best;
}

export function visionSummary(v: VisionPayload) {
  return [v.vibe, v.formal].filter(Boolean).join(" · ") || "Vision still open";
}

export function colorsLine(v: VisionPayload) {
  if (v.palette?.hex.length) return v.palette.hex.join(" · ");
  return v.colors;
}

export const VENUES = [
  "Garden / outdoor",
  "Ballroom",
  "Barn / rustic",
  "Museum / gallery",
  "Restaurant / private dining",
  "Home / backyard",
  "Hotel",
  "Not sure",
] as const;

export function siteTemplateFor(story?: string): "letter" | "garden" | "midnight" {
  if (story === "midnight" || story === "ink-blush") return "midnight";
  if (story === "garden" || story === "citrus") return "garden";
  return "letter";
}

export const HOUSE_LIBRARY = uniqueSides(VISION_PAIRS);

function uniqueSides(pairs: VisionPair[]) {
  const seen = new Set<string>();
  const out: PairSide[] = [];
  for (const p of pairs) {
    for (const s of [p.left, p.right]) {
      if (seen.has(s.url)) continue;
      seen.add(s.url);
      out.push(s);
    }
  }
  return out;
}

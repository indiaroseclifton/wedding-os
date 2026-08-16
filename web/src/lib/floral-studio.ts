export type StemKind = "face" | "filler" | "green" | "dried";

export type Stem = {
  id: string;
  name: string;
  latin: string;
  kind: StemKind;
  stories: string[];
  hardy: "yes" | "careful" | "no";
  season: string;
  estEach: number;
  note: string;
  photo: string;
  tint: string;
};

export type Vessel = {
  id: string;
  name: string;
  forWhat: string;
  typical: number;
  photo: string;
};

export type ColorStory = {
  id: string;
  name: string;
  line: string;
  when: string;
  chips: { name: string; hex: string; role: "face" | "accent" | "green" | "ground" }[];
};

export type PlacedStem = {
  id: string;
  stemId: string;
  x: number;
  y: number;
  rot: number;
  scale: number;
  z: number;
};

export type FloralLook = {
  id: string;
  title: string;
  vessel: string;
  story: string;
  photo: string;
  why: string;
  recipe: { stemId: string; count: number }[];
};

export const COLOR_STORIES: ColorStory[] = [
  {
    id: "linen",
    name: "Linen",
    line: "Cream, blush, silver green.",
    when: "Daylight, paper suites, a room that is already warm.",
    chips: [
      { name: "Ivory", hex: "#f4efe6", role: "ground" },
      { name: "Blush", hex: "#e8c9b8", role: "face" },
      { name: "Dusty rose", hex: "#c98986", role: "accent" },
      { name: "Silver euc", hex: "#8a9a86", role: "green" },
    ],
  },
  {
    id: "garden",
    name: "Garden",
    line: "White, butter, olive.",
    when: "Outdoors, late afternoon, you want it to look picked, not designed.",
    chips: [
      { name: "Paper white", hex: "#f7f4ec", role: "ground" },
      { name: "Butter", hex: "#e8d9a8", role: "face" },
      { name: "Soft apricot", hex: "#e2b07a", role: "accent" },
      { name: "Olive", hex: "#5c6b4a", role: "green" },
    ],
  },
  {
    id: "midnight",
    name: "Midnight",
    line: "Burgundy, ink, dried wheat.",
    when: "Evening, candles, a fall or winter date.",
    chips: [
      { name: "Ink", hex: "#1c1917", role: "ground" },
      { name: "Burgundy", hex: "#4a1520", role: "face" },
      { name: "Oxblood", hex: "#6b2430", role: "accent" },
      { name: "Wheat", hex: "#c4b08a", role: "green" },
    ],
  },
  {
    id: "citrus",
    name: "Citrus",
    line: "Apricot, yellow, rust.",
    when: "Late summer, terracotta, a table that can take color.",
    chips: [
      { name: "Cream clay", hex: "#f3e6d4", role: "ground" },
      { name: "Apricot", hex: "#f3c27a", role: "face" },
      { name: "Rust", hex: "#e07a3d", role: "accent" },
      { name: "Dried leaf", hex: "#7a3b1e", role: "green" },
    ],
  },
  {
    id: "coast",
    name: "Coast",
    line: "White, fog, sea glass.",
    when: "A pale room, blue stone, or anything near water.",
    chips: [
      { name: "Fog", hex: "#e8ece8", role: "ground" },
      { name: "White", hex: "#f8f6f1", role: "face" },
      { name: "Sea glass", hex: "#8aa39a", role: "accent" },
      { name: "Sage", hex: "#6d7f6e", role: "green" },
    ],
  },
  {
    id: "ink-blush",
    name: "Ink & blush",
    line: "Black-green, pale pink, one dark face.",
    when: "You want contrast without going full midnight.",
    chips: [
      { name: "Stone", hex: "#ece6dc", role: "ground" },
      { name: "Blush", hex: "#e4b7b0", role: "face" },
      { name: "Deep rose", hex: "#8c3d4a", role: "accent" },
      { name: "Near-black green", hex: "#2c332c", role: "green" },
    ],
  },
];

export const STEMS: Stem[] = [
  {
    id: "garden-rose",
    name: "Garden rose",
    latin: "Rosa",
    kind: "face",
    stories: ["linen", "garden", "coast", "ink-blush"],
    hardy: "careful",
    season: "Year-round (best spring–fall)",
    estEach: 3.5,
    note: "The face of the bouquet. Buy extras — they bruise.",
    photo: "/brand/flowers.jpg",
    tint: "hue-rotate-[-8deg] saturate-110",
  },
  {
    id: "ranunculus",
    name: "Ranunculus",
    latin: "Ranunculus asiaticus",
    kind: "face",
    stories: ["linen", "garden", "citrus", "coast"],
    hardy: "careful",
    season: "Winter–spring",
    estEach: 2.25,
    note: "Paper petals. Hydrate overnight, keep cool.",
    photo: "/brand/flowers.jpg",
    tint: "brightness-110 contrast-95",
  },
  {
    id: "lisianthus",
    name: "Lisianthus",
    latin: "Eustoma",
    kind: "face",
    stories: ["linen", "garden", "coast"],
    hardy: "yes",
    season: "Summer–fall",
    estEach: 2,
    note: "Ruffled, lasts. Good grocery find.",
    photo: "/brand/setting.jpg",
    tint: "saturate-75",
  },
  {
    id: "dahlia",
    name: "Dahlia",
    latin: "Dahlia",
    kind: "face",
    stories: ["midnight", "citrus", "ink-blush"],
    hardy: "no",
    season: "Late summer–fall",
    estEach: 4,
    note: "Drama. Doesn’t travel heat. Local farm only.",
    photo: "/brand/candles.jpg",
    tint: "hue-rotate-[330deg] saturate-140",
  },
  {
    id: "spray-rose",
    name: "Spray rose",
    latin: "Rosa",
    kind: "filler",
    stories: ["linen", "garden", "citrus"],
    hardy: "yes",
    season: "Year-round",
    estEach: 1.5,
    note: "Fills gaps. One stem = many heads.",
    photo: "/brand/flowers.jpg",
    tint: "brightness-105",
  },
  {
    id: "stock",
    name: "Stock",
    latin: "Matthiola",
    kind: "filler",
    stories: ["linen", "garden"],
    hardy: "yes",
    season: "Spring",
    estEach: 1.75,
    note: "Scent. Use sparingly if anyone is perfume-sensitive.",
    photo: "/brand/garden.jpg",
    tint: "saturate-80",
  },
  {
    id: "eucalyptus",
    name: "Silver dollar eucalyptus",
    latin: "E. cinerea",
    kind: "green",
    stories: ["linen", "garden", "midnight", "coast", "ink-blush"],
    hardy: "yes",
    season: "Year-round",
    estEach: 1.25,
    note: "The backbone. Buy a day early — it drinks.",
    photo: "/brand/garden.jpg",
    tint: "hue-rotate-[80deg] saturate-60",
  },
  {
    id: "olive",
    name: "Olive branch",
    latin: "Olea",
    kind: "green",
    stories: ["garden", "linen", "coast"],
    hardy: "yes",
    season: "Year-round",
    estEach: 2,
    note: "Mediterranean tables. Lasts out of water a while.",
    photo: "/brand/garden.jpg",
    tint: "hue-rotate-[50deg] saturate-70 brightness-95",
  },
  {
    id: "ruscus",
    name: "Italian ruscus",
    latin: "Danae racemosa",
    kind: "green",
    stories: ["linen", "midnight", "garden"],
    hardy: "yes",
    season: "Year-round",
    estEach: 1.1,
    note: "Cheap, drapes, hides tape.",
    photo: "/brand/garden.jpg",
    tint: "hue-rotate-[90deg] saturate-50",
  },
  {
    id: "bunny",
    name: "Bunny tail",
    latin: "Lagurus",
    kind: "dried",
    stories: ["linen", "midnight", "citrus"],
    hardy: "yes",
    season: "Dried — anytime",
    estEach: 0.4,
    note: "No water. Do not refrigerate with fresh.",
    photo: "/brand/tablescape.jpg",
    tint: "sepia saturate-50",
  },
  {
    id: "pampas",
    name: "Small pampas",
    latin: "Cortaderia",
    kind: "dried",
    stories: ["midnight", "citrus"],
    hardy: "yes",
    season: "Dried",
    estEach: 1.8,
    note: "Hairspray the fluff. Keep away from tapers.",
    photo: "/brand/tablescape.jpg",
    tint: "sepia brightness-110",
  },
  {
    id: "babies",
    name: "Baby’s breath",
    latin: "Gypsophila",
    kind: "filler",
    stories: ["linen", "midnight", "coast"],
    hardy: "yes",
    season: "Year-round",
    estEach: 0.9,
    note: "Cloud, or skip if it reads ‘prom 2004’ to you.",
    photo: "/brand/setting.jpg",
    tint: "grayscale-[0.3] brightness-110",
  },
];

export const VESSELS: Vessel[] = [
  { id: "bouquet", name: "Hand bouquet", forWhat: "You, or the party", typical: 32, photo: "/brand/flowers.jpg" },
  { id: "bowl", name: "Low bowl", forWhat: "Guest table — they can talk over it", typical: 18, photo: "/brand/tablescape.jpg" },
  { id: "buds", name: "Bud vases (3)", forWhat: "Farm table, cheaper than one bowl", typical: 9, photo: "/brand/setting.jpg" },
  { id: "bout", name: "Boutonniere", forWhat: "One pin", typical: 3, photo: "/brand/garden.jpg" },
];

export const LOOKS: FloralLook[] = [
  {
    id: "linen-hand",
    title: "Linen hand-tie",
    vessel: "bouquet",
    story: "linen",
    photo: "/brand/flowers.jpg",
    why: "Garden roses + ranunculus + eucalyptus. The one you see on every moodboard, because it works.",
    recipe: [
      { stemId: "garden-rose", count: 7 },
      { stemId: "ranunculus", count: 8 },
      { stemId: "spray-rose", count: 5 },
      { stemId: "eucalyptus", count: 6 },
      { stemId: "lisianthus", count: 4 },
    ],
  },
  {
    id: "talk-over",
    title: "Talk-over bowl",
    vessel: "bowl",
    story: "garden",
    photo: "/brand/tablescape.jpg",
    why: "Low enough for conversation. Hardy greens so it survives a warm room.",
    recipe: [
      { stemId: "lisianthus", count: 5 },
      { stemId: "spray-rose", count: 4 },
      { stemId: "eucalyptus", count: 4 },
      { stemId: "olive", count: 3 },
      { stemId: "bunny", count: 4 },
    ],
  },
  {
    id: "three-vases",
    title: "Three little vases",
    vessel: "buds",
    story: "citrus",
    photo: "/brand/setting.jpg",
    why: "Grocery flowers, three bottles, votives. The honest DIY table.",
    recipe: [
      { stemId: "ranunculus", count: 3 },
      { stemId: "spray-rose", count: 3 },
      { stemId: "ruscus", count: 3 },
    ],
  },
  {
    id: "ink",
    title: "Ink + wheat",
    vessel: "bowl",
    story: "midnight",
    photo: "/brand/candles.jpg",
    why: "Dahlias if you can get them local. Dried if you can’t.",
    recipe: [
      { stemId: "dahlia", count: 5 },
      { stemId: "eucalyptus", count: 4 },
      { stemId: "pampas", count: 3 },
      { stemId: "bunny", count: 5 },
    ],
  },
];

export function stemById(id: string) {
  return STEMS.find((s) => s.id === id);
}

export function layoutRecipe(recipe: FloralLook["recipe"]): PlacedStem[] {
  const pieces: PlacedStem[] = [];
  let i = 0;
  const total = recipe.reduce((s, r) => s + r.count, 0) || 1;
  for (const row of recipe) {
    for (let n = 0; n < row.count; n++) {
      const t = i / total;
      const ang = t * Math.PI * 2;
      const r = 12 + (i % 4) * 4;
      pieces.push({
        id: `p${i}`,
        stemId: row.stemId,
        x: 50 + r * Math.cos(ang),
        y: 42 + r * Math.sin(ang) * 0.75,
        rot: (i * 23) % 360,
        scale: 0.85 + (i % 3) * 0.12,
        z: i,
      });
      i += 1;
    }
  }
  return pieces;
}

export function rollup(pieces: PlacedStem[]) {
  const map = new Map<string, number>();
  for (const p of pieces) map.set(p.stemId, (map.get(p.stemId) || 0) + 1);
  const lines = [...map.entries()].map(([stemId, count]) => {
    const stem = stemById(stemId);
    return {
      stemId,
      name: stem?.name || stemId,
      count,
      est: (stem?.estEach || 0) * count,
    };
  });
  return {
    lines,
    stems: pieces.length,
    est: lines.reduce((s, l) => s + l.est, 0),
  };
}

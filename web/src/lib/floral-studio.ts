export type StemKind = "face" | "filler" | "green" | "dried";
export type StemMaterial = "fresh" | "silk";

export type Stem = {
  id: string;
  name: string;
  latin: string;
  kind: StemKind;
  material: StemMaterial;
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
    material: "fresh",
    stories: ["linen", "garden", "coast", "ink-blush"],
    hardy: "careful",
    season: "Year-round (best spring–fall)",
    estEach: 3.5,
    note: "The face of the bouquet. Buy extras — they bruise.",
    photo: "/diy/floral/rose.jpg",
    tint: "",
  },
  {
    id: "ranunculus",
    name: "Ranunculus",
    latin: "Ranunculus asiaticus",
    kind: "face",
    material: "fresh",
    stories: ["linen", "garden", "citrus", "coast"],
    hardy: "careful",
    season: "Winter–spring",
    estEach: 2.25,
    note: "Paper petals. Hydrate overnight, keep cool.",
    photo: "/diy/floral/ranunculus.jpg",
    tint: "",
  },
  {
    id: "lisianthus",
    name: "Lisianthus",
    latin: "Eustoma",
    kind: "face",
    material: "fresh",
    stories: ["linen", "garden", "coast"],
    hardy: "yes",
    season: "Summer–fall",
    estEach: 2,
    note: "Ruffled, lasts. Good grocery find.",
    photo: "/diy/floral/lisianthus.jpg",
    tint: "",
  },
  {
    id: "dahlia",
    name: "Dahlia",
    latin: "Dahlia",
    kind: "face",
    material: "fresh",
    stories: ["midnight", "citrus", "ink-blush"],
    hardy: "no",
    season: "Late summer–fall",
    estEach: 4,
    note: "Drama. Doesn’t travel heat. Local farm only.",
    photo: "/diy/floral/dahlia.jpg",
    tint: "",
  },
  {
    id: "spray-rose",
    name: "Spray rose",
    latin: "Rosa",
    kind: "filler",
    material: "fresh",
    stories: ["linen", "garden", "citrus"],
    hardy: "yes",
    season: "Year-round",
    estEach: 1.5,
    note: "Fills gaps. One stem = many heads.",
    photo: "/diy/floral/spray.jpg",
    tint: "",
  },
  {
    id: "stock",
    name: "Stock",
    latin: "Matthiola",
    kind: "filler",
    material: "fresh",
    stories: ["linen", "garden"],
    hardy: "yes",
    season: "Spring",
    estEach: 1.75,
    note: "Scent. Use sparingly if anyone is perfume-sensitive.",
    photo: "/diy/floral/stock.jpg",
    tint: "",
  },
  {
    id: "eucalyptus",
    name: "Silver dollar eucalyptus",
    latin: "E. cinerea",
    kind: "green",
    material: "fresh",
    stories: ["linen", "garden", "midnight", "coast", "ink-blush"],
    hardy: "yes",
    season: "Year-round",
    estEach: 1.25,
    note: "The backbone. Buy a day early — it drinks.",
    photo: "/diy/floral/eucalyptus.jpg",
    tint: "",
  },
  {
    id: "olive",
    name: "Olive branch",
    latin: "Olea",
    kind: "green",
    material: "fresh",
    stories: ["garden", "linen", "coast"],
    hardy: "yes",
    season: "Year-round",
    estEach: 2,
    note: "Mediterranean tables. Lasts out of water a while.",
    photo: "/diy/floral/olive.jpg",
    tint: "",
  },
  {
    id: "ruscus",
    name: "Italian ruscus",
    latin: "Danae racemosa",
    kind: "green",
    material: "fresh",
    stories: ["linen", "midnight", "garden"],
    hardy: "yes",
    season: "Year-round",
    estEach: 1.1,
    note: "Cheap, drapes, hides tape.",
    photo: "/diy/floral/ruscus.jpg",
    tint: "",
  },
  {
    id: "bunny",
    name: "Bunny tail",
    latin: "Lagurus",
    kind: "dried",
    material: "fresh",
    stories: ["linen", "midnight", "citrus"],
    hardy: "yes",
    season: "Dried — anytime",
    estEach: 0.4,
    note: "No water. Do not refrigerate with fresh.",
    photo: "/diy/floral/bunny.jpg",
    tint: "",
  },
  {
    id: "pampas",
    name: "Small pampas",
    latin: "Cortaderia",
    kind: "dried",
    material: "fresh",
    stories: ["midnight", "citrus"],
    hardy: "yes",
    season: "Dried",
    estEach: 1.8,
    note: "Hairspray the fluff. Keep away from tapers.",
    photo: "/diy/floral/pampas.jpg",
    tint: "",
  },
  {
    id: "babies",
    name: "Baby’s breath",
    latin: "Gypsophila",
    kind: "filler",
    material: "fresh",
    stories: ["linen", "midnight", "coast"],
    hardy: "yes",
    season: "Year-round",
    estEach: 0.9,
    note: "Cloud, or skip if it reads ‘prom 2004’ to you.",
    photo: "/diy/floral/babies.jpg",
    tint: "",
  },
  {
    id: "silk-rose",
    name: "Garden rose",
    latin: "Silk",
    kind: "face",
    material: "silk",
    stories: ["linen", "garden", "coast", "ink-blush"],
    hardy: "yes",
    season: "Buy anytime — keep out of sun",
    estEach: 6.5,
    note: "Real-touch. Costs more once, reusable, no fridge. Mix with fresh eucalyptus.",
    photo: "/diy/floral/rose.jpg",
    tint: "saturate-75",
  },
  {
    id: "silk-ranunculus",
    name: "Ranunculus",
    latin: "Silk",
    kind: "face",
    material: "silk",
    stories: ["linen", "garden", "citrus", "coast"],
    hardy: "yes",
    season: "Anytime",
    estEach: 4.25,
    note: "The paper look without the wilt. Good for cake table and heat.",
    photo: "/diy/floral/ranunculus.jpg",
    tint: "saturate-75",
  },
  {
    id: "silk-lisianthus",
    name: "Lisianthus",
    latin: "Silk",
    kind: "face",
    material: "silk",
    stories: ["linen", "garden", "coast"],
    hardy: "yes",
    season: "Anytime",
    estEach: 3.75,
    note: "Ruffles that survive a hot tent.",
    photo: "/diy/floral/lisianthus.jpg",
    tint: "saturate-75",
  },
  {
    id: "silk-dahlia",
    name: "Dahlia",
    latin: "Silk",
    kind: "face",
    material: "silk",
    stories: ["midnight", "citrus", "ink-blush"],
    hardy: "yes",
    season: "Anytime",
    estEach: 7,
    note: "Real dahlias die in a day of heat. Silk is how DIY midnight works in July.",
    photo: "/diy/floral/dahlia.jpg",
    tint: "saturate-80",
  },
  {
    id: "silk-spray",
    name: "Spray rose",
    latin: "Silk",
    kind: "filler",
    material: "silk",
    stories: ["linen", "garden", "citrus"],
    hardy: "yes",
    season: "Anytime",
    estEach: 3.25,
    note: "Filler you can pack in a suitcase.",
    photo: "/diy/floral/spray.jpg",
    tint: "saturate-75",
  },
  {
    id: "silk-euc",
    name: "Eucalyptus",
    latin: "Silk",
    kind: "green",
    material: "silk",
    stories: ["linen", "garden", "midnight", "coast", "ink-blush"],
    hardy: "yes",
    season: "Anytime",
    estEach: 2.75,
    note: "If you have no cooler, silk greens + a few fresh faces.",
    photo: "/diy/floral/eucalyptus.jpg",
    tint: "saturate-70",
  },
  {
    id: "silk-olive",
    name: "Olive branch",
    latin: "Silk",
    kind: "green",
    material: "silk",
    stories: ["garden", "linen", "coast"],
    hardy: "yes",
    season: "Anytime",
    estEach: 3.5,
    note: "Hangs on an arch for days. Dust it.",
    photo: "/diy/floral/olive.jpg",
    tint: "saturate-70",
  },
  {
    id: "silk-babies",
    name: "Baby’s breath",
    latin: "Silk",
    kind: "filler",
    material: "silk",
    stories: ["linen", "midnight", "coast"],
    hardy: "yes",
    season: "Anytime",
    estEach: 2.2,
    note: "Cloud that does not shed as badly as the real one.",
    photo: "/diy/floral/babies.jpg",
    tint: "saturate-70",
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
  {
    id: "heat-proof",
    title: "All silk, heat-proof",
    vessel: "bowl",
    story: "linen",
    photo: "/brand/tablescape.jpg",
    why: "No cooler, outdoor July, or you want to set tables the night before.",
    recipe: [
      { stemId: "silk-rose", count: 5 },
      { stemId: "silk-ranunculus", count: 4 },
      { stemId: "silk-euc", count: 5 },
      { stemId: "silk-lisianthus", count: 3 },
    ],
  },
  {
    id: "mix-honest",
    title: "Silk faces, real greens",
    vessel: "bouquet",
    story: "garden",
    photo: "/brand/flowers.jpg",
    why: "The florist trick: cheap hardy eucalyptus and olive, silk roses so the bouquet doesn’t collapse.",
    recipe: [
      { stemId: "silk-rose", count: 6 },
      { stemId: "silk-ranunculus", count: 4 },
      { stemId: "eucalyptus", count: 6 },
      { stemId: "olive", count: 3 },
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
      name: stem ? `${stem.name}${stem.material === "silk" ? " (silk)" : ""}` : stemId,
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

export type DecorTrend = {
  id: string;
  name: string;
  year: string;
  line: string;
  why: string;
  diy: string;
  hire: string;
  skip: string;
  palette: string;
  tools: { href: string; label: string }[];
  photo: string;
  tags: string[];
  price: {
    unit: "wedding" | "table" | "each";
    diyLow: number;
    diyHigh: number;
    hireLow: number;
    hireHigh: number;
    note: string;
  };
};

export const DECOR_TRENDS: DecorTrend[] = [
  {
    id: "meadow",
    name: "Meadow, not mound",
    year: "2026",
    line: "Florals leave the bowl and run down the aisle.",
    why: "Tight round centerpieces read dated. Loose, low, a bit messy — that’s what magazines are shooting.",
    diy: "Skip the arch. Line the aisle with bud vases and leftover stems on the ground. After the ceremony, move them to the tables.",
    hire: "Hanging installs and anything over a doorway. That’s a lift and insurance.",
    skip: "A foam-heavy ‘garden wall’ from a party store.",
    palette: "garden",
    tools: [
      { href: "/diy/studio/floral", label: "Floral studio" },
      { href: "/diy/flowers", label: "Flowers playbook" },
    ],
    photo: "/brand/garden.jpg",
    tags: ["flowers", "ceremony", "diy-friendly"],
    price: {
      unit: "wedding",
      diyLow: 180,
      diyHigh: 420,
      hireLow: 2200,
      hireHigh: 7500,
      note: "Bud vases + grocery/wholesale stems for one aisle. Hire is a meadow install.",
    },
  },
  {
    id: "fruit",
    name: "Fruit on the table",
    year: "2026",
    line: "Peaches, grapes, pomegranates — not just flowers.",
    why: "Produce is cheap, scented, and photographs like a still life. The Knot is still on it this year.",
    diy: "Buy stone fruit the morning of. Mix with olive and a few silk faces so it doesn’t look like a grocery run.",
    hire: "If you want grapes draped from a chandelier.",
    skip: "Plastic fruit. Everyone can tell.",
    palette: "citrus",
    tools: [
      { href: "/diy/studio/table", label: "Tablescape" },
      { href: "/diy/studio/floral", label: "Floral studio" },
    ],
    photo: "/brand/tablescape.jpg",
    tags: ["table", "diy-friendly", "budget"],
    price: {
      unit: "table",
      diyLow: 12,
      diyHigh: 28,
      hireLow: 45,
      hireHigh: 90,
      note: "Stone fruit + a few stems the morning of. Hire is a styled produce tablescape.",
    },
  },
  {
    id: "linen-first",
    name: "Linen is the flower",
    year: "2026",
    line: "Texture first: velvet, gauze, a runner that pools.",
    why: "Planners are starting with the cloth, then adding almost no stems. Cheaper than a florist if you rent well.",
    diy: "One good runner per farm table + tapers. Leave the center empty enough to talk.",
    hire: "Draping a ceiling or tent. Fabric in the air is a pro job.",
    skip: "Shiny polyester from a party pack.",
    palette: "linen",
    tools: [
      { href: "/diy/studio/table", label: "Tablescape" },
      { href: "/diy/table-decor", label: "Table playbook" },
    ],
    photo: "/brand/tablescape.jpg",
    tags: ["table", "diy-friendly"],
    price: {
      unit: "table",
      diyLow: 18,
      diyHigh: 40,
      hireLow: 55,
      hireHigh: 120,
      note: "Runner or gauze you keep + tapers. Hire includes linen rental and place.",
    },
  },
  {
    id: "lamps",
    name: "Little lamps, not just tapers",
    year: "2026",
    line: "Cordless mini lamps + clusters of candles.",
    why: "Venues hate open flame. A small lamp feels like a house, not a banquet.",
    diy: "Four rechargeable lamps, mixed votives. Test the color temperature — warm only.",
    hire: "If you want the whole room on a dimmer plot.",
    skip: "Cool-white LED strips.",
    palette: "linen",
    tools: [
      { href: "/diy/studio/table", label: "Tablescape" },
      { href: "/diy/lighting", label: "Lighting playbook" },
    ],
    photo: "/brand/candles.jpg",
    tags: ["lighting", "table", "diy-friendly"],
    price: {
      unit: "table",
      diyLow: 22,
      diyHigh: 48,
      hireLow: 70,
      hireHigh: 160,
      note: "Two rechargeable lamps + votives, bought. Hire is a lighting plot per table.",
    },
  },
  {
    id: "cloud",
    name: "Cloud dancer — all the whites",
    year: "2026",
    line: "Ivory, fog, paper, one green. Pantone’s white year.",
    why: "Tonal white is the backdrop. A citrus or blush accent if you get bored.",
    diy: "White silk + real eucalyptus. Mix cream plates, not matching china.",
    hire: "A white floral ceiling. That’s money.",
    skip: "Stark hospital white with no texture.",
    palette: "coast",
    tools: [
      { href: "/diy/studio/floral?story=coast", label: "Coast palette" },
      { href: "/diy/studio/floral", label: "Floral studio" },
    ],
    photo: "/brand/setting.jpg",
    tags: ["flowers", "palette"],
    price: {
      unit: "wedding",
      diyLow: 450,
      diyHigh: 1100,
      hireLow: 3500,
      hireHigh: 12000,
      note: "Silk + real greens for tables and a bouquet. Hire is an all-white florist room.",
    },
  },
  {
    id: "color-back",
    name: "Color, on purpose",
    year: "2026",
    line: "Not ‘blush and gold.’ A color you actually like.",
    why: "After years of beige, 2026 is personal color — rust, ink, island citrus — used as a decision, not a splash.",
    diy: "Lock one palette in Floral. Repeat it on napkins and one food.",
    hire: "Painted tables or a dyed linen lot.",
    skip: "Rainbow ‘each table a color.’",
    palette: "midnight",
    tools: [
      { href: "/diy/studio/floral", label: "Palettes" },
      { href: "/planning/vision", label: "My vision" },
    ],
    photo: "/brand/candles.jpg",
    tags: ["palette", "vision"],
    price: {
      unit: "wedding",
      diyLow: 80,
      diyHigh: 250,
      hireLow: 400,
      hireHigh: 1800,
      note: "Dye, napkins, one repeated accent. Not the flowers — those sit in Floral.",
    },
  },
  {
    id: "house",
    name: "It looks like a house",
    year: "2026",
    line: "Vintage plates, mixed chairs, a lamp from home.",
    why: "Residential tables read expensive because they look collected, not rented as a set.",
    diy: "Thrift 20 plates that almost match. Steal lamps from the living room. Mix with silk so it can sit all day.",
    hire: "Lounge furniture if you don’t have it.",
    skip: "A full matching charger-plate package.",
    palette: "linen",
    tools: [
      { href: "/diy/studio/table", label: "Tablescape" },
      { href: "/diy/table-decor", label: "Table playbook" },
    ],
    photo: "/brand/setting.jpg",
    tags: ["table", "diy-friendly", "budget"],
    price: {
      unit: "table",
      diyLow: 15,
      diyHigh: 35,
      hireLow: 60,
      hireHigh: 140,
      note: "Thrifted plates + a lamp from home. Hire is vintage rental per setting.",
    },
  },
  {
    id: "keep",
    name: "Decor you keep",
    year: "2026",
    line: "Silk, dried, and things that go home.",
    why: "Sustainable is the word venues use. Reusable is what DIY couples actually do.",
    diy: "Silk faces + dried wheat. The bouquet becomes the guest-room vase.",
    hire: "Nothing — this is the anti-hire trend.",
    skip: "Cheap silk that shines.",
    palette: "linen",
    tools: [
      { href: "/diy/studio/floral", label: "Silk stems" },
      { href: "/diy/flowers", label: "Flowers playbook" },
    ],
    photo: "/brand/flowers.jpg",
    tags: ["flowers", "diy-friendly", "budget"],
    price: {
      unit: "wedding",
      diyLow: 320,
      diyHigh: 850,
      hireLow: 0,
      hireHigh: 0,
      note: "Real-touch silk you keep. Hire doesn’t apply — that’s the point.",
    },
  },
  {
    id: "bar",
    name: "A flower bar",
    year: "2026",
    line: "Guests make a stem to take home. Pinterest searches are up ~9×.",
    why: "It’s a favor and an activity. Works if you have hardy stems and a person to restock.",
    diy: "Buckets of ruscus, spray roses, ribbon. A sign. That’s the bar.",
    hire: "If you want it styled like a shop.",
    skip: "Delicate ranunculus in July sun.",
    palette: "garden",
    tools: [
      { href: "/diy/studio/floral", label: "Floral studio" },
      { href: "/diy/favors", label: "Favors" },
    ],
    photo: "/brand/flowers.jpg",
    tags: ["flowers", "guest", "diy-friendly"],
    price: {
      unit: "wedding",
      diyLow: 160,
      diyHigh: 380,
      hireLow: 800,
      hireHigh: 2200,
      note: "Hardy buckets + ribbon for ~80 guests. Hire is a styled bar with an attendant.",
    },
  },
  {
    id: "drape",
    name: "Fabric in the air",
    year: "2026",
    line: "Ceiling cloth, not more flowers.",
    why: "Draping is the year-defining install — cheaper per square foot than blooms if someone can hang it.",
    diy: "A sweethearts backdrop in gauze. Not the whole tent.",
    hire: "Anything attached to a venue ceiling.",
    skip: "Tulle from prom.",
    palette: "coast",
    tools: [
      { href: "/diy/backdrop", label: "Backdrop playbook" },
      { href: "/diy/lighting", label: "Lighting" },
    ],
    photo: "/brand/garden.jpg",
    tags: ["install", "hire-leaning"],
    price: {
      unit: "wedding",
      diyLow: 90,
      diyHigh: 240,
      hireLow: 1600,
      hireHigh: 6500,
      note: "A gauze sweetheart backdrop you hang. Hire is a tent or ceiling drape.",
    },
  },
];

export function scaleTrend(t: DecorTrend, tables: number) {
  const n = t.price.unit === "table" ? Math.max(1, tables) : 1;
  return {
    diyLow: t.price.diyLow * n,
    diyHigh: t.price.diyHigh * n,
    hireLow: t.price.hireLow * n,
    hireHigh: t.price.hireHigh * n,
    saveLow: Math.max(0, t.price.hireLow * n - t.price.diyHigh * n),
  };
}

export function money(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${Math.round(n)}`;
}

export const TREND_TAGS = ["diy-friendly", "table", "flowers", "lighting", "budget", "palette"] as const;

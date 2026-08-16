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
  },
];

export const TREND_TAGS = ["diy-friendly", "table", "flowers", "lighting", "budget", "palette"] as const;

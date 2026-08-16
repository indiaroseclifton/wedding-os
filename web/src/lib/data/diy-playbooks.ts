export type SourceOption = {
  id: string;
  name: string;
  cost: "low" | "mid" | "high";
  effort: "low" | "mid" | "high";
  lead: string;
  bestFor: string;
  watch: string;
};

export type Recipe = {
  id: string;
  name: string;
  forWhat: string;
  pieces: string[];
};

export type ShoppingRule = {
  id: string;
  label: string;
  unit: string;
  perTable?: number;
  perGuest?: number;
  flat?: number;
  note?: string;
};

export type Playbook = {
  slug: string;
  title: string;
  summary: string;
  whenDiy: string;
  whenHire: string;
  timeline: { when: string; what: string }[];
  recipes: Recipe[];
  sources: SourceOption[];
  shopping: ShoppingRule[];
  pitfalls: string[];
};

export const PLAYBOOKS: Playbook[] = [
  {
    slug: "flowers",
    title: "Flowers",
    summary:
      "Where to buy, what actually lasts, and how many stems you need — without eight hours of YouTube.",
    whenDiy:
      "You want control over color, you have fridge or a cool garage, and someone can process stems the day before.",
    whenHire:
      "Outdoor July heat, no cooler space, or you need complex arches and hanging installs.",
    timeline: [
      { when: "8–12 weeks out", what: "Lock palette and hardy vs statement stems. Decide grocery / wholesale / farm / florist mix." },
      { when: "4 weeks out", what: "Order wholesale or reserve farm buckets. Buy buckets, flower food, clippers, tape." },
      { when: "1 week out", what: "Confirm delivery window. Clear fridge space. Print stem counts." },
      { when: "2–3 days out", what: "Grocery run for hardy fillers. Wholesale arrives; hydrate overnight." },
      { when: "Day before", what: "Build bouquets and centerpieces. Mist, bag, refrigerate." },
    ],
    recipes: [
      {
        id: "guest-table",
        name: "Guest table (conversation height)",
        forWhat: "8-top round or farm table",
        pieces: [
          "3 bud vases or 1 low bowl",
          "8–15 hardy stems + 4–6 greenery pieces",
          "2 tapers or 3 votives (check venue fire rules)",
        ],
      },
      {
        id: "bouquet",
        name: "Handheld bouquet",
        forWhat: "One person",
        pieces: ["25–40 stems total", "About 1/3 greenery, 1/3 face flowers, 1/3 filler", "Ribbon + 2 pins"],
      },
      {
        id: "bouts",
        name: "Boutonniere / pin",
        forWhat: "Each person",
        pieces: ["1 face flower + 1–2 greenery sprigs", "Floral tape + pin", "Build morning-of so they don’t wilt"],
      },
    ],
    sources: [
      {
        id: "grocery",
        name: "Grocery (Trader Joe’s, Kroger, Costco flower wall)",
        cost: "low",
        effort: "mid",
        lead: "2–3 days before",
        bestFor: "Hardy fillers: carnations, alstroemeria, mums, baby’s breath, eucalyptus.",
        watch: "Color and stem count are luck of the week. Go early the day they restock.",
      },
      {
        id: "wholesale-web",
        name: "Wholesale websites (bulk boxes)",
        cost: "mid",
        effort: "high",
        lead: "Order 3–4 weeks; ships 2–3 days before",
        bestFor: "Matching colors in volume. Roses, ranunculus, greenery boxes.",
        watch: "You must recut and hydrate immediately. Have buckets ready. Some boxes arrive mixed quality.",
      },
      {
        id: "farm",
        name: "Local farm or u-pick",
        cost: "mid",
        effort: "mid",
        lead: "Reserve 4–8 weeks",
        bestFor: "Seasonal, local, and unusual garden stems.",
        watch: "Season is the boss. Peonies vanish. Heat wilts hydrangea outdoors.",
      },
      {
        id: "florist",
        name: "Florist (full service)",
        cost: "high",
        effort: "low",
        lead: "Book 6–12 months in peak cities",
        bestFor: "Arches, hanging installs, guaranteed look.",
        watch: "Often 3–8× the stem cost. Worth it if labor or heat would wreck DIY.",
      },
      {
        id: "faux",
        name: "Faux / sola / mixed",
        cost: "mid",
        effort: "low",
        lead: "Weeks ahead, no wilt clock",
        bestFor: "Outdoor heat (Atlanta summer), arches, keep-forever pieces.",
        watch: "Cheap plastic reads cheap on camera. Mix real greenery if you can.",
      },
    ],
    shopping: [
      { id: "stems", label: "Mixed stems for tables", unit: "stems", perTable: 12, note: "Hardy mix; add 10% spare" },
      { id: "green", label: "Greenery pieces", unit: "stems", perTable: 5 },
      { id: "vases", label: "Bud vases or bowls", unit: "vases", perTable: 3 },
      { id: "bouquet", label: "Bouquet stems (if DIY)", unit: "stems", flat: 35 },
      { id: "buckets", label: "Clean buckets + flower food", unit: "kits", flat: 1 },
    ],
    pitfalls: [
      "Hydrangea and garden roses collapse in heat and sun. Use them indoors or swap for hardy doubles.",
      "Wholesale roses ship tight. They need 24 hours in water to open.",
      "Don’t build everything the morning of. Bouquets and tables the day before; pins the morning of.",
      "Venue may ban real flame. Confirm before you buy 80 tapers.",
    ],
  },
  {
    slug: "table-decor",
    title: "Table decor",
    summary: "Linens, vessels, candles, place cards — a kit per table so you’re not inventing it the week of.",
    whenDiy: "You like a collected look, have storage, and can stage one sample table early.",
    whenHire: "You need matching rentals at scale and no one wants to wash 20 cloths the next day.",
    timeline: [
      { when: "3–4 months out", what: "Build one sample table. Photo it. Lock the recipe." },
      { when: "8 weeks out", what: "Buy or thrift vessels in bulk. Order linens (or rent)." },
      { when: "4 weeks out", what: "Cricut / print place cards and numbers. Test candle height." },
      { when: "Week of", what: "Pack by table in labeled bins: cloth, vessels, candles, numbers, tape." },
    ],
    recipes: [
      {
        id: "soft-garden",
        name: "Soft garden table",
        forWhat: "Outdoor or backyard",
        pieces: ["Cloth or runner", "3 mismatched bud vases", "2 tapers or 4 votives", "Printed number + place cards"],
      },
      {
        id: "minimal",
        name: "Minimal long table",
        forWhat: "Farm tables",
        pieces: ["Runner only (skip full cloth)", "Low greenery garland or spaced bud vases", "Even taper line", "No tall pieces that block faces"],
      },
    ],
    sources: [
      {
        id: "thrift",
        name: "Thrift / dollar / Facebook Marketplace",
        cost: "low",
        effort: "high",
        lead: "Start 2–3 months out",
        bestFor: "Bud vases, brass candlesticks, odd glass.",
        watch: "Won’t match. That’s the look — or it looks messy. Commit.",
      },
      {
        id: "bulk-web",
        name: "Bulk web (IKEA, Amazon, restaurant supply)",
        cost: "mid",
        effort: "mid",
        lead: "4–6 weeks (returns buffer)",
        bestFor: "Identical votives, taper boxes, chargers.",
        watch: "Measure table width before you buy runners.",
      },
      {
        id: "rental",
        name: "Rental house linens",
        cost: "mid",
        effort: "low",
        lead: "Book with venue timeline",
        bestFor: "Pressed cloths you don’t want to launder.",
        watch: "Count extras. Spills happen.",
      },
    ],
    shopping: [
      { id: "cloth", label: "Cloths or runners", unit: "tables", perTable: 1 },
      { id: "vessels", label: "Vases / bowls", unit: "vessels", perTable: 3 },
      { id: "candles", label: "Tapers or votives", unit: "candles", perTable: 4 },
      { id: "numbers", label: "Table numbers", unit: "cards", perTable: 1 },
      { id: "places", label: "Place cards", unit: "cards", perGuest: 1 },
    ],
    pitfalls: [
      "Anything taller than ~14\" blocks conversation. Keep guest-table florals low.",
      "White tapers look cheap if they’re different heights. Buy one box.",
      "Pack a ‘reset bin’: extra candles, tape, scissors, lighter, stain wipe.",
    ],
  },
  {
    slug: "signage",
    title: "Signage & paper",
    summary: "Welcome, seating, bars, and programs you can cut on a Cricut or print at home.",
    whenDiy: "You already have a Cricut or a clean type setup and a foam-board cutter.",
    whenHire: "You want letterpress suites or 200+ calligraphed envelopes.",
    timeline: [
      { when: "10 weeks out", what: "List every sign you actually need. Kill the rest." },
      { when: "6 weeks out", what: "Lock type and paper. Order extras of the same stock." },
      { when: "2 weeks out", what: "Print / cut. Leave seating chart until RSVPs settle." },
    ],
    recipes: [
      {
        id: "min-set",
        name: "Minimum sign set",
        forWhat: "Most backyard / venue hybrids",
        pieces: ["Welcome", "Seating or escort", "Bar / food", "Guest book or photos", "Restroom if the venue is confusing"],
      },
    ],
    sources: [
      {
        id: "home-print",
        name: "Home printer + nice stock",
        cost: "low",
        effort: "mid",
        lead: "1–2 weeks",
        bestFor: "Cards, menus, small signs.",
        watch: "Home ink on dark stock fails. Test one sheet.",
      },
      {
        id: "cricut",
        name: "Cricut / vinyl / foam",
        cost: "mid",
        effort: "high",
        lead: "3–4 weeks including weeding time",
        bestFor: "Welcome, bar, last-name pieces.",
        watch: "Weed in sessions. Don’t start the night before.",
      },
    ],
    shopping: [
      { id: "welcome", label: "Welcome sign", unit: "signs", flat: 1 },
      { id: "seating", label: "Seating / escort display", unit: "sets", flat: 1 },
      { id: "small", label: "Small utility signs", unit: "signs", flat: 4 },
    ],
    pitfalls: ["Seating charts change until the last week. Design so names can be swapped."],
  },
  {
    slug: "lighting",
    title: "Lighting",
    summary: "Cafe lights, uplights, and candles — the cheapest way to make DIY look finished after dark.",
    whenDiy: "You can hang cafe lights safely and the venue allows it.",
    whenHire: "You need a lift, a generator, or a union house.",
    timeline: [
      { when: "2 months out", what: "Walk the site at dusk if you can. Note outlets and trees." },
      { when: "1 month out", what: "Buy extra bulbs and outdoor-rated extension." },
      { when: "Day before / morning", what: "Hang lights. Test every strand." },
    ],
    recipes: [
      {
        id: "backyard-night",
        name: "Backyard after dark",
        forWhat: "Outdoor dinner",
        pieces: ["Cafe lights over tables", "Warm uplight on one tree or house wall", "Candles on tables only"],
      },
    ],
    sources: [
      {
        id: "hardware",
        name: "Hardware / home store",
        cost: "low",
        effort: "mid",
        lead: "2–4 weeks",
        bestFor: "Cafe strands, stakes, timers.",
        watch: "Indoor string lights outdoors are a fire and rain problem.",
      },
    ],
    shopping: [
      { id: "strands", label: "Cafe-light strands", unit: "strands", flat: 4 },
      { id: "spare", label: "Spare bulbs + outdoor extension", unit: "kits", flat: 1 },
    ],
    pitfalls: ["Photographers need a little light on faces. Don’t make the room a cave."],
  },
];

export function getPlaybook(slug: string) {
  return PLAYBOOKS.find((p) => p.slug === slug) || null;
}

export function estimateQty(rule: ShoppingRule, tables: number, guests: number) {
  let qty = rule.flat || 0;
  if (rule.perTable) qty += Math.ceil(rule.perTable * tables);
  if (rule.perGuest) qty += Math.ceil(rule.perGuest * guests);
  return Math.max(qty, rule.flat ? rule.flat : 0);
}

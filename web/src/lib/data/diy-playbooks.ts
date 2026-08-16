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
  estEach?: number;
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
  steps?: { title: string; detail: string }[];
  weekTasks?: { day: string; what: string }[];
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
      {
        id: "atlanta",
        name: "Atlanta grocery + pickup",
        cost: "low",
        effort: "mid",
        lead: "2–3 days before",
        bestFor: "Trader Joe’s / Kroger hardy bunches; wholesale pickup if you have a list.",
        watch: "May–Sept heat. Hydrangea outdoors will fail. Shop early the restock morning.",
      },
    ],
    shopping: [
      { id: "stems", label: "Mixed stems for tables", unit: "stems", perTable: 12, estEach: 1.5, note: "Hardy mix; add 10% spare" },
      { id: "green", label: "Greenery pieces", unit: "stems", perTable: 5, estEach: 2 },
      { id: "vases", label: "Bud vases or bowls", unit: "vases", perTable: 3, estEach: 4 },
      { id: "bouquet", label: "Bouquet stems (if DIY)", unit: "stems", flat: 35, estEach: 2 },
      { id: "buckets", label: "Clean buckets + flower food", unit: "kits", flat: 1, estEach: 25 },
    ],
    pitfalls: [
      "Hydrangea and garden roses collapse in heat and sun. Use them indoors or swap for hardy doubles.",
      "Wholesale roses ship tight. They need 24 hours in water to open.",
      "Don’t build everything the morning of. Bouquets and tables the day before; pins the morning of.",
      "Venue may ban real flame. Confirm before you buy 80 tapers.",
    ],
    steps: [
      { title: "Recut", detail: "Angle-cut every stem. Strip leaves that would sit in water." },
      { title: "Hydrate", detail: "Buckets, flower food, cool room. Overnight before you build." },
      { title: "Build low", detail: "Tables stay under 14 inches. Bouquets the day before; pins the morning of." },
    ],
    weekTasks: [
      { day: "Tue", what: "Confirm delivery window and fridge space" },
      { day: "Thu", what: "Wholesale arrives — recut and hydrate" },
      { day: "Fri", what: "Build bouquets and centerpieces" },
      { day: "Sat", what: "Pins in the morning; transport in water" },
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
      { id: "cloth", label: "Cloths or runners", unit: "tables", perTable: 1, estEach: 18 },
      { id: "vessels", label: "Vases / bowls", unit: "vessels", perTable: 3, estEach: 4 },
      { id: "candles", label: "Tapers or votives", unit: "candles", perTable: 4, estEach: 2 },
      { id: "numbers", label: "Table numbers", unit: "cards", perTable: 1, estEach: 2 },
      { id: "places", label: "Place cards", unit: "cards", perGuest: 1, estEach: 0.4 },
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
      { id: "welcome", label: "Welcome sign", unit: "signs", flat: 1, estEach: 35 },
      { id: "seating", label: "Seating / escort display", unit: "sets", flat: 1, estEach: 40 },
      { id: "small", label: "Small utility signs", unit: "signs", flat: 4, estEach: 8 },
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
      { id: "strands", label: "Cafe-light strands", unit: "strands", flat: 4, estEach: 22 },
      { id: "spare", label: "Spare bulbs + outdoor extension", unit: "kits", flat: 1, estEach: 30 },
    ],
    pitfalls: ["Photographers need a little light on faces. Don’t make the room a cave."],
  },
  {
    slug: "cake",
    title: "Cake & dessert",
    summary: "Display cake plus kitchen sheets — or a dessert table you can actually finish.",
    whenDiy: "You like baking, have fridge space, and a friend who will cut.",
    whenHire: "July heat, 150+ guests, or you want a sculpted thing that photographs.",
    timeline: [
      { when: "3 months out", what: "Decide display + sheet vs full stack vs dessert table." },
      { when: "6 weeks out", what: "Do a flavor trial. Lock how it gets to the venue." },
      { when: "Week of", what: "Bake sheets 2 days out. Assemble display the day before. Keep cold." },
    ],
    recipes: [
      {
        id: "smart-cake",
        name: "Photo cake + kitchen sheets",
        forWhat: "Most guest counts",
        pieces: ["Two-tier show cake", "Sheet cakes in the kitchen", "Simple flowers or fruit, not fondant sculpture"],
      },
      {
        id: "dessert-table",
        name: "Dessert table",
        forWhat: "Casual dinner",
        pieces: ["2–3 cookie / bar recipes you already make well", "One show piece", "Labels for allergens"],
      },
    ],
    sources: [
      {
        id: "home",
        name: "You + a helper",
        cost: "low",
        effort: "high",
        lead: "Practice now, bake week-of",
        bestFor: "Small guest counts, flavors you already know.",
        watch: "Buttercream in Atlanta heat. Keep it inside and cold.",
      },
      {
        id: "bakery",
        name: "Bakery (display + sheets)",
        cost: "mid",
        effort: "low",
        lead: "3–6 months",
        bestFor: "The look without 14 hours of baking.",
        watch: "Final count two weeks out. Delivery window is not a suggestion.",
      },
    ],
    shopping: [
      { id: "show", label: "Display cake (or bake kit)", unit: "cakes", flat: 1, estEach: 80 },
      { id: "sheets", label: "Kitchen sheet cakes", unit: "sheets", perGuest: 0.02, estEach: 25, note: "~1 half-sheet per 40 guests" },
      { id: "boxes", label: "Boxes / cake stand / knife", unit: "kits", flat: 1, estEach: 30 },
    ],
    pitfalls: [
      "Don't drive a buttercream cake across town in August with the AC off.",
      "Someone has to cut. Put it on Day-of.",
    ],
  },
  {
    slug: "backdrop",
    title: "Ceremony backdrop",
    summary: "An arch, fireplace, or two trees — not a 12-foot install you invent the morning of.",
    whenDiy: "You can hang or zip-tie safely, and the venue allows it.",
    whenHire: "Hanging from a ceiling, a floral wall, or anything that needs a lift.",
    timeline: [
      { when: "2 months out", what: "Pick the structure: rented arch, existing fireplace, or trees." },
      { when: "3 weeks out", what: "Buy fabric, faux greens, or reserve farm buckets for the frame only." },
      { when: "Day before / morning", what: "Build on site. Don’t assemble florals at home and drive them upright." },
    ],
    recipes: [
      {
        id: "simple-arch",
        name: "Simple arch",
        forWhat: "Lawn or backyard",
        pieces: ["Metal or wood arch rental", "Asymmetric greenery on one corner", "Optional 2–3 face flowers"],
      },
    ],
    sources: [
      {
        id: "rental-arch",
        name: "Rental arch + your greens",
        cost: "low",
        effort: "mid",
        lead: "4–8 weeks",
        bestFor: "DIY flowers couples who still want a frame.",
        watch: "Wind. Stake it. Have a plan B wall or fireplace.",
      },
      {
        id: "florist-install",
        name: "Florist install",
        cost: "high",
        effort: "low",
        lead: "6–12 months",
        bestFor: "Anything hanging or that must match personal flowers.",
        watch: "This is where DIY budgets go to die. Worth it if it’s the photo.",
      },
    ],
    shopping: [
      { id: "frame", label: "Arch or frame", unit: "frames", flat: 1, estEach: 80 },
      { id: "green", label: "Greenery / fabric", unit: "bunches", flat: 6, estEach: 12 },
      { id: "ties", label: "Zip ties, floral wire, stakes", unit: "kits", flat: 1, estEach: 15 },
    ],
    pitfalls: ["Outdoor May–Sept in Atlanta: real hydrangea on an arch will collapse. Use hardy greens or faux."],
  },
  {
    slug: "favors",
    title: "Favors",
    summary: "Skip them unless they get eaten or used. Nobody needs a tiny bottle with your monogram.",
    whenDiy: "You already make something (cookies, hot sauce, seed packets) and can pack in a weekend.",
    whenHire: "You don’t. Most couples should spend this money on food or light.",
    timeline: [
      { when: "6 weeks out", what: "Decide favor or no favor. Default is no." },
      { when: "2 weeks out", what: "If yes: make or order. Pack in one labeled bin." },
    ],
    recipes: [
      {
        id: "edible",
        name: "Edible, one item",
        forWhat: "If you insist",
        pieces: ["One cookie or chocolate per guest", "Simple wrap", "No personalization that takes 4 hours"],
      },
    ],
    sources: [
      {
        id: "skip",
        name: "Skip favors",
        cost: "low",
        effort: "low",
        lead: "Now",
        bestFor: "Almost everyone.",
        watch: "Guests leave them on the table. That’s your answer.",
      },
      {
        id: "local-food",
        name: "Local food item",
        cost: "mid",
        effort: "mid",
        lead: "3–4 weeks",
        bestFor: "Something people will actually take (donuts, coffee bags).",
        watch: "Count extras. Heat-sensitive chocolate is a bad outdoor favor.",
      },
    ],
    shopping: [
      { id: "item", label: "Favor item", unit: "each", perGuest: 1, estEach: 2 },
      { id: "wrap", label: "Wrap / bags", unit: "each", perGuest: 1, estEach: 0.3 },
    ],
    pitfalls: ["If it takes a craft night, it’s not a favor. It’s a second job."],
  },
  {
    slug: "welcome-bags",
    title: "Welcome bags",
    summary: "Hotel bags for out-of-town people — water, a note, something local. Not a gift basket.",
    whenDiy: "You have under 40 rooms and a night to pack.",
    whenHire: "80+ rooms or you want them delivered to every door.",
    timeline: [
      { when: "4 weeks out", what: "List rooms from the hotel block. Write a one-page weekend card." },
      { when: "1 week out", what: "Buy water, snacks, one local thing. Print the card." },
      { when: "Day before guests arrive", what: "Pack. Drop at the front desk with a room list — don’t door-knock 30 rooms." },
    ],
    recipes: [
      {
        id: "hotel-bag",
        name: "Hotel bag",
        forWhat: "Each reserved room",
        pieces: ["Water", "A snack", "Weekend card (times, parking, weather)", "One local item optional"],
      },
    ],
    sources: [
      {
        id: "costco-run",
        name: "Costco / Trader Joe’s run",
        cost: "low",
        effort: "mid",
        lead: "1 week",
        bestFor: "Most Atlanta hotel blocks.",
        watch: "Hotel may charge to deliver. Ask before you assume the desk will help.",
      },
    ],
    shopping: [
      { id: "bags", label: "Bags", unit: "rooms", perTable: 0, flat: 20, estEach: 1, note: "Set rooms = your hotel block, not guest count" },
      { id: "water", label: "Water + snack", unit: "rooms", flat: 20, estEach: 3 },
      { id: "card", label: "Weekend cards", unit: "rooms", flat: 20, estEach: 0.4 },
    ],
    pitfalls: ["Pack for rooms, not heads. Two people in a room get one bag."],
  },
  {
    slug: "bar",
    title: "Bar",
    summary: "Beer, wine, one signature drink, water — not a full cocktail program you invent at 5pm.",
    whenDiy: "Venue allows self-serve or a friend with a TAM card. Under 80 guests.",
    whenHire: "You want a real bartender, liquor liability, or 100+ people drinking at once.",
    timeline: [
      { when: "8 weeks out", what: "Decide beer/wine only vs one signature. Check venue rules and ice." },
      { when: "3 weeks out", what: "Count drinkers (not heads). Order. Borrow tubs and a tablecloth." },
      { when: "2 days out", what: "Buy ice last. Chill overnight. Print one drink sign." },
      { when: "Day of", what: "Set bar 90 minutes before guests. Water first, then wine, then beer." },
    ],
    recipes: [
      {
        id: "simple-bar",
        name: "Simple bar",
        forWhat: "Most backyard / hall hybrids",
        pieces: ["2 beers + 2 wines", "One signature batched in a dispenser", "Water + NA option", "Ice = 1 lb per guest"],
      },
    ],
    sources: [
      {
        id: "warehouse",
        name: "Costco / Total Wine",
        cost: "low",
        effort: "mid",
        lead: "1 week + returns",
        bestFor: "Case wine and beer you can take back unopened.",
        watch: "Warm white wine is worse than no wine. Ice is not optional.",
      },
      {
        id: "bartender",
        name: "Hired bartender + your liquor",
        cost: "mid",
        effort: "low",
        lead: "2–3 months",
        bestFor: "You want someone else to pour and card.",
        watch: "They still need your ice, tubs, and a table.",
      },
    ],
    shopping: [
      { id: "wine", label: "Wine bottles", unit: "bottles", perGuest: 0.4, estEach: 12 },
      { id: "beer", label: "Beer", unit: "cans", perGuest: 2, estEach: 1.5 },
      { id: "ice", label: "Ice", unit: "lbs", perGuest: 1, estEach: 0.5 },
      { id: "na", label: "Water / NA", unit: "bottles", perGuest: 1, estEach: 0.6 },
    ],
    pitfalls: ["One signature drink is charming. Four is a second job and a sticky table."],
    steps: [
      { title: "Batch", detail: "Mix the signature the morning of. Taste. Label the dispenser." },
      { title: "Ice first", detail: "Tubs down, ice in, bottles nest. Wine in one, beer in one, water visible." },
      { title: "Sign", detail: "One card: what’s pouring and where the restrooms are." },
    ],
    weekTasks: [
      { day: "Tue", what: "Finalize drinker count from RSVPs" },
      { day: "Thu", what: "Warehouse run — keep receipts for returns" },
      { day: "Sat", what: "Ice + set bar 90 min before guests" },
    ],
  },
  {
    slug: "cake-table",
    title: "Cake table",
    summary: "The display — stand, knife, plates, flowers — separate from who baked it.",
    whenDiy: "You already have a stand and can style a small table in 20 minutes.",
    whenHire: "Sculpted cake that needs a florist and a chilled room.",
    timeline: [
      { when: "6 weeks out", what: "Pick a table that isn’t in a sun beam. Confirm who cuts." },
      { when: "2 weeks out", what: "Stand, knife, plates, a small floral or fruit." },
      { when: "Day of", what: "Set after lunch, before guests. Cake last so it doesn’t melt." },
    ],
    recipes: [
      {
        id: "small-display",
        name: "Small display",
        forWhat: "Photo cake + sheets in the kitchen",
        pieces: ["One stand", "Knife + server", "Small greens or fruit", "Allergen card"],
      },
    ],
    sources: [
      {
        id: "home-stand",
        name: "Your stand + grocery greens",
        cost: "low",
        effort: "low",
        lead: "1 week",
        bestFor: "Almost everyone.",
        watch: "Buttercream in a window = soup. Shade.",
      },
    ],
    shopping: [
      { id: "stand", label: "Cake stand", unit: "stands", flat: 1, estEach: 25 },
      { id: "serve", label: "Knife / plates / cards", unit: "kits", flat: 1, estEach: 18 },
    ],
    pitfalls: ["Put a name on the cut. Otherwise it sits uncut until 9pm."],
    steps: [
      { title: "Shade", detail: "Table out of sun and AC blast." },
      { title: "Stand + card", detail: "Stand centered, allergen card in front, knife behind." },
      { title: "Cake last", detail: "Carry it out 20 minutes before photos." },
    ],
    weekTasks: [
      { day: "Wed", what: "Confirm who cuts and when" },
      { day: "Fri", what: "Pack stand, knife, card, greens" },
      { day: "Sat", what: "Set table after lunch; cake last" },
    ],
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

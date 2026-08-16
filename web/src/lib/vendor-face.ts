export type FaceField = { id: string; label: string; placeholder: string };

export type FaceKind = "venue" | "florist" | "photo" | "catering" | "dj" | "generic";

export type FaceDef = {
  kind: FaceKind;
  cover: string;
  eyebrow: string;
  line: string;
  fields: FaceField[];
};

const FACES: { match: RegExp; def: FaceDef }[] = [
  {
    match: /venue|barn|estate|hall/,
    def: {
      kind: "venue",
      cover: "/brand/setting.jpg",
      eyebrow: "The room",
      line: "What they actually hold — not the tour.",
      fields: [
        { id: "rooms", label: "Rooms", placeholder: "Lawn + barn" },
        { id: "curfew", label: "Hard stop", placeholder: "Music off at 10" },
        { id: "included", label: "Included", placeholder: "Tables, chairs, lights" },
        { id: "rain", label: "Rain", placeholder: "Porch, or tent extra" },
      ],
    },
  },
  {
    match: /florist|floral|flower/,
    def: {
      kind: "florist",
      cover: "/brand/flowers.jpg",
      eyebrow: "The stems",
      line: "What they’re making, and when it lands.",
      fields: [
        { id: "mix", label: "Hire / make", placeholder: "They do arch, we do tables" },
        { id: "delivery", label: "Delivery", placeholder: "Saturday 9am, side gate" },
        { id: "reuse", label: "Reuse", placeholder: "Ceremony to sweetheart" },
        { id: "cooler", label: "Cooler", placeholder: "They hold overnight" },
      ],
    },
  },
  {
    match: /photo|video/,
    def: {
      kind: "photo",
      cover: "/brand/garden.jpg",
      eyebrow: "The hours",
      line: "Coverage, not the mood board.",
      fields: [
        { id: "hours", label: "Hours", placeholder: "2–10, or 8 hours" },
        { id: "firstLook", label: "First look", placeholder: "Yes, garden at 2:30" },
        { id: "second", label: "Second shooter", placeholder: "Yes / no" },
        { id: "meal", label: "Meal", placeholder: "Hot meal, two seats" },
      ],
    },
  },
  {
    match: /cater|food|bar/,
    def: {
      kind: "catering",
      cover: "/brand/tablescape.jpg",
      eyebrow: "The kitchen",
      line: "How people eat, and when they need the count.",
      fields: [
        { id: "service", label: "Service", placeholder: "Family style" },
        { id: "deadline", label: "Headcount due", placeholder: "10 days out" },
        { id: "vendorMeals", label: "Vendor meals", placeholder: "8 hot plates" },
        { id: "leftover", label: "Leftovers", placeholder: "Pack for us" },
      ],
    },
  },
  {
    match: /dj|band|music/,
    def: {
      kind: "dj",
      cover: "/brand/candles.jpg",
      eyebrow: "The night",
      line: "The last song is a decision, not a maybe.",
      fields: [
        { id: "lastSong", label: "Last song", placeholder: "Tennessee Whiskey" },
        { id: "noPlay", label: "Do not play", placeholder: "Chicken dance, Macarena" },
        { id: "dinnerSwap", label: "Dinner swap", placeholder: "After salad" },
        { id: "hardStop", label: "Hard stop", placeholder: "10:00, their clock" },
      ],
    },
  },
];

const GENERIC: FaceDef = {
  kind: "generic",
  cover: "/brand/rooms/vendors.jpg",
  eyebrow: "This booking",
  line: "The four things you’d forget at 11pm.",
  fields: [
    { id: "lead", label: "Who shows up", placeholder: "Name on the day" },
    { id: "arrive", label: "Arrive", placeholder: "2:30, loading dock" },
    { id: "need", label: "They need", placeholder: "Power, meal, parking" },
    { id: "note", label: "Don’t forget", placeholder: "" },
  ],
};

export function faceFor(category?: string): FaceDef {
  const c = (category || "").toLowerCase();
  return FACES.find((f) => f.match.test(c))?.def || GENERIC;
}

export function coverFor(category?: string) {
  return faceFor(category).cover;
}

export function faceLine(face: Record<string, string> | undefined, category?: string) {
  if (!face) return "";
  const def = faceFor(category);
  return def.fields
    .map((f) => face[f.id]?.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
}

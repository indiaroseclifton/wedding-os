export type NavRoom = "before" | "studio" | "day" | "after" | "planning" | "guests";

export type NavNode = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

export type NavGroup = {
  label: string;
  href: string;
  items: NavNode[];
};

const PLAN: NavNode[] = [
  {
    href: "/planning/vision",
    label: "Vision",
    children: [
      { href: "/planning/vision", label: "Wedding brief" },
      { href: "/moodboard", label: "Moodboard" },
      { href: "/together", label: "Together" },
    ],
  },
  {
    href: "/planning",
    label: "Plan",
    children: [
      { href: "/planning", label: "Overview" },
      { href: "/decisions", label: "Decisions" },
      { href: "/checklist", label: "Checklist" },
      { href: "/timeline", label: "Timeline" },
    ],
  },
  {
    href: "/budget",
    label: "Money",
    children: [
      { href: "/budget", label: "Budget" },
      { href: "/payments", label: "Payments" },
      { href: "/registry", label: "Registry" },
    ],
  },
  {
    href: "/vendors",
    label: "Vendors",
    children: [
      { href: "/vendors", label: "Team" },
      { href: "/vendors/browse", label: "Find" },
      { href: "/send", label: "Packets" },
    ],
  },
  {
    href: "/guests",
    label: "Guests",
    children: [
      { href: "/guests", label: "Guest list" },
      { href: "/events", label: "Events & RSVP" },
      { href: "/seating", label: "Seating" },
      { href: "/travel", label: "Travel" },
    ],
  },
];

const PEOPLE: NavNode[] = PLAN.filter((item) => item.label === "Guests");

const STUDIO: NavNode[] = [
  { href: "/studio", label: "Projects" },
  { href: "/diy/studio/floral", label: "Flowers" },
  { href: "/diy/studio/table", label: "Tables" },
  {
    href: "/studio/cards",
    label: "Print",
    children: [
      { href: "/studio/cards", label: "Cards" },
      { href: "/studio/signage", label: "Cricut & signs" },
      { href: "/studio/decor", label: "Décor builds" },
    ],
  },
  {
    href: "/studio/shop",
    label: "Supplies",
    children: [
      { href: "/studio/shop", label: "Shopping" },
      { href: "/studio/inventory", label: "Inventory & boxes" },
    ],
  },
  { href: "/diy/calendar", label: "Build week" },
];

const DAY: NavNode[] = [
  { href: "/day-of", label: "Live run", children: [{ href: "/run-of-show", label: "Edit timeline" }, { href: "/music", label: "Music" }] },
  { href: "/planning/party", label: "Team" },
  { href: "/packet", label: "Packet" },
];

const AFTER: NavNode[] = [
  { href: "/after#returns", label: "Returns" },
  { href: "/thanks", label: "Thank-yous" },
  { href: "/after#reviews", label: "Reviews" },
];

export const ROOM_GROUPS: Record<"before" | "studio" | "day" | "after", NavGroup[]> = {
  before: [
    { label: "Before", href: "/planning", items: PLAN },
  ],
  studio: [{ label: "Studio", href: "/studio", items: STUDIO }],
  day: [{ label: "The day", href: "/day-of", items: DAY }],
  after: [{ label: "After", href: "/after", items: AFTER }],
};

export const ROOM_TREE: Record<NavRoom, NavNode[]> = {
  before: [...PLAN, ...PEOPLE],
  planning: PLAN,
  guests: PEOPLE,
  studio: STUDIO,
  day: DAY,
  after: AFTER,
};

export const ROOM_SUBNAV = {
  before: ROOM_TREE.before.map(({ href, label }) => ({ href, label })),
  planning: PLAN.map(({ href, label }) => ({ href, label })),
  guests: PEOPLE.map(({ href, label }) => ({ href, label })),
  studio: STUDIO.map(({ href, label }) => ({ href, label })),
  day: DAY.map(({ href, label }) => ({ href, label })),
  after: AFTER.map(({ href, label }) => ({ href, label })),
} as const;

export function groupsForRoom(room: NavRoom | null): NavGroup[] {
  if (room === "planning" || room === "guests" || room === "before") return ROOM_GROUPS.before;
  if (room === "studio") return ROOM_GROUPS.studio;
  if (room === "day") return ROOM_GROUPS.day;
  if (room === "after") return ROOM_GROUPS.after;
  return [];
}

export const TEAM_ROLES = [
  { id: "venue", label: "Venue", category: "Venue", when: "12–18 mo" },
  { id: "photo", label: "Photographer", category: "Photographer", when: "12–18 mo" },
  { id: "video", label: "Videographer", category: "Videographer", when: "9–14 mo" },
  { id: "planner", label: "Planner", category: "Planner", when: "12–18 mo" },
  { id: "florist", label: "Florist", category: "Florist", when: "8–12 mo", diy: "/diy/studio/floral" },
  { id: "catering", label: "Caterer", category: "Catering", when: "8–12 mo" },
  { id: "music", label: "DJ or band", category: "DJ / Band", when: "8–12 mo" },
  { id: "beauty", label: "Hair & makeup", category: "Hair / Makeup", when: "6–9 mo" },
  { id: "cake", label: "Cake", category: "Cake", when: "4–8 mo", diy: "/diy/cake" },
  { id: "officiant", label: "Officiant", category: "Officiant", when: "6–9 mo" },
  { id: "rentals", label: "Rentals", category: "Rentals", when: "4–8 mo", diy: "/diy/studio/table" },
  { id: "transport", label: "Transportation", category: "Transportation", when: "3–6 mo" },
  { id: "paper", label: "Stationery", category: "Stationery", when: "6–9 mo", diy: "/diy/signage" },
  { id: "lighting", label: "Lighting", category: "Lighting", when: "3–6 mo", diy: "/studio/decor" },
] as const;

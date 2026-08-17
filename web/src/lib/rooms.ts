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
  { href: "/planning", label: "Overview" },
  { href: "/planning/vision", label: "Vision" },
  { href: "/together", label: "Together" },
  { href: "/decisions", label: "Decisions", children: [{ href: "/decisions", label: "All" }, { href: "/decisions/path", label: "Hire or make" }] },
  { href: "/checklist", label: "Checklist" },
  { href: "/vendors", label: "Vendors", children: [{ href: "/vendors", label: "Team" }, { href: "/send", label: "Packets" }, { href: "/vendors/browse", label: "Find" }] },
  { href: "/budget", label: "Budget" },
  { href: "/payments", label: "Payments" },
  { href: "/registry", label: "Registry" },
  { href: "/traditions", label: "Traditions" },
  { href: "/legal", label: "Names" },
  { href: "/timeline", label: "Timeline" },
];

const PEOPLE: NavNode[] = [
  { href: "/guests", label: "List", children: [{ href: "/guests", label: "Everyone" }, { href: "/guests/chase", label: "The chase" }, { href: "/guests/new", label: "Add one" }] },
  { href: "/events", label: "Events" },
  { href: "/seating", label: "Seating", children: [{ href: "/seating", label: "Chart" }, { href: "/seating/usher", label: "Usher card" }, { href: "/studio/cards", label: "Cards" }] },
  { href: "/site", label: "The letter", children: [{ href: "/site", label: "Write" }, { href: "/site/preview", label: "See as a guest" }] },
  { href: "/travel", label: "Travel" },
  { href: "/dietary", label: "Dietary" },
];

const STUDIO: NavNode[] = [
  { href: "/studio", label: "Studio Home" },
  { href: "/studio/make", label: "Make this" },
  { href: "/studio/projects", label: "Projects" },
  { href: "/planning/vision", label: "Inspiration" },
  { href: "/diy/studio/floral", label: "Flowers" },
  { href: "/diy/studio/table", label: "Tables" },
  { href: "/studio/cards", label: "Print" },
  { href: "/studio/signage", label: "Cricut" },
  { href: "/studio/decor", label: "Décor" },
  { href: "/studio/shop", label: "Shopping" },
  { href: "/studio/inventory", label: "Inventory" },
  { href: "/diy/calendar", label: "Build calendar" },
];

const DAY: NavNode[] = [
  { href: "/day-of", label: "Call sheet" },
  { href: "/planning/party", label: "Party" },
  { href: "/run-of-show", label: "Edit times" },
  { href: "/music", label: "Music" },
  { href: "/packet", label: "Packet" },
];

const AFTER: NavNode[] = [
  { href: "/after", label: "The weeks after" },
  { href: "/thanks", label: "Thank-yous" },
];

export const ROOM_GROUPS: Record<"before" | "studio" | "day" | "after", NavGroup[]> = {
  before: [
    { label: "Plan", href: "/planning", items: PLAN },
    { label: "People", href: "/guests", items: PEOPLE },
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

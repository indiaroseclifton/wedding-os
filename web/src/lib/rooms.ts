export type NavRoom = "planning" | "guests" | "studio" | "day";

export type NavNode = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

export const ROOM_TREE: Record<NavRoom, NavNode[]> = {
  planning: [
    { href: "/planning", label: "Overview" },
    { href: "/planning/vision", label: "Vision" },
    { href: "/decisions", label: "Decisions", children: [{ href: "/decisions", label: "All" }, { href: "/decisions/path", label: "Hire or make" }] },
    { href: "/checklist", label: "Checklist" },
    { href: "/vendors", label: "Vendors", children: [{ href: "/vendors", label: "Team" }, { href: "/send", label: "Packets" }, { href: "/vendors/browse", label: "Find" }] },
    { href: "/budget", label: "Budget" },
    { href: "/after", label: "After" },
    { href: "/thanks", label: "Thank-yous" },
    { href: "/legal", label: "Names" },
    { href: "/timeline", label: "Timeline" },
  ],
  guests: [
    { href: "/guests", label: "List", children: [{ href: "/guests", label: "Everyone" }, { href: "/guests/chase", label: "The chase" }, { href: "/guests/new", label: "Add one" }] },
    { href: "/seating", label: "Seating", children: [{ href: "/seating", label: "Chart" }, { href: "/seating/usher", label: "Usher card" }] },
    { href: "/site", label: "The letter", children: [{ href: "/site", label: "Write" }, { href: "/site/preview", label: "See as a guest" }] },
    { href: "/travel", label: "Travel" },
    { href: "/dietary", label: "Dietary" },
  ],
  studio: [
    { href: "/studio", label: "Studio Home" },
    { href: "/planning/vision", label: "Inspiration" },
    { href: "/diy", label: "Projects" },
    { href: "/studio/inventory", label: "Inventory" },
    { href: "/diy/calendar", label: "Build Calendar" },
    { href: "/diy/studio/floral", label: "Flowers" },
    { href: "/diy/studio/table", label: "Tablescapes" },
    { href: "/studio/decor", label: "Decor Builds" },
    { href: "/diy/signage", label: "Signage" },
    { href: "/vendors", label: "Vendors" },
  ],
  day: [
    { href: "/day-of", label: "Call sheet" },
    { href: "/run-of-show", label: "Edit times" },
    { href: "/music", label: "Music" },
    { href: "/packet", label: "Packet" },
  ],
};

export const ROOM_SUBNAV = {
  planning: ROOM_TREE.planning.map(({ href, label }) => ({ href, label })),
  guests: ROOM_TREE.guests.map(({ href, label }) => ({ href, label })),
  studio: ROOM_TREE.studio.map(({ href, label }) => ({ href, label })),
  day: ROOM_TREE.day.map(({ href, label }) => ({ href, label })),
} as const;

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

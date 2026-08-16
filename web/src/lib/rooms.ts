export type NavNode = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

export const ROOM_TREE: Record<"planning" | "vendors" | "guests" | "day" | "budget", NavNode[]> = {
  planning: [
    { href: "/planning", label: "Overview" },
    { href: "/planning/vision", label: "My vision" },
    {
      href: "/decisions",
      label: "Decisions",
      children: [
        { href: "/decisions", label: "All" },
        { href: "/decisions/path", label: "Hire or make" },
        { href: "/decisions/venue", label: "Venue" },
        { href: "/decisions/style", label: "Style" },
        { href: "/decisions/priorities", label: "Priorities" },
      ],
    },
    { href: "/checklist", label: "Checklist" },
    { href: "/traditions", label: "Traditions" },
    { href: "/timeline", label: "Timeline" },
    { href: "/planning/party", label: "Wedding party" },
    { href: "/attire", label: "Attire" },
    {
      href: "/diy",
      label: "DIY studio",
      children: [
        { href: "/diy", label: "Playbooks" },
        { href: "/diy/studio/floral", label: "Floral" },
        { href: "/diy/studio/table", label: "Tablescape" },
        { href: "/diy/studio/trends", label: "Trends" },
        { href: "/diy/calendar", label: "Week-of" },
      ],
    },
    { href: "/moodboard", label: "Moodboard" },
  ],
  vendors: [
    { href: "/vendors", label: "My team" },
    {
      href: "/vendors/contracts",
      label: "Contracts",
      children: [
        { href: "/vendors/contracts", label: "All" },
        { href: "/vendors/browse", label: "Still shopping" },
      ],
    },
    { href: "/vendors/browse", label: "Find vendors" },
    { href: "/vendors/checklists", label: "Checklists" },
    { href: "/vendors/shortlist", label: "Compare" },
    {
      href: "/payments",
      label: "Payments",
      children: [
        { href: "/payments", label: "Ledger" },
        { href: "/payments/print", label: "Statement" },
        { href: "/budget", label: "Budget" },
      ],
    },
    {
      href: "/send",
      label: "Send",
      children: [
        { href: "/send", label: "Packets" },
        { href: "/handoffs", label: "Text packages" },
      ],
    },
  ],
  guests: [
    {
      href: "/guests",
      label: "List",
      children: [
        { href: "/guests", label: "Everyone" },
        { href: "/guests/new", label: "Add one" },
        { href: "/guests/import", label: "Import" },
      ],
    },
    { href: "/seating", label: "Room planner" },
    { href: "/travel", label: "Travel" },
    { href: "/dietary", label: "Dietary", children: [{ href: "/dietary", label: "Rollup" }, { href: "/dietary/packet", label: "Caterer packet" }] },
    {
      href: "/site",
      label: "Guest site",
      children: [
        { href: "/site", label: "Build" },
        { href: "/site/preview", label: "Preview" },
      ],
    },
  ],
  day: [
    { href: "/day-of", label: "Board" },
    { href: "/run-of-show", label: "Run of show" },
    { href: "/music", label: "Music", children: [{ href: "/music", label: "Cue book" }, { href: "/music/print", label: "DJ print" }] },
    { href: "/packet", label: "Packet" },
    { href: "/people", label: "People" },
    { href: "/attire", label: "Attire" },
  ],
  budget: [
    { href: "/budget", label: "Overview" },
    { href: "/payments", label: "Payments" },
    { href: "/registry", label: "Registry" },
  ],
};

export const ROOM_SUBNAV = {
  planning: ROOM_TREE.planning.map(({ href, label }) => ({ href, label })),
  vendors: ROOM_TREE.vendors.map(({ href, label }) => ({ href, label })),
  guests: ROOM_TREE.guests.map(({ href, label }) => ({ href, label })),
  day: ROOM_TREE.day.map(({ href, label }) => ({ href, label })),
  budget: ROOM_TREE.budget.map(({ href, label }) => ({ href, label })),
} as const;

export const TEAM_ROLES = [
  { id: "venue", label: "Venue", category: "Venue", when: "12–18 mo" },
  { id: "photo", label: "Photographer", category: "Photographer", when: "12–18 mo" },
  { id: "video", label: "Videographer", category: "Videographer", when: "9–14 mo" },
  { id: "planner", label: "Planner", category: "Planner", when: "12–18 mo" },
  { id: "florist", label: "Florist", category: "Florist", when: "8–12 mo", diy: "/diy/flowers" },
  { id: "catering", label: "Caterer", category: "Catering", when: "8–12 mo" },
  { id: "music", label: "DJ or band", category: "DJ / Band", when: "8–12 mo" },
  { id: "beauty", label: "Hair & makeup", category: "Hair / Makeup", when: "6–9 mo" },
  { id: "cake", label: "Cake", category: "Cake", when: "4–8 mo", diy: "/diy/cake" },
  { id: "officiant", label: "Officiant", category: "Officiant", when: "6–9 mo" },
  { id: "rentals", label: "Rentals", category: "Rentals", when: "4–8 mo", diy: "/diy/table-decor" },
  { id: "transport", label: "Transportation", category: "Transportation", when: "3–6 mo" },
  { id: "paper", label: "Stationery", category: "Stationery", when: "6–9 mo", diy: "/diy/signage" },
  { id: "lighting", label: "Lighting", category: "Lighting", when: "3–6 mo", diy: "/diy/lighting" },
] as const;

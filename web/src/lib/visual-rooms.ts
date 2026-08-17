export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "home", room: null, match: ["/dashboard"] },
  {
    href: "/planning",
    label: "Before",
    icon: "planning",
    room: "before",
    match: [
      "/planning",
      "/checklist",
      "/timeline",
      "/tasks",
      "/moodboard",
      "/decisions",
      "/vendors",
      "/payments",
      "/handoffs",
      "/send",
      "/budget",
      "/legal",
      "/registry",
      "/traditions",
      "/together",
      "/guests",
      "/seating",
      "/floorplan",
      "/dietary",
      "/travel",
      "/site",
      "/events",
    ],
  },
  {
    href: "/studio",
    label: "Studio",
    icon: "planning",
    room: "studio",
    match: ["/studio", "/diy"],
  },
  {
    href: "/day-of",
    label: "The day",
    icon: "day",
    room: "day",
    match: ["/day-of", "/run-of-show", "/packet", "/people", "/party", "/planning/party", "/attire", "/music"],
  },
  {
    href: "/after",
    label: "After",
    icon: "heart",
    room: "after",
    match: ["/after", "/thanks"],
  },
] as const;

export const VISUAL_ROOMS = [
  { href: "/planning", label: "Before", photo: "/brand/rooms/planning.jpg", line: "Plan it, gather your people", icon: "calendar", rank: "lead" },
  { href: "/studio", label: "Studio", photo: "/brand/flowers.jpg", line: "Make the flowers, the table, the signs", icon: "scissors", rank: "lead" },
  { href: "/day-of", label: "The day", photo: "/brand/rooms/day.jpg", line: "Call sheet, music, the hour", icon: "sun", rank: "lead" },
  { href: "/after", label: "After", photo: "/brand/rooms/guests.jpg", line: "Thank-yous and the weeks after", icon: "heart", rank: "lead" },
] as const;

export const MORE_ROOMS: { href: string; label: string; icon: string }[] = [
  { href: "/events", label: "Events", icon: "calendar" },
  { href: "/payments", label: "Payments", icon: "card" },
  { href: "/planning/party", label: "Party", icon: "users" },
  { href: "/traditions", label: "Traditions", icon: "heart" },
  { href: "/together", label: "Together", icon: "heart" },
  { href: "/registry", label: "Registry", icon: "gift" },
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/studio", label: "Studio", icon: "scissors" },
  { href: "/seating", label: "Seating", icon: "chair" },
  { href: "/music", label: "Music", icon: "music" },
  { href: "/travel", label: "Travel", icon: "plane" },
  { href: "/payments", label: "Payments", icon: "card" },
  { href: "/send", label: "Send", icon: "send" },
  { href: "/run-of-show", label: "Run of show", icon: "star" },
  { href: "/site", label: "Guest site", icon: "globe" },
  { href: "/onboard", label: "Setup", icon: "wrench" },
  { href: "/start", label: "First wedding", icon: "heart" },
  { href: "/mobile", label: "Phone / app", icon: "phone" },
  { href: "/improvements", label: "Improvements", icon: "chart" },
  { href: "/discover", label: "Discover", icon: "spark" },
  { href: "/", label: "Marketing site", icon: "megaphone" },
];

export function firstNames(coupleNames?: string, fallback = "You two") {
  if (!coupleNames?.trim()) return fallback;
  return coupleNames
    .split(/\s*(?:&|and)\s*/i)
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean)
    .join(" & ");
}

export function prettyWeddingDate(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function shortWeddingDate(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

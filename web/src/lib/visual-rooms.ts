export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "home", room: null, match: ["/dashboard"] },
  { href: "/guests", label: "Guests", icon: "guests", room: "guests", match: ["/guests", "/seating", "/floorplan", "/dietary", "/travel", "/site"] },
  { href: "/vendors", label: "Vendors", icon: "vendors", room: "vendors", match: ["/vendors", "/payments", "/handoffs", "/send"] },
  { href: "/planning", label: "Planning", icon: "planning", room: "planning", match: ["/planning", "/checklist", "/timeline", "/tasks", "/diy", "/moodboard", "/decisions"] },
  { href: "/day-of", label: "The Day", icon: "day", room: "day", match: ["/day-of", "/run-of-show", "/packet", "/people", "/party", "/attire", "/music"] },
  { href: "/budget", label: "Budget", icon: "budget", room: "budget", match: ["/budget"] },
  { href: "/registry", label: "Registry", icon: "registry", room: null, match: ["/registry"] },
] as const;

export const VISUAL_ROOMS = [
  { href: "/planning", label: "Planning", photo: "/brand/rooms/planning.jpg", line: "Vision, checklist, timeline", icon: "calendar", rank: "lead" },
  { href: "/guests", label: "Guests", photo: "/brand/rooms/guests.jpg", line: "The list, RSVPs, chairs", icon: "users", rank: "lead" },
  { href: "/day-of", label: "The Day", photo: "/brand/rooms/day.jpg", line: "Run of show, music, the hour", icon: "sun", rank: "lead" },
  { href: "/vendors", label: "Vendors", photo: "/brand/rooms/vendors.jpg", line: "Find, hire, contracts", icon: "bag", rank: "support" },
  { href: "/budget", label: "Budget", photo: "/brand/rooms/budget.jpg", line: "Envelopes, dues, who pays", icon: "wallet", rank: "support" },
  { href: "/registry", label: "Registry", photo: "/brand/rooms/registry.jpg", line: "The list, claimed, thanks", icon: "gift", rank: "support" },
] as const;

export const MORE_ROOMS: { href: string; label: string; icon: string }[] = [
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/diy", label: "DIY studio", icon: "scissors" },
  { href: "/seating", label: "Seating", icon: "chair" },
  { href: "/floorplan", label: "Floor plan", icon: "grid" },
  { href: "/music", label: "Music", icon: "music" },
  { href: "/travel", label: "Travel", icon: "plane" },
  { href: "/payments", label: "Payments", icon: "card" },
  { href: "/send", label: "Send", icon: "send" },
  { href: "/run-of-show", label: "Run of show", icon: "star" },
  { href: "/site", label: "Guest site", icon: "globe" },
  { href: "/moodboard", label: "Moodboard", icon: "image" },
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

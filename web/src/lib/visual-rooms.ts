export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "home", match: ["/dashboard"] },
  { href: "/guests", label: "Guests", icon: "guests", match: ["/guests", "/seating", "/floorplan", "/dietary", "/travel", "/site"] },
  { href: "/vendors", label: "Vendors", icon: "vendors", match: ["/vendors", "/payments", "/handoffs"] },
  { href: "/planning", label: "Planning", icon: "planning", match: ["/planning", "/checklist", "/timeline", "/tasks", "/diy", "/moodboard", "/decisions"] },
  { href: "/day-of", label: "The Day", icon: "day", match: ["/day-of", "/run-of-show", "/packet", "/people", "/party", "/attire", "/music"] },
  { href: "/budget", label: "Budget", icon: "budget", match: ["/budget"] },
  { href: "/registry", label: "Registry", icon: "registry", match: ["/registry"] },
] as const;

export const VISUAL_ROOMS = [
  { href: "/guests", label: "Guests", photo: "/brand/setting.jpg", line: "Manage your guest list, RSVPs, plus-ones and seating", icon: "users" },
  { href: "/vendors", label: "Vendors", photo: "/brand/garden.jpg", line: "Find, book, and manage your vendors", icon: "bag" },
  { href: "/planning", label: "Planning", photo: "/brand/flowers.jpg", line: "Vision, checklists, timeline, and to-dos", icon: "calendar" },
  { href: "/day-of", label: "The Day", photo: "/brand/candles.jpg", line: "Run of show and day-of details", icon: "sun" },
  { href: "/budget", label: "Budget", photo: "/brand/setting.jpg", line: "Track budget, payments, and expenses", icon: "wallet" },
  { href: "/registry", label: "Registry", photo: "/brand/garden.jpg", line: "Manage your registry and gifts", icon: "gift" },
] as const;

export const MORE_ROOMS: { href: string; label: string }[] = [
  { href: "/diy", label: "DIY studio" },
  { href: "/seating", label: "Seating" },
  { href: "/floorplan", label: "Floor plan" },
  { href: "/music", label: "Music" },
  { href: "/travel", label: "Travel" },
  { href: "/payments", label: "Payments" },
  { href: "/run-of-show", label: "Run of show" },
  { href: "/site", label: "Guest site" },
  { href: "/moodboard", label: "Moodboard" },
  { href: "/settings", label: "Settings" },
  { href: "/mobile", label: "Phone / app" },
  { href: "/improvements", label: "Improvements" },
  { href: "/discover", label: "Discover" },
  { href: "/", label: "Marketing site" },
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

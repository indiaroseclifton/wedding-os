export const VISUAL_ROOMS = [
  { href: "/guests", label: "Guests", photo: "/brand/setting.jpg", line: "Who’s coming" },
  { href: "/diy", label: "Make it", photo: "/brand/flowers.jpg", line: "Flowers, tables, the rest" },
  { href: "/vendors", label: "Vendors", photo: "/brand/garden.jpg", line: "Who you’re hiring" },
  { href: "/day-of", label: "The day", photo: "/brand/candles.jpg", line: "Hour by hour" },
  { href: "/music", label: "Music", photo: "/brand/candles.jpg", line: "Must-plays" },
  { href: "/site", label: "Guest site", photo: "/brand/garden.jpg", line: "What they open" },
] as const;

export const MORE_ROOMS: { href: string; label: string }[] = [
  { href: "/checklist", label: "Checklist" },
  { href: "/seating", label: "Seating" },
  { href: "/floorplan", label: "Floor plan" },
  { href: "/travel", label: "Travel" },
  { href: "/payments", label: "Payments" },
  { href: "/handoffs", label: "Handoffs" },
  { href: "/run-of-show", label: "Run of show" },
  { href: "/budget", label: "Budget" },
  { href: "/registry", label: "Registry" },
  { href: "/moodboard", label: "Moodboard" },
  { href: "/media", label: "Photos" },
  { href: "/settings", label: "Settings" },
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

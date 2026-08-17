import { daysUntil } from "@/lib/this-week";

export type AfterBeat = {
  id: string;
  when: string;
  title: string;
  detail: string;
  href: string;
  fromDay: number;
  toDay: number;
};

export const AFTER_BEATS: AfterBeat[] = [
  {
    id: "returns",
    when: "This week",
    title: "Returns and leftover flowers",
    detail: "Rentals go back. Someone takes the arrangements or they die in the car.",
    href: "/diy",
    fromDay: 0,
    toDay: 7,
  },
  {
    id: "cards",
    when: "Weeks 2–4",
    title: "Start the thank-you cards",
    detail: "Gifts first. Industry practice is three months — start now so week 12 isn't a panic.",
    href: "/thanks",
    fromDay: 8,
    toDay: 30,
  },
  {
    id: "photos",
    when: "Around week 8",
    title: "Photos should be moving",
    detail: "If the gallery isn't promised, ask. Don't wait until you need a Christmas card.",
    href: "/vendors",
    fromDay: 31,
    toDay: 70,
  },
  {
    id: "reviews",
    when: "By week 12",
    title: "Mark the team. Tell Google if you want.",
    detail: "Yes / Maybe / No stays private. Public praise lives on their page.",
    href: "/thanks#team",
    fromDay: 14,
    toDay: 90,
  },
  {
    id: "deadline",
    when: "Three months",
    title: "Thank-yous should be gone",
    detail: "The rule nobody puts in the app. After this, aunts mention it at Christmas.",
    href: "/thanks",
    fromDay: 80,
    toDay: 120,
  },
];

export function afterPhase(weddingDate?: string, today = new Date()) {
  const d = daysUntil(weddingDate, today);
  if (d == null) return { daysAgo: null, current: AFTER_BEATS[0], upcoming: AFTER_BEATS };
  const daysAgo = -d;
  if (daysAgo < 0) return { daysAgo, current: null, upcoming: AFTER_BEATS };
  const current = AFTER_BEATS.find((b) => daysAgo >= b.fromDay && daysAgo <= b.toDay) || AFTER_BEATS[AFTER_BEATS.length - 1];
  return { daysAgo, current, upcoming: AFTER_BEATS };
}

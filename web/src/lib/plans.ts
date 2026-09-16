export type PlanId = "good" | "better" | "best";

export type NameSet = {
  id: string;
  good: string;
  better: string;
  best: string;
  note: string;
};

export const NAME_SETS: NameSet[] = [
  { id: "desk", good: "Desk", better: "Studio", best: "Day", note: "Matches the product. Studio is the paid flagship." },
  { id: "paper", good: "Paper", better: "Cloth", best: "Silk", note: "Quiet. Sounds like the table, not a credit card." },
  { id: "letter", good: "Letter", better: "Suite", best: "House", note: "Invitation language. House = the whole weekend." },
  { id: "seed", good: "Seed", better: "Stem", best: "Table", note: "Studio-first. Grows with the work." },
  { id: "one", good: "One", better: "Many", best: "All", note: "Blunt. About quantity, not jewelry." },
  { id: "guest", good: "Us", better: "Room", best: "Hall", note: "How big the day is. Hall can feel venue-ish." },
  { id: "ink", good: "Ink", better: "Press", best: "Bound", note: "Print shop. Bound is the finished book." },
];

export const PLANS: {
  id: PlanId;
  price: string;
  cadence: string;
  blurb: string;
}[] = [
  { id: "good", price: "Free", cadence: "", blurb: "A real small desk. Caps on count, not on the idea." },
  { id: "better", price: "$99", cadence: "/mo", blurb: "Make it and print it. One planning year of work." },
  { id: "best", price: "$199", cadence: "/mo", blurb: "AI, SMS, pipes, the weekend, extra seats." },
];

export type FeatureRow = {
  id: string;
  group: string;
  label: string;
  good: string;
  better: string;
  best: string;
};

export const FEATURES: FeatureRow[] = [
  { id: "guests", group: "People", label: "Guests on the list", good: "40", better: "150", best: "Unlimited" },
  { id: "events", group: "People", label: "Events under one wedding", good: "2", better: "6", best: "Unlimited" },
  { id: "seats", group: "People", label: "People at the desk", good: "Couple", better: "Couple + 2", best: "Couple, family, planner" },
  { id: "vendors-in", group: "People", label: "Vendor seats", good: "—", better: "Send packet", best: "Thin portal" },
  { id: "home", group: "Desk", label: "Home / This week", good: "Yes", better: "Yes", best: "Yes" },
  { id: "vision", group: "Desk", label: "Vision + Pinterest URL", good: "Yes", better: "Yes", best: "Yes" },
  { id: "checklist", group: "Desk", label: "Checklist + timeline", good: "Yes", better: "Yes", best: "Yes" },
  { id: "site", group: "Desk", label: "Guest site", good: "Subdomain + mark", better: "Custom domain", best: "Custom + weekend pages" },
  { id: "studio", group: "Make", label: "Studio (flowers, table, signs)", good: "Look only", better: "Full", best: "Full" },
  { id: "floor", group: "Make", label: "Floor → print sheets", good: "—", better: "Yes", best: "Yes" },
  { id: "print", group: "Make", label: "Mass print / Printful", good: "Screen only", better: "3 credits / mo", best: "Pool included" },
  { id: "canva", group: "Make", label: "Canva Bulk Create", good: "1 export", better: "Yes", best: "Yes" },
  { id: "music", group: "Day", label: "Music + DJ packet", good: "List only", better: "Search + print", best: "Search + send" },
  { id: "travel", group: "Day", label: "Hotels / room blocks", good: "Notes", better: "Search links", best: "Search + site block" },
  { id: "budget", group: "Money", label: "Budget + payments", good: "One number", better: "Envelopes + ledger", best: "Envelopes + receipts" },
  { id: "legal", group: "Money", label: "Contracts", good: "Checklist", better: "Checklist", best: "Checklist + summarize" },
  { id: "copilot", group: "Connect", label: "Copilot", good: "—", better: "50 tokens / mo", best: "Unlimited" },
  { id: "sms", group: "Connect", label: "SMS", good: "—", better: "200 / mo", best: "1,000 / mo" },
  { id: "drive", group: "Connect", label: "Folder by URL", good: "1 Drive", better: "Drive + OneDrive + iCloud", best: "Several, tagged" },
  { id: "live", group: "Connect", label: "Live photos / stream", good: "Link out", better: "Gallery wrap", best: "Gallery + stream on site" },
  { id: "packs", group: "Business", label: "Event packs", good: "Wedding", better: "Wedding + 1", best: "All packs" },
];

export const GROUPS = ["People", "Desk", "Make", "Day", "Money", "Connect", "Business"];

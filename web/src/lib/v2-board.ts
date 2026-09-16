export type V2Status = "shipped" | "first-cut" | "needs-work" | "open";
export type V2Group =
  | "Home"
  | "Before"
  | "People"
  | "Studio"
  | "The day"
  | "After"
  | "Money"
  | "V2 add-ons";

export type V2Item = {
  id: string;
  rank: number;
  group: V2Group;
  title: string;
  why: string;
  doThis: string;
  wrap: string;
  href: string;
  status: V2Status;
};

export const V2_ITEMS: V2Item[] = [
  { id: "home", rank: 1, group: "Home", title: "Home / This week", why: "The desk starts here.", doThis: "Keep This week deterministic. Notes on tone, kick order, density.", wrap: "dashboard + this-week.ts", href: "/dashboard", status: "shipped" },
  { id: "shape-plan", rank: 2, group: "Before", title: "Shape + Plan", why: "The day’s shape is the plan.", doThis: "Pick us / small / weekend / two on Plan. It writes workspace.shape.", wrap: "shape.ts + applyShape + /planning", href: "/planning", status: "first-cut" },
  { id: "vision", rank: 3, group: "Before", title: "Vision / brief", why: "Feeling before the list.", doThis: "Notes on vibe, palette, formality.", wrap: "/planning/vision", href: "/planning/vision", status: "shipped" },
  { id: "moodboard", rank: 4, group: "Before", title: "Moodboard", why: "Pictures that lock the brief.", doThis: "Notes on upload, boards, sharing.", wrap: "/moodboard", href: "/moodboard", status: "shipped" },
  { id: "together", rank: 5, group: "Before", title: "Together", why: "Calls that need both of you.", doThis: "Notes on owners and unresolved items.", wrap: "/together", href: "/together", status: "shipped" },
  { id: "checklist", rank: 6, group: "Before", title: "Checklist", why: "Shape should drive which tasks exist.", doThis: "Hide aisle work when shape has no aisle.", wrap: "checklist-store + apply-shape", href: "/checklist", status: "shipped" },
  { id: "timeline", rank: 7, group: "Before", title: "Planning timeline", why: "Months, not the hour.", doThis: "Notes on milestones vs run-of-show.", wrap: "/timeline", href: "/timeline", status: "shipped" },
  { id: "decisions", rank: 8, group: "Before", title: "Decisions", why: "Open calls that unblock work.", doThis: "Notes on path hire/make.", wrap: "/decisions", href: "/decisions", status: "shipped" },
  { id: "vendors", rank: 9, group: "Before", title: "Vendors (hired people)", why: "Caterer, DJ, florist — not a marketplace.", doThis: "Notes on cards, packets, find page.", wrap: "/vendors TEAM_ROLES", href: "/vendors", status: "shipped" },
  { id: "guest-list", rank: 10, group: "People", title: "Guest list", why: "Households are the source of truth.", doThis: "Notes on plus-ones, dietary, import.", wrap: "/guests", href: "/guests", status: "shipped" },
  { id: "events-rsvp", rank: 11, group: "People", title: "Events & RSVP", why: "Weekend events under one wedding.", doThis: "Notes on multi-event RSVP.", wrap: "/events", href: "/events", status: "shipped" },
  { id: "seating", rank: 12, group: "People", title: "Seating", why: "Who sits where.", doThis: "Keep list. Floor is the picture.", wrap: "/seating", href: "/seating", status: "shipped" },
  { id: "floor-print", rank: 13, group: "People", title: "Flat floor → print sheets", why: "Seating has to become paper.", doThis: "Drag tables, stage, bar, dance floor. Print place cards and table list.", wrap: "Konva later. First cut is CSS drag on /floorplan.", href: "/floorplan", status: "first-cut" },
  { id: "travel", rank: 14, group: "People", title: "Travel & room blocks", why: "Courtesy vs guaranteed already exists.", doThis: "Search hotels via Booking / Hotels.com links. No fake booking engine.", wrap: "/travel + TravelSearch", href: "/travel", status: "first-cut" },
  { id: "guest-site", rank: 15, group: "People", title: "Guest site", why: "The letter they actually open.", doThis: "Notes on invite vs announce.", wrap: "/site and /w", href: "/site", status: "shipped" },
  { id: "studio", rank: 16, group: "Studio", title: "Studio home", why: "Flagship. Make the flowers, table, signs.", doThis: "Notes on projects and build week.", wrap: "/studio", href: "/studio", status: "shipped" },
  { id: "flowers", rank: 17, group: "Studio", title: "Flowers", why: "Quantities, not vibes.", doThis: "Notes on stems and recipes.", wrap: "/diy/studio/floral", href: "/diy/studio/floral", status: "shipped" },
  { id: "tables", rank: 18, group: "Studio", title: "Tables", why: "Place settings become a buy list.", doThis: "Notes on covers and rentals.", wrap: "/diy/studio/table", href: "/diy/studio/table", status: "shipped" },
  { id: "cards", rank: 19, group: "Studio", title: "Cards + Canva", why: "List becomes paper.", doThis: "CSV + Open Canva already live. Notes on Bulk Create.", wrap: "CardsDesk + canva.com", href: "/studio/cards", status: "first-cut" },
  { id: "signs", rank: 20, group: "Studio", title: "Signs / Cricut", why: "Same paper family.", doThis: "Notes on cut files and Canva sizes.", wrap: "/studio/signage", href: "/studio/signage", status: "shipped" },
  { id: "studio-buy", rank: 21, group: "Studio", title: "Studio buy-links", why: "Buying is Studio, not Vendors.", doThis: "Amazon, Alibaba, grocery, wholesale rows. Outbound only.", wrap: "ShopSources on /studio/shop", href: "/studio/shop", status: "first-cut" },
  { id: "inventory", rank: 22, group: "Studio", title: "Inventory & boxes", why: "What you made has to go somewhere after.", doThis: "Notes on keep / sell / donate.", wrap: "/studio/inventory", href: "/studio/inventory", status: "shipped" },
  { id: "day-of", rank: 23, group: "The day", title: "Live run", why: "The hour, not the months.", doThis: "Notes on call sheet.", wrap: "/day-of", href: "/day-of", status: "shipped" },
  { id: "run-of-show", rank: 24, group: "The day", title: "Run of show", why: "Edit the hour.", doThis: "Notes on cues hidden by enterHow.", wrap: "/run-of-show", href: "/run-of-show", status: "shipped" },
  { id: "music-dj", rank: 25, group: "The day", title: "Music + DJ handoff", why: "Packet has to leave the building.", doThis: "Cue sheet, must/don’t, /music/print. Notes on what DJs still lack.", wrap: "Spotify + MusicKit + /handoffs", href: "/music", status: "shipped" },
  { id: "packet", rank: 26, group: "The day", title: "Day packet", why: "One pack for the team.", doThis: "Notes on print and send.", wrap: "/packet /send", href: "/packet", status: "shipped" },
  { id: "after", rank: 27, group: "After", title: "After 90-day clock", why: "Already wired. Don’t advertise if date is still future.", doThis: "Two-week vs three-month thank-you rules added as a strip. Notes on pace.", wrap: "after-desk.ts + AfterGiftRules", href: "/after", status: "first-cut" },
  { id: "thanks", rank: 28, group: "After", title: "Thank-yous", why: "Presence, not only SKUs.", doThis: "Notes on gifts and addresses.", wrap: "/thanks", href: "/thanks", status: "shipped" },
  { id: "budget", rank: 29, group: "Money", title: "Budget one-number", why: "Cap + envelopes + vendors + DIY already roll up.", doThis: "Receipt photo slot is first-cut (no OCR yet).", wrap: "/budget rollup + ReceiptSlot", href: "/budget", status: "first-cut" },
  { id: "payments", rank: 30, group: "Money", title: "Payments ledger", why: "Deposits and balances.", doThis: "Notes on due dates.", wrap: "/payments", href: "/payments", status: "shipped" },
  { id: "registry", rank: 31, group: "Money", title: "Registry + gifts", why: "Log + outbound links.", doThis: "Notes on Zola/Amazon connect.", wrap: "/registry", href: "/registry", status: "shipped" },
  { id: "legal", rank: 32, group: "Money", title: "Contracts", why: "Nine-clause review exists.", doThis: "Summarize later. Notes on what to scan.", wrap: "/legal", href: "/legal", status: "shipped" },
  { id: "auth", rank: 33, group: "V2 add-ons", title: "Auth Google / Apple", why: "Magic link + demo today.", doThis: "Buttons on login. Wire Auth.js when keys exist.", wrap: "LoginForm extras", href: "/login", status: "first-cut" },
  { id: "copilot", rank: 34, group: "V2 add-ons", title: "Copilot token add-on", why: "Questions and tasks. Not This week.", doThis: "Shell in the desk. Character name later.", wrap: "CopilotDock", href: "/dashboard", status: "first-cut" },
  { id: "money-plan", rank: 35, group: "V2 add-ons", title: "Monetization", why: "Charge the couple, not vendors.", doThis: "Desk free · Studio paid · packet credits · Copilot tokens.", wrap: "Stripe later", href: "/v2#money-plan", status: "open" },
  { id: "marketing", rank: 36, group: "V2 add-ons", title: "Marketing", why: "Plan it. Make it. Celebrate it.", doThis: "Atlanta first. Studio photos. No confetti copy.", wrap: "PRODUCT.md + /", href: "/", status: "open" },
];

export type V2Status = "shipped" | "first-cut" | "needs-work" | "open";
export type V2Group =
  | "Home"
  | "Before"
  | "People"
  | "Studio"
  | "The day"
  | "After"
  | "Money"
  | "Connect"
  | "Not built yet"
  | "Business";

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
  { id: "notifications", rank: 2, group: "Home", title: "Notifications", why: "Bell on the mast. Kick items are the real alerts.", doThis: "Notes on what should ping vs sit on This week.", wrap: "AppShell bell + dashboard#attention", href: "/dashboard#attention", status: "shipped" },
  { id: "recommendations", rank: 3, group: "Home", title: "Recommendations", why: "Local ideas and next moves without a marketplace.", doThis: "Notes on what should suggest vs stay quiet.", wrap: "this-week + Discover. No vendor ads.", href: "/discover", status: "needs-work" },

  { id: "shape-plan", rank: 4, group: "Before", title: "Shape + Plan", why: "The day’s shape is the plan.", doThis: "Pick us / small / weekend / two on Plan.", wrap: "shape.ts + /planning", href: "/planning", status: "first-cut" },
  { id: "vision", rank: 5, group: "Before", title: "Vision / brief", why: "Feeling before the list.", doThis: "Notes on vibe, palette, formality.", wrap: "/planning/vision", href: "/planning/vision", status: "shipped" },
  { id: "moodboard", rank: 6, group: "Before", title: "Moodboard", why: "Pictures that lock the brief.", doThis: "Notes on upload, boards, sharing.", wrap: "/moodboard", href: "/moodboard", status: "shipped" },
  { id: "together", rank: 7, group: "Before", title: "Together", why: "Calls that need both of you.", doThis: "Notes on owners and unresolved items.", wrap: "/together", href: "/together", status: "shipped" },
  { id: "checklist", rank: 8, group: "Before", title: "Checklist", why: "Shape should drive which tasks exist.", doThis: "Hide aisle work when shape has no aisle.", wrap: "checklist-store + apply-shape", href: "/checklist", status: "shipped" },
  { id: "timeline", rank: 9, group: "Before", title: "Planning timeline", why: "Months, not the hour.", doThis: "Notes on milestones vs run-of-show.", wrap: "/timeline", href: "/timeline", status: "shipped" },
  { id: "decisions", rank: 10, group: "Before", title: "Decisions", why: "Open calls that unblock work.", doThis: "Notes on path hire/make.", wrap: "/decisions", href: "/decisions", status: "shipped" },
  { id: "vendors", rank: 11, group: "Before", title: "Vendors (hired people)", why: "Caterer, DJ, florist — not a marketplace.", doThis: "Notes on cards, packets, find page.", wrap: "/vendors TEAM_ROLES", href: "/vendors", status: "shipped" },
  { id: "vendor-search", rank: 12, group: "Before", title: "Vendor search", why: "Find a caterer or DJ without becoming The Knot.", doThis: "Notes on local lists vs outbound Google.", wrap: "/vendors/browse", href: "/vendors/browse", status: "needs-work" },
  { id: "venue-search", rank: 13, group: "Before", title: "Venue search", why: "Place first. Not a listing marketplace.", doThis: "Notes on maps vs saved venues.", wrap: "None yet. Leave what you want.", href: "/vendors", status: "open" },
  { id: "local-ideas", rank: 14, group: "Before", title: "Local ideas", why: "Atlanta first. What is near this wedding.", doThis: "Notes on food, florists, photo spots.", wrap: "Discover is thin.", href: "/discover", status: "open" },

  { id: "guest-list", rank: 15, group: "People", title: "Guest list", why: "Households are the source of truth.", doThis: "Notes on plus-ones, dietary, import.", wrap: "/guests", href: "/guests", status: "shipped" },
  { id: "events-rsvp", rank: 16, group: "People", title: "Events & RSVP", why: "Weekend events under one wedding.", doThis: "Notes on multi-event RSVP.", wrap: "/events", href: "/events", status: "shipped" },
  { id: "multi-event", rank: 17, group: "People", title: "Multi event under one event", why: "Welcome dinner, ceremony, brunch — one household list.", doThis: "Notes on child events and who is invited to which.", wrap: "/events", href: "/events", status: "needs-work" },
  { id: "invitations", rank: 18, group: "People", title: "Digital invitations", why: "Create and send without a second product.", doThis: "Notes on design, RSVP link, paper vs digital.", wrap: "Guest site /w + Studio cards", href: "/site", status: "needs-work" },
  { id: "guest-site", rank: 19, group: "People", title: "Guest website", why: "The letter they actually open.", doThis: "Notes on invite vs announce, schedule, travel.", wrap: "/site and /w", href: "/site", status: "shipped" },
  { id: "seating", rank: 20, group: "People", title: "Seating", why: "Who sits where.", doThis: "Keep list. Floor is the picture.", wrap: "/seating", href: "/seating", status: "shipped" },
  { id: "floor-print", rank: 21, group: "People", title: "Flat floor → print sheets", why: "Seating has to become paper.", doThis: "Drag tables, stage, bar, dance floor. Print sheets.", wrap: "/floorplan first cut", href: "/floorplan", status: "first-cut" },
  { id: "travel", rank: 22, group: "People", title: "Travel & room blocks", why: "Courtesy vs guaranteed already exists.", doThis: "Notes on hotels, shuttle, airport.", wrap: "/travel + TravelSearch", href: "/travel", status: "first-cut" },
  { id: "hotel-recs", rank: 23, group: "People", title: "Hotel and lodging recommendations", why: "Guests need a place, not an OTA.", doThis: "Notes on how recs should feel.", wrap: "Booking / Hotels.com links on /travel", href: "/travel", status: "first-cut" },
  { id: "invite-users", rank: 24, group: "People", title: "Invite users (couple, family)", why: "More than one person at the desk.", doThis: "Notes on roles: owner, partner, mom, planner.", wrap: "Demo Alex/Jordan. Real invites later.", href: "/settings", status: "needs-work" },
  { id: "invite-vendors", rank: 25, group: "People", title: "Invite vendors", why: "They get a packet, not a second product.", doThis: "Notes on what a vendor should see.", wrap: "/send + /handoffs. No vendor portal yet.", href: "/send", status: "needs-work" },
  { id: "guest-comms", rank: 26, group: "People", title: "Talk to guests", why: "Email / site / later SMS.", doThis: "Notes on reminders vs spam.", wrap: "Resend + guest site", href: "/site", status: "needs-work" },
  { id: "vendor-comms", rank: 27, group: "People", title: "Talk to vendors", why: "Packets and handoffs, not HoneyBook chat.", doThis: "Notes on what to send when.", wrap: "/send /handoffs", href: "/handoffs", status: "shipped" },

  { id: "studio", rank: 28, group: "Studio", title: "Studio home", why: "Flagship. Make the flowers, table, signs.", doThis: "Notes on projects and build week.", wrap: "/studio", href: "/studio", status: "shipped" },
  { id: "flowers", rank: 29, group: "Studio", title: "Flowers", why: "Quantities, not vibes.", doThis: "Notes on stems and recipes.", wrap: "/diy/studio/floral", href: "/diy/studio/floral", status: "shipped" },
  { id: "tables", rank: 30, group: "Studio", title: "Tables", why: "Place settings become a buy list.", doThis: "Notes on covers and rentals.", wrap: "/diy/studio/table", href: "/diy/studio/table", status: "shipped" },
  { id: "cards", rank: 31, group: "Studio", title: "Cards + Canva", why: "List becomes paper.", doThis: "Notes on Bulk Create and sizes.", wrap: "CardsDesk + canva.com", href: "/studio/cards", status: "first-cut" },
  { id: "menus-programs", rank: 32, group: "Studio", title: "Menus and programs", why: "Same paper family as cards.", doThis: "Notes on menu CSV and program layout.", wrap: "CardsDesk menu CSV + signage", href: "/studio/cards", status: "needs-work" },
  { id: "signs", rank: 33, group: "Studio", title: "Signs / Cricut", why: "Same paper family.", doThis: "Notes on cut files and Canva sizes.", wrap: "/studio/signage", href: "/studio/signage", status: "shipped" },
  { id: "studio-buy", rank: 34, group: "Studio", title: "Buy links — Amazon / Alibaba / grocery", why: "Buying is Studio, not Vendors.", doThis: "Notes on which stores belong.", wrap: "ShopSources on /studio/shop", href: "/studio/shop", status: "first-cut" },
  { id: "buy-ebay-temu", rank: 35, group: "Studio", title: "Buy links — eBay / Temu", why: "Same idea, other stores.", doThis: "Add rows if you want them. Or say no.", wrap: "Not on shop yet.", href: "/studio/shop", status: "open" },
  { id: "inventory", rank: 36, group: "Studio", title: "Inventory & boxes", why: "What you made has to go somewhere after.", doThis: "Notes on keep / sell / donate.", wrap: "/studio/inventory", href: "/studio/inventory", status: "shipped" },
  { id: "print-mass", rank: 37, group: "Studio", title: "Print in mass", why: "Letter tonight vs Printful later.", doThis: "Notes on Avery vs print-on-demand.", wrap: "window.print + Avery. Printful MCP later.", href: "/studio/cards", status: "open" },
  { id: "print-photos", rank: 38, group: "Studio", title: "Print photos", why: "Guest photos and thank-you prints.", doThis: "Notes on labs vs home printer.", wrap: "Not built.", href: "/studio", status: "open" },

  { id: "day-of", rank: 39, group: "The day", title: "Live run", why: "The hour, not the months.", doThis: "Notes on call sheet.", wrap: "/day-of", href: "/day-of", status: "shipped" },
  { id: "run-of-show", rank: 40, group: "The day", title: "Run of show", why: "Edit the hour.", doThis: "Notes on cues hidden by enterHow.", wrap: "/run-of-show", href: "/run-of-show", status: "shipped" },
  { id: "music-dj", rank: 41, group: "The day", title: "Music + DJ handoff", why: "Packet has to leave the building.", doThis: "Notes on what DJs still lack.", wrap: "Spotify + MusicKit + /handoffs + /music/print", href: "/music", status: "shipped" },
  { id: "playlists", rank: 42, group: "The day", title: "Playlists", why: "Must-play becomes a real list.", doThis: "Notes on Spotify vs Apple export.", wrap: "/music search + export", href: "/music", status: "shipped" },
  { id: "packet", rank: 43, group: "The day", title: "Day packet", why: "One pack for the team.", doThis: "Notes on print and send.", wrap: "/packet /send", href: "/packet", status: "shipped" },
  { id: "live-photos", rank: 44, group: "The day", title: "Live photo app", why: "Guests drop photos without a new login maze.", doThis: "Notes on guest gallery vs vendor gallery.", wrap: "Not built. Wrap an existing gallery later.", href: "/day-of", status: "open" },
  { id: "live-stream", rank: 45, group: "The day", title: "Live stream", why: "Family who cannot travel.", doThis: "Notes on YouTube / Zoom link on the guest site. Do not build a stream engine.", wrap: "Not built. Link-out only.", href: "/site", status: "open" },

  { id: "after", rank: 46, group: "After", title: "After 90-day clock", why: "Already wired.", doThis: "Notes on pace and when the room opens.", wrap: "after-desk.ts + AfterGiftRules", href: "/after", status: "first-cut" },
  { id: "thanks", rank: 47, group: "After", title: "Thank-yous", why: "Presence, not only SKUs.", doThis: "Notes on gifts and addresses.", wrap: "/thanks", href: "/thanks", status: "shipped" },
  { id: "returns", rank: 48, group: "After", title: "Returns", why: "Rentals and Studio boxes come home.", doThis: "Notes on deadlines.", wrap: "/after#returns + inventory", href: "/after#returns", status: "shipped" },
  { id: "reviews", rank: 49, group: "After", title: "Vendor reviews", why: "Close the loop. Private first.", doThis: "Notes on public vs private.", wrap: "/after#reviews", href: "/after#reviews", status: "needs-work" },

  { id: "budget", rank: 50, group: "Money", title: "Budget one-number", why: "Cap + envelopes + vendors + DIY roll up.", doThis: "Notes on envelopes and family-pays.", wrap: "/budget", href: "/budget", status: "first-cut" },
  { id: "payments", rank: 51, group: "Money", title: "Payments ledger", why: "Deposits and balances.", doThis: "Notes on due dates.", wrap: "/payments", href: "/payments", status: "shipped" },
  { id: "receipts", rank: 52, group: "Money", title: "Scan receipts", why: "Photo now. OCR later.", doThis: "Notes on what a receipt should become.", wrap: "ReceiptSlot component exists. Wire into /budget.", href: "/budget", status: "open" },
  { id: "registry", rank: 53, group: "Money", title: "Registry + gifts", why: "Log + outbound links.", doThis: "Notes on Zola / Amazon connect.", wrap: "/registry", href: "/registry", status: "shipped" },
  { id: "legal", rank: 54, group: "Money", title: "Contracts checklist", why: "Nine-clause review exists.", doThis: "Notes on the nine questions.", wrap: "/legal", href: "/legal", status: "shipped" },
  { id: "contract-summarize", rank: 55, group: "Money", title: "Summarize contracts", why: "PDF in, short read out.", doThis: "Notes on what you want quoted back.", wrap: "Not built. Do not fake it.", href: "/legal", status: "open" },

  { id: "auth", rank: 56, group: "Connect", title: "Auth Google / Apple", why: "Magic link + demo today.", doThis: "Buttons on login. Wire Auth.js when keys exist.", wrap: "LoginForm extras", href: "/login", status: "first-cut" },
  { id: "email-scan", rank: 57, group: "Connect", title: "Scan emails for vendor info", why: "Contracts and dates hide in Gmail.", doThis: "Notes on what to pull. Gmail connector later.", wrap: "Not built.", href: "/integrations", status: "open" },
  { id: "sms", rank: 58, group: "Connect", title: "SMS", why: "Day-of and guest pings. Credits, not unlimited.", doThis: "Notes on who gets texts.", wrap: "Not built. Twilio later.", href: "/send", status: "open" },
  { id: "social", rank: 59, group: "Connect", title: "Facebook / Instagram / TikTok", why: "Update the page, do not become a scheduler product.", doThis: "Notes on Buffer later vs a paste box.", wrap: "Not built. Buffer connector available.", href: "/", status: "open" },
  { id: "integrations-hub", rank: 60, group: "Connect", title: "Integrations hub", why: "Wrap other systems. Do not rebuild them.", doThis: "Notes on Spotify, Apple, Canva, Printful, Stripe.", wrap: "/integrations", href: "/integrations", status: "needs-work" },
  { id: copilot, rank: 61, group: "Connect", title: "Copilot token add-on", why: "Questions and tasks. Not This week.", doThis: "Shell exists. Character name later.", wrap: "CopilotDock", href: "/dashboard", status: "first-cut" },

  { id: "vendor-portal", rank: 62, group: "Not built yet", title: "Vendor portal", why: "They log in to see the packet and floor.", doThis: "Notes on how thin this should stay.", wrap: "Invite + /send first. Portal later.", href: "/send", status: "open" },
  { id: "event-packs", rank: 63, group: "Not built yet", title: "Other event packs", why: "Wedding first. Mitzvah, gala, birthday later.", doThis: "Notes on which pack is second.", wrap: "Hold name. Layer packs later.", href: "/planning", status: "open" },
  { id: "live-app", rank: 64, group: "Not built yet", title: "Phone / PWA", why: "The desk on a phone.", doThis: "Notes on what must work offline.", wrap: "/mobile + service worker exists", href: "/mobile", status: "needs-work" },

  { id: "money-plan", rank: 65, group: "Business", title: "Monetization", why: "Charge the couple, not vendors.", doThis: "Desk free · Studio paid · packet credits · Copilot tokens.", wrap: "Stripe later", href: "/v2#money-plan", status: "open" },
  { id: "bundled-plan", rank: 66, group: "Business", title: "One plan, many services", why: "Client pays once. We buy the pipes.", doThis: "Notes on what sits inside the plan.", wrap: "Same as monetization.", href: "/v2#money-plan", status: "open" },
  { id: "marketing", rank: 67, group: "Business", title: "Marketing", why: "Plan it. Make it. Celebrate it.", doThis: "Atlanta first. Studio photos. No confetti copy.", wrap: "PRODUCT.md + /", href: "/", status: "open" },
];

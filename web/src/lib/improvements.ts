export type Improvement = {
  id: string;
  title: string;
  body: string;
  href?: string;
  status: "shipped" | "next" | "later";
};

export const IMPROVEMENTS: { phase: string; items: Improvement[] }[] = [
  {
    phase: "Shipped this week",
    items: [
      { id: "planning", title: "Planning is a desk", body: "Vision, checklist %, next milestone, hire-or-make — not six tiles.", href: "/planning", status: "shipped" },
      { id: "party", title: "Party roster and a real portal", body: "They mark their task, size, and check-in.", href: "/planning/party", status: "shipped" },
      { id: "mood", title: "Moodboard with pictures", body: "Pin a photo, tag it, use as cover.", href: "/moodboard", status: "shipped" },
      { id: "timeline", title: "Timeline on the wedding date", body: "“6 months out” becomes a day. Build from the date.", href: "/timeline", status: "shipped" },
      { id: "events", title: "Extra-event RSVPs on the list", body: "Rehearsal, brunch — columns, not a hidden map.", href: "/guests", status: "shipped" },
      { id: "budget", title: "Budget envelopes", body: "Typical wedding split, bars, who pays, coming due.", href: "/budget", status: "shipped" },
      { id: "phone", title: "Phone path + Capacitor shell", body: "Home screen today. Native wrapper in mobile/.", href: "/mobile", status: "shipped" },
      { id: "dietary", title: "Dietary that catering can use", body: "Meals, veg / GF / nut tags, every guest, one tap to the catering handoff.", href: "/dietary", status: "shipped" },
      { id: "registry", title: "Registry as a store", body: "Items with open / claimed / purchased. Thank-yous from the same list.", href: "/registry", status: "shipped" },
      { id: "site", title: "Guest site as a wedding website", body: "Letter, garden, or midnight. Gallery. RSVP close date.", href: "/site", status: "shipped" },
      { id: "vision", title: "Vision that actually steers", body: "Browse and DIY follow the locked vibe.", href: "/planning/vision", status: "shipped" },
      { id: "discover", title: "Public Discover with real places", body: "Search a city without signing in.", href: "/discover/vendors", status: "shipped" },
      { id: "packet", title: "Packet you can trim", body: "Pick sections. Email the coordinator.", href: "/packet", status: "shipped" },
    ],
  },
  {
    phase: "Later — real, but not this week",
    items: [
      { id: "stripe", title: "Stripe for deposits", body: "Ledger is honest. Charging cards is a different product.", href: "/payments", status: "later" },
      { id: "seating-rules", title: "Don’t sit X with Y", body: "Chair seating works. Constraints and a venue floor photo come after.", href: "/seating", status: "later" },
      { id: "households", title: "Households as people", body: "Named plus-ones on the RSVP, the list, and the chairs.", href: "/guests", status: "shipped" },
      { id: "site-share", title: "Guest site you can send", body: "Password, a text-this card, preview without publishing.", href: "/site", status: "shipped" },
      { id: "start", title: "First-wedding walkthrough", body: "Names, one vendor, publish. After the four questions.", href: "/start", status: "shipped" },
      { id: "camera", title: "Camera into the moodboard", body: "After the Capacitor wrapper runs on your phone.", href: "/mobile", status: "later" },
      { id: "push", title: "Push for dues and RSVPs", body: "Needs a worker and store listing. Page nudges stay until then.", href: "/mobile", status: "later" },
    ],
  },
];

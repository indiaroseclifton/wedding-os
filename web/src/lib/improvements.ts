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
    ],
  },
  {
    phase: "Next — still feel thin",
    items: [
      { id: "registry", title: "Registry as a store", body: "Items with claimed / purchased, not just a pasted Zola link. Thank-yous from the same list.", href: "/registry", status: "next" },
      { id: "site", title: "Guest site as a wedding website", body: "Templates, a gallery, a close date on RSVP. Right now it’s one letter.", href: "/site", status: "next" },
      { id: "vision", title: "Vision that actually steers", body: "Colors and vibe should filter vendors and DIY, not sit in a chip picker.", href: "/planning/vision", status: "next" },
      { id: "discover", title: "Public Discover with real places", body: "People who aren’t signed in should search near a city, not 25 demo names.", href: "/discover", status: "next" },
      { id: "packet", title: "Packet you can trim", body: "Pick sections and audience. Email to the coordinator.", href: "/packet", status: "next" },
    ],
  },
  {
    phase: "Later — real, but not this week",
    items: [
      { id: "stripe", title: "Stripe for deposits", body: "Ledger is honest. Charging cards is a different product.", href: "/payments", status: "later" },
      { id: "seating-rules", title: "Don’t sit X with Y", body: "Chair seating works. Constraints and a venue floor photo come after.", href: "/seating", status: "later" },
      { id: "households", title: "Households as people", body: "partyName is a string. Named plus-ones belong on the RSVP.", href: "/guests", status: "later" },
      { id: "camera", title: "Camera into the moodboard", body: "After the Capacitor wrapper runs on your phone.", href: "/mobile", status: "later" },
      { id: "push", title: "Push for dues and RSVPs", body: "Needs a worker and store listing. Page nudges stay until then.", href: "/mobile", status: "later" },
    ],
  },
];

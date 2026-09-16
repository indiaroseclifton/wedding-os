export type V2Status = "open" | "needs-work" | "noted" | "done";

export type V2Item = {
  id: string;
  rank: number;
  title: string;
  why: string;
  doThis: string;
  wrap: string;
  href: string;
  status: V2Status;
};

export const V2_ITEMS: V2Item[] = [
  {
    id: "shape-plan",
    rank: 1,
    title: "Shape + Plan one room",
    why: "The day’s shape is the plan. Two rooms split the same decision.",
    doThis: "Merge Shape into Plan. us / small / weekend / two drives the checklist. Hide aisle language when the shape has no aisle.",
    wrap: "Already in shape.ts, apply-shape.ts, planning pages. Combine, don’t rewrite.",
    href: "/planning",
    status: "open",
  },
  {
    id: "floor-print",
    rank: 2,
    title: "Flat floor → print sheets",
    why: "Seating has to become paper: place cards, table lists, cards.",
    doThis: "2D board with tables, stage, bar, dance floor. Export place cards and a table sheet. No 3D.",
    wrap: "Konva + react-konva. Reference wedding-seating-planner and Seating-Planner. pdf-lib for sheets. She already has /floorplan and /seating.",
    href: "/floorplan",
    status: "open",
  },
  {
    id: "studio-buy",
    rank: 3,
    title: "Studio buy-links",
    why: "Vendors are hired people. Buying stems and goods is Studio, not a marketplace.",
    doThis: "Amazon, Alibaba, grocery, wholesale as source rows. Outbound or affiliate. No cart.",
    wrap: "Amazon Product Advertising API. Alibaba affiliate. Existing /studio/shop sources.",
    href: "/studio/shop",
    status: "open",
  },
  {
    id: "canva",
    rank: 4,
    title: "Canva from Studio",
    why: "Signs, menus, programs already live here. Don’t build an editor.",
    doThis: "Open in Canva on sign / menu / program. Export back as PDF when cheap.",
    wrap: "Canva MCP (connected) + canva-connect-api-starter-kit.",
    href: "/studio/cards",
    status: "open",
  },
  {
    id: "after",
    rank: 5,
    title: "After 90-day clock",
    why: "She specified it. /thanks is a stub. Don’t advertise it as live until it runs.",
    doThis: "Gifts before the day: thank in two weeks. Gifts on/after: thank within three months. Presence, not only SKUs.",
    wrap: "PRODUCT.md After section. Wire /after and /thanks.",
    href: "/after",
    status: "open",
  },
  {
    id: "budget",
    rank: 6,
    title: "Budget one-number",
    why: "Payments, DIY estimates, and envelopes are split.",
    doThis: "One total. Receipt slot later (receipt-scanner / tesseract.js). Don’t fake OCR.",
    wrap: "budget-envelopes.ts + /payments.",
    href: "/budget",
    status: "open",
  },
  {
    id: "dj-handoff",
    rank: 7,
    title: "DJ handoff up front",
    why: "Playlists are useless if the DJ never gets the packet.",
    doThis: "Packet on the vendor card and on day-of. Spotify / Apple link inside it.",
    wrap: "Already shipped: Spotify, MusicKit, /handoffs, /music. Promote, don’t rebuild.",
    href: "/music",
    status: "open",
  },
  {
    id: "auth",
    rank: 8,
    title: "Auth Google / Apple",
    why: "Magic link only today.",
    doThis: "Add Google and Apple next to existing login. Keep magic link.",
    wrap: "Auth.js / NextAuth providers. Do not write OAuth.",
    href: "/settings",
    status: "open",
  },
  {
    id: "copilot",
    rank: 9,
    title: "Copilot token add-on",
    why: "Questions, tasks, reminders. Does not replace This week.",
    doThis: "Shell with a character (name later), token meter, writes into the existing checklist. Flag off by default.",
    wrap: "this-week.ts stays deterministic. Copilot is extra.",
    href: "/dashboard",
    status: "open",
  },
  {
    id: "travel",
    rank: 10,
    title: "Travel APIs as link-out",
    why: "Hotel blocks exist. Chain booking APIs take months and partner certs.",
    doThis: "Keep courtesy vs guaranteed. Add Travelpayouts or Booking links. Do not build Expedia Rapid.",
    wrap: "Existing /travel. Affiliate search only.",
    href: "/travel",
    status: "open",
  },
  {
    id: "money",
    rank: 11,
    title: "Monetization",
    why: "Knot sells vendors. Zola sells registry. We charge the couple.",
    doThis: "Desk free. Studio paid. Day-packet credits (SMS / print). Copilot tokens. Planner later. Stripe when charging.",
    wrap: "Stripe MCP. No vendor pay-to-rank.",
    href: "/v2#money",
    status: "open",
  },
  {
    id: "marketing",
    rank: 12,
    title: "Marketing",
    why: "The wedge is making, not another planner with AI.",
    doThis: "Plan it. Make it. Celebrate it. Atlanta first. Studio photos on Pinterest / IG. No confetti copy.",
    wrap: "PRODUCT.md voice. Landing already exists.",
    href: "/",
    status: "open",
  },
];

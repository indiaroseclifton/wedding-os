export type HowAction = {
  label: string;
  href: string;
  external?: boolean;
};

export type HowGuide = {
  id: string;
  title: string;
  href: string;
  steps: string[];
  actions?: HowAction[];
};

export const HOW_TO: HowGuide[] = [
  {
    id: "pinterest",
    title: "Link a Pinterest board",
    href: "/planning/vision",
    steps: [
      "Tap Sign in to Pinterest. Use the account that already has your wedding board.",
      "Open the board. It must be public — secret boards will not show here.",
      "Click the address bar. Copy the whole link. It looks like pinterest.com/yourname/board-name/",
      "Come back here. Paste that link in Board URL on Vision.",
      "Wait a second. The pins should appear. If they do not, the board is secret or you copied a search page.",
    ],
    actions: [
      { label: "Sign in to Pinterest", href: "https://www.pinterest.com/login/", external: true },
      { label: "Open Pinterest", href: "https://www.pinterest.com/", external: true },
      { label: "Paste it on Vision", href: "/planning/vision" },
    ],
  },
  {
    id: "vision",
    title: "Write the vision",
    href: "/planning/vision",
    steps: [
      "Start with This / not this if you do not have words yet.",
      "Or skip to Brief and pick vibe, dress, color story, and place.",
      "Link Pinterest if the pictures already live there.",
      "Lock this vision when you would hand it to a florist.",
    ],
    actions: [
      { label: "Open Vision", href: "/planning/vision" },
      { label: "How to link Pinterest", href: "#", },
      { label: "Open Pinterest", href: "https://www.pinterest.com/", external: true },
    ],
  },
  {
    id: "moodboard",
    title: "Use the moodboard",
    href: "/moodboard",
    steps: [
      "Open Moodboard.",
      "Add pictures you want to keep — not every pretty thing.",
      "Tag why you kept it.",
    ],
    actions: [{ label: "Open Moodboard", href: "/moodboard" }],
  },
  {
    id: "shape-plan",
    title: "Set the shape of the day",
    href: "/planning",
    steps: [
      "Open Plan.",
      "Pick us / small / weekend / two.",
      "The checklist hides work that shape does not need.",
    ],
    actions: [{ label: "Open Plan", href: "/planning" }],
  },
  {
    id: "floor-print",
    title: "Make a floor and print sheets",
    href: "/floorplan",
    steps: [
      "Open Floor.",
      "Drag tables, stage, bar, and dance floor.",
      "Print place cards and the table list from this room.",
    ],
    actions: [
      { label: "Open Floor", href: "/floorplan" },
      { label: "Open Seating", href: "/seating" },
    ],
  },
  {
    id: "studio-buy",
    title: "Buy for Studio",
    href: "/studio/shop",
    steps: [
      "Open Studio shop after flowers or tables have quantities.",
      "Use Amazon, Alibaba, or grocery. We send you out.",
    ],
    actions: [
      { label: "Open Shop", href: "/studio/shop" },
      { label: "Amazon", href: "https://www.amazon.com/", external: true },
      { label: "Alibaba", href: "https://www.alibaba.com/", external: true },
    ],
  },
  {
    id: "travel",
    title: "Hotels and room blocks",
    href: "/travel",
    steps: [
      "Open Travel.",
      "Search Booking / Hotels.com / Maps from the strip.",
      "Mark courtesy vs guaranteed.",
    ],
    actions: [
      { label: "Open Travel", href: "/travel" },
      { label: "Booking.com", href: "https://www.booking.com/", external: true },
      { label: "Hotels.com", href: "https://www.hotels.com/", external: true },
    ],
  },
  {
    id: "cards",
    title: "Cards and Canva",
    href: "/studio/cards",
    steps: [
      "Open Studio → Cards.",
      "Download the CSV.",
      "In Canva, use Bulk Create with that file.",
    ],
    actions: [
      { label: "Open Cards", href: "/studio/cards" },
      { label: "Open Canva", href: "https://www.canva.com/", external: true },
    ],
  },
  {
    id: "music-dj",
    title: "Music and DJ handoff",
    href: "/music",
    steps: [
      "Open Music.",
      "Build must-play and do-not-play.",
      "Send the packet from Handoffs.",
    ],
    actions: [
      { label: "Open Music", href: "/music" },
      { label: "Open Handoffs", href: "/handoffs" },
      { label: "Spotify", href: "https://open.spotify.com/", external: true },
    ],
  },
  {
    id: "guest-site",
    title: "Guest website",
    href: "/site",
    steps: [
      "Open Site.",
      "Write schedule, travel, dress, RSVP.",
      "Publish /w so guests have one link.",
    ],
    actions: [{ label: "Open Site", href: "/site" }],
  },
  {
    id: "budget",
    title: "Budget",
    href: "/budget",
    steps: [
      "Set the cap first.",
      "Put money in envelopes.",
      "Vendors and DIY roll into the same number.",
    ],
    actions: [{ label: "Open Budget", href: "/budget" }],
  },
  {
    id: "auth",
    title: "Sign in",
    href: "/login",
    steps: [
      "Use the magic link, or Google / Apple once keys exist.",
    ],
    actions: [{ label: "Open Login", href: "/login" }],
  },
  {
    id: "copilot",
    title: "Copilot",
    href: "/dashboard",
    steps: [
      "The button lives on the desk.",
      "Ask a question. It should write into This week.",
    ],
    actions: [{ label: "Open Home", href: "/dashboard" }],
  },
];

export function getHowTo(id: string): HowGuide | undefined {
  return HOW_TO.find((g) => g.id === id);
}

export function stepsFor(id: string, title: string, href: string, doThis: string): HowGuide {
  const found = getHowTo(id);
  if (found) return found;
  return {
    id,
    title,
    href,
    steps: [`Open ${title}.`, doThis, "Leave a note on the board if a step is missing."],
    actions: [
      { label: `Open ${title}`, href },
      { label: "Open the board", href: "/v2" },
    ],
  };
}

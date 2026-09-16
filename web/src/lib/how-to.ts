export type HowGuide = {
  id: string;
  title: string;
  href: string;
  steps: string[];
};

export const HOW_TO: HowGuide[] = [
  {
    id: "pinterest",
    title: "Link a Pinterest board",
    href: "/planning/vision",
    steps: [
      "Open Pinterest in another tab and sign in.",
      "Open the board you want on this wedding. It must be public — secret boards will not show.",
      "Click the address bar. Copy the whole link. It should look like pinterest.com/yourname/board-name/",
      "Come back to Vision. Paste that link in Board URL.",
      "Wait a second. The pins should appear under the field. If they do not, the board is secret or the link is a search page, not a board.",
      "Use Open on Pinterest any time you want to add more pins there. We do not import them into the moodboard yet.",
    ],
  },
  {
    id: "vision",
    title: "Write the vision",
    href: "/planning/vision",
    steps: [
      "Start with This / not this if you do not have words yet. Tap the picture that feels more like your day.",
      "Or skip to Brief and pick vibe, dress, color story, and place.",
      "Paste your Pinterest board at the top if you already collect pictures there.",
      "Save draft while you are still arguing. Lock this vision when you would hand it to a florist.",
    ],
  },
  {
    id: "moodboard",
    title: "Use the moodboard",
    href: "/moodboard",
    steps: [
      "Open Moodboard.",
      "Add pictures you want to keep — not every pretty thing.",
      "Tag why you kept it (light, table, dress, place).",
      "Share the board if someone else needs to see the same pictures.",
    ],
  },
  {
    id: "shape-plan",
    title: "Set the shape of the day",
    href: "/planning",
    steps: [
      "Open Plan.",
      "Pick us / small / weekend / two. That is the shape.",
      "The checklist will hide work that shape does not need — no aisle, no aisle tasks.",
      "Change it later if the day changes. Do not keep two shapes.",
    ],
  },
  {
    id: "floor-print",
    title: "Make a floor and print sheets",
    href: "/floorplan",
    steps: [
      "Open Floor.",
      "Drag tables, stage, bar, and dance floor where they go.",
      "Name tables so seating can match the paper.",
      "Print sheets — place cards and the table list — from this room.",
    ],
  },
  {
    id: "studio-buy",
    title: "Buy for Studio",
    href: "/studio/shop",
    steps: [
      "Open Studio shop after flowers or tables have quantities.",
      "Use Amazon, Alibaba, or grocery links for that item. We send you out. We do not check out for you.",
      "Come back and mark what you bought so the budget can see it.",
    ],
  },
  {
    id: "travel",
    title: "Hotels and room blocks",
    href: "/travel",
    steps: [
      "Open Travel.",
      "Write the hotel name you already have, or search Booking / Hotels.com / Maps from the strip.",
      "Mark courtesy vs guaranteed. Courtesy is a link. Guaranteed is a contract.",
      "Put the chosen hotel on the guest site so people stop texting you.",
    ],
  },
  {
    id: "cards",
    title: "Cards and Canva",
    href: "/studio/cards",
    steps: [
      "Open Studio → Cards.",
      "Download the CSV for place cards, menus, or programs.",
      "Open Canva. Use Bulk Create with that CSV.",
      "Print at home tonight, or send the file out later.",
    ],
  },
  {
    id: "music-dj",
    title: "Music and DJ handoff",
    href: "/music",
    steps: [
      "Open Music.",
      "Build must-play and do-not-play.",
      "Connect Spotify or Apple if you want search.",
      "Print or send the DJ packet from Handoffs. The list has to leave the building.",
    ],
  },
  {
    id: "guest-site",
    title: "Guest website",
    href: "/site",
    steps: [
      "Open Site.",
      "Write the letter — schedule, travel, dress, RSVP.",
      "Publish /w so guests have one link.",
      "Put that link on the invitation. Do not make a second site.",
    ],
  },
  {
    id: "budget",
    title: "Budget",
    href: "/budget",
    steps: [
      "Set the cap first.",
      "Money lives in envelopes — venue, food, clothes, Studio.",
      "Vendors and DIY roll up into the same number.",
      "A receipt photo can sit on a line later. Do not wait for OCR.",
    ],
  },
  {
    id: "auth",
    title: "Sign in",
    href: "/login",
    steps: [
      "Use the magic link if that is how this desk is set up.",
      "Google and Apple buttons are on the page. They need keys before they work.",
      "Until then, the demo desk is Alex / Jordan.",
    ],
  },
  {
    id: "copilot",
    title: "Copilot",
    href: "/dashboard",
    steps: [
      "The button lives on the desk.",
      "Ask a question or give it a task.",
      "It should write into This week — it does not replace This week.",
      "This is a paid token add-on once we name the character.",
    ],
  },
];

const FALLBACK: Record<string, string[]> = {};

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
    steps: FALLBACK[id] || [
      `Open ${title}.`,
      doThis,
      "Leave a note on /v2 if this room is wrong or missing a step.",
    ],
  };
}

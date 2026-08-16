export type IntegrationStatus = "live" | "next" | "link-only";

export type Integration = {
  id: string;
  name: string;
  status: IntegrationStatus;
  href: string;
  what: string;
  needs: string;
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "spotify",
    name: "Spotify",
    status: "live",
    href: "/music",
    what: "Search tracks, add them to must-play, export a playlist for the DJ.",
    needs: "A free Spotify app (Client ID + Secret) in Vercel.",
  },
  {
    id: "weather",
    name: "Weather (NWS)",
    status: "live",
    href: "/day-of",
    what: "Pull the forecast for your city onto the day-of board.",
    needs: "Wedding city in Settings. No API key.",
  },
  {
    id: "apple-music",
    name: "Apple Music",
    status: "live",
    href: "/music",
    what: "Search the catalog, add must-play, export a playlist the DJ can open in Apple Music.",
    needs: "Apple Developer MusicKit key in Vercel.",
  },
  {
    id: "places",
    name: "Google Places",
    status: "live",
    href: "/vendors/browse",
    what: "Search real vendors near the wedding city. Add them to your team.",
    needs: "GOOGLE_PLACES_API_KEY (Places API New) in Vercel.",
  },
  {
    id: "calendar",
    name: "Calendar subscribe",
    status: "live",
    href: "/timeline",
    what: "Subscribe once. The day, extra events, run of show, hotel cutoffs, and payment dues land on your phone.",
    needs: "Nothing. Use Add to calendar on Timeline.",
  },
  {
    id: "uploads",
    name: "File uploads",
    status: "live",
    href: "/moodboard",
    what: "Photos on the moodboard. PDFs on contracts. Receipts on the ledger. Paste still works.",
    needs: "Optional BLOB_READ_WRITE_TOKEN on Vercel so files survive deploys.",
  },
  {
    id: "season",
    name: "Floral season",
    status: "live",
    href: "/diy/studio/floral",
    what: "Stems marked in / off season from your city and wedding month.",
    needs: "City and date in Settings.",
  },
  {
    id: "ledger",
    name: "Vendor ledger",
    status: "live",
    href: "/payments",
    what: "Deposit, progress, final. Receipts. Paid hits the budget. Dues land on the calendar.",
    needs: "Nothing. Stripe later if you want to charge cards.",
  },
  {
    id: "send",
    name: "Vendor send",
    status: "live",
    href: "/send",
    what: "One packet per vendor. Room, cues, kitchen, money, clauses. Same link if you send again.",
    needs: "Optional Resend key so the email actually goes. The link works either way.",
  },
  {
    id: "gcal",
    name: "Google Calendar",
    status: "next",
    href: "/integrations",
    what: "Push the same feed with OAuth instead of subscribe.",
    needs: "Google Cloud OAuth client.",
  },
  {
    id: "places",
    name: "Google Places",
    status: "next",
    href: "/travel",
    what: "Find hotels and the venue without leaving Travel.",
    needs: "Maps API key.",
  },
  {
    id: "drive",
    name: "Drive / Dropbox",
    status: "next",
    href: "/vendors",
    what: "Attach the contract PDF instead of pasting a link.",
    needs: "Picker client IDs.",
  },
  {
    id: "stripe",
    name: "Stripe",
    status: "next",
    href: "/payments",
    what: "The ledger already tracks deposits. Stripe would send the invoice and mark it paid.",
    needs: "Stripe account.",
  },
  {
    id: "registry",
    name: "Zola / Amazon / Honeyfund",
    status: "link-only",
    href: "/registry",
    what: "No couple API — keep your links here and log gifts as they arrive.",
    needs: "Nothing. Paste the URL.",
  },
];

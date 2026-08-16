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
    id: "calendar",
    name: "Google Calendar",
    status: "next",
    href: "/integrations",
    what: "Push the run of show and extra events to your calendar.",
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
    what: "Send a deposit invoice and mark it paid when it clears.",
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

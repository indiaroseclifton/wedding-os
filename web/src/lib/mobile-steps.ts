export type MobileStep = {
  id: string;
  title: string;
  body: string;
  done: boolean;
};

export const MOBILE_STEPS: { phase: string; items: MobileStep[] }[] = [
  {
    phase: "Now — this is already the app",
    items: [
      {
        id: "pwa",
        title: "Install the desk on a phone",
        body: "Add to Home Screen. Same product, no store wait. Guest site and the party portal already fit a pocket.",
        done: true,
      },
      {
        id: "touch",
        title: "Touch-first rooms",
        body: "Bottom nav, 44px targets, seating and RSVP work with a thumb. Keep every new screen this way.",
        done: true,
      },
      {
        id: "contacts",
        title: "Phone contacts",
        body: "Import from the Contacts picker, or a vCard. Native Contacts API is the same idea later.",
        done: true,
      },
    ],
  },
  {
    phase: "Wrapper — one codebase, store icon",
    items: [
      {
        id: "capacitor",
        title: "Wrap with Capacitor (or Expo WebView)",
        body: "Point the shell at this site. Splash, status bar moss, safe-area already in the viewport. No rewrite.",
        done: false,
      },
      {
        id: "camera",
        title: "Camera into the moodboard",
        body: "Capacitor Camera → upload → pin. Couples shoot a tablescape and it lands on the board.",
        done: false,
      },
      {
        id: "push",
        title: "Push for dues and RSVPs",
        body: "APNs + FCM. “Deposit due Friday.” “12 people still haven’t replied.” Needs a worker, not just the page.",
        done: false,
      },
    ],
  },
  {
    phase: "Stores",
    items: [
      {
        id: "accounts",
        title: "Apple Developer + Google Play",
        body: "Organization account, not a personal hobby listing. Privacy nutrition labels for guest emails and addresses.",
        done: false,
      },
      {
        id: "testflight",
        title: "TestFlight, then App Store",
        body: "Party members first. Then a public listing that opens /dashboard after sign-in.",
        done: false,
      },
      {
        id: "links",
        title: "Universal links",
        body: "Your domain opens the guest site in the app if they have it, Safari if they don’t.",
        done: false,
      },
    ],
  },
  {
    phase: "Native only when the web can’t",
    items: [
      {
        id: "music",
        title: "Apple MusicKit native",
        body: "Web already previews. Native is for people who refuse to leave Music.",
        done: false,
      },
      {
        id: "offline",
        title: "Offline day-of packet",
        body: "Cache run of show, seating, vendor phones. Cellars and barns lose signal.",
        done: false,
      },
      {
        id: "widgets",
        title: "Lock-screen countdown",
        body: "Days to go. Nice, not required. Do this after the stores, not before.",
        done: false,
      },
    ],
  },
];

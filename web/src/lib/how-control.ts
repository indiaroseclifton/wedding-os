import type { HowGuide } from "@/lib/how-to";

export const CONTROL_HOW: HowGuide[] = [
  {
    id: "control",
    title: "Use the control panel",
    href: "/control",
    steps: [
      "Open Control from the photo on the mast. That page is you — not this wedding.",
      "Fill your name, email, and phone so packets and invites have a from-line.",
      "Paste folder and board URLs under Connections. Do not hunt for an API key.",
      "Add the people who sit at this house. Settings still holds the wedding date and look.",
    ],
    actions: [
      { label: "Open Control", href: "/control" },
      { label: "Open wedding settings", href: "/settings" },
    ],
  },
  {
    id: "password",
    title: "Set a desk password",
    href: "/control",
    steps: [
      "Open Control → Password.",
      "If this is the first time, leave current blank and type a new password twice. Eight characters at least.",
      "Save. The desk stores a hash, not the words.",
      "Google and Apple sign-in still live on Login. This password is the desk copy until those pipes are live.",
    ],
    actions: [{ label: "Open Control", href: "/control" }],
  },
  {
    id: "drive",
    title: "Link a Google Drive folder",
    href: "/control",
    steps: [
      "On a computer, open drive.google.com and sign in.",
      "Open the folder for this wedding — contracts, floor scans, inspiration.",
      "Click the folder name → Share. Set Anyone with the link can view, or keep it to people you invite.",
      "Click Copy link. It must contain /folders/ and a long id.",
      "Come back to Control → Connections → Google Drive. Paste. Save.",
      "Vision and Intake can use the same folder. You do not connect an API.",
    ],
    actions: [
      { label: "Open Google Drive", href: "https://drive.google.com/", external: true },
      { label: "Paste on Control", href: "/control" },
    ],
  },
  {
    id: "onedrive",
    title: "Link a OneDrive folder",
    href: "/control",
    steps: [
      "Open OneDrive or SharePoint in a browser and sign in.",
      "Open the folder. Click Share → Copy link.",
      "If the link is short (1drv.ms), that is fine.",
      "Paste it on Control → Connections → OneDrive. Save.",
      "Open the link once yourself to confirm it does not ask a stranger for a login you did not mean.",
    ],
    actions: [
      { label: "Open OneDrive", href: "https://onedrive.live.com/", external: true },
      { label: "Paste on Control", href: "/control" },
    ],
  },
  {
    id: "icloud",
    title: "Link an iCloud folder or album",
    href: "/control",
    steps: [
      "On a phone or Mac, open the album or folder.",
      "Tap Share and create an iCloud link.",
      "Copy the icloud.com link.",
      "Paste it on Control → Connections → iCloud. Save.",
      "iCloud will open in a new tab. This desk does not pull the files in.",
    ],
    actions: [
      { label: "Open iCloud", href: "https://www.icloud.com/", external: true },
      { label: "Paste on Control", href: "/control" },
    ],
  },
  {
    id: "house-people",
    title: "Add someone to the house",
    href: "/control",
    steps: [
      "Decide the seat: you, partner, family, or planner. Family can see guests. Planner can see vendors. Budget stays yours until we say otherwise.",
      "Open Control → People at the house.",
      "Type their name and email. Save. They show as invited.",
      "Until email invites ship, sit together on one login or send them the preview link yourself.",
    ],
    actions: [{ label: "Open Control", href: "/control" }],
  },
];

import type { HowGuide } from "@/lib/how-to";

export const INTAKE_HOW: HowGuide = {
  id: "intake",
  title: "Add an event",
  href: "/intake?new=1",
  steps: [
    "Press Add event in the header, or open Events.",
    "Blanche starts with what kind of gathering this is. Wedding, mitzvah, gala, or other.",
    "Sit down with twenty quiet minutes. Answer what you know. Skip what you do not.",
    "On Images: pick a few photos from this computer, or paste links.",
    "On Pinterest: board → Edit → turn off Secret → copy pinterest.com/you/board-name/ → paste.",
    "On Folders: in Drive, right-click the folder → Share → Anyone with the link → Viewer → Copy link → paste. Same idea for OneDrive and iCloud. Do not put contracts in a public folder.",
    "Write what is loud. Open this event. It joins the list. Switch with the name next to the wordmark.",
  ],
  actions: [
    { label: "Add event", href: "/intake?new=1" },
    { label: "All events", href: "/events" },
    { label: "Open Google Drive", href: "https://drive.google.com/", external: true },
    { label: "Open Pinterest", href: "https://www.pinterest.com/", external: true },
  ],
};

import type { HowGuide } from "@/lib/how-to";

export const INTAKE_HOW: HowGuide = {
  id: "intake",
  title: "Start the desk together",
  href: "/intake",
  steps: [
    "Sit down together with twenty quiet minutes.",
    "Open Intake. Answer what you know. Skip what you do not.",
    "On Images: pick a few photos from this computer, or paste links.",
    "On Pinterest: board → Edit → turn off Secret → copy pinterest.com/you/board-name/ → paste.",
    "On Folders: in Drive, right-click the folder → Share → Anyone with the link → Viewer → Copy link → paste. Same idea for OneDrive and iCloud. Do not put contracts in a public folder.",
    "A Drive folder that is public will show as a grid on that step. iCloud only opens in a new tab.",
    "Write what is loud. Then open the desk.",
  ],
  actions: [
    { label: "Open Intake", href: "/intake" },
    { label: "Open Google Drive", href: "https://drive.google.com/", external: true },
    { label: "Open Pinterest", href: "https://www.pinterest.com/", external: true },
  ],
};

export const SEATS = ["you", "partner", "family", "planner"] as const;
export type Seat = (typeof SEATS)[number];

export const SEAT_LABEL: Record<Seat, string> = {
  you: "You",
  partner: "Partner",
  family: "Family",
  planner: "Planner",
};

export const CONNECTION_KINDS = ["drive", "onedrive", "icloud", "pinterest"] as const;
export type ConnectionKind = (typeof CONNECTION_KINDS)[number];

export const CONNECTION_CARDS: {
  id: ConnectionKind;
  title: string;
  line: string;
  placeholder: string;
  how: string;
  open?: string;
}[] = [
  {
    id: "drive",
    title: "Google Drive",
    line: "A folder URL. Not an API.",
    placeholder: "https://drive.google.com/drive/folders/…",
    how: "drive",
    open: "https://drive.google.com/",
  },
  {
    id: "onedrive",
    title: "OneDrive",
    line: "Share link from Microsoft.",
    placeholder: "https://1drv.ms/… or sharepoint.com/…",
    how: "onedrive",
    open: "https://onedrive.live.com/",
  },
  {
    id: "icloud",
    title: "iCloud",
    line: "A shared album or folder link.",
    placeholder: "https://www.icloud.com/…",
    how: "icloud",
    open: "https://www.icloud.com/",
  },
  {
    id: "pinterest",
    title: "Pinterest",
    line: "The board for this wedding. Public.",
    placeholder: "https://www.pinterest.com/you/board/",
    how: "pinterest",
    open: "https://www.pinterest.com/",
  },
];

export type ControlYou = {
  name: string;
  email: string;
  phone: string;
  timezone: string;
  photoUrl: string;
};

export type ControlPerson = {
  id: string;
  name: string;
  email: string;
  seat: Seat;
  status: "active" | "invited";
  createdAt: string;
};

export type ControlConnections = Partial<Record<ConnectionKind, string>>;

export type ControlState = {
  you: ControlYou;
  passwordHash?: string;
  plan: "good" | "better" | "best";
  connections: ControlConnections;
  people: ControlPerson[];
  updatedAt: string;
};

export function emptyYou(): ControlYou {
  return { name: "", email: "", phone: "", timezone: "", photoUrl: "" };
}

export function emptyControl(): ControlState {
  return {
    you: emptyYou(),
    plan: "good",
    connections: {},
    people: [],
    updatedAt: new Date().toISOString(),
  };
}

export function isSeat(v: unknown): v is Seat {
  return SEATS.includes(v as Seat);
}

export function isConnectionKind(v: unknown): v is ConnectionKind {
  return CONNECTION_KINDS.includes(v as ConnectionKind);
}

export function looksLikeUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

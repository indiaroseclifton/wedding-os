export const EVENT_KINDS = [
  "wedding",
  "mitzvah",
  "gala",
  "anniversary",
  "birthday",
  "shower",
  "other",
] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

export const EVENT_KIND_CARDS: { id: EventKind; title: string; line: string }[] = [
  { id: "wedding", title: "A wedding", line: "Two people. A date. A room." },
  { id: "mitzvah", title: "A bar or bat mitzvah", line: "The child, the family, the hall." },
  { id: "gala", title: "A gala", line: "A cause, a room, a night." },
  { id: "anniversary", title: "An anniversary", line: "Years already kept. One more night." },
  { id: "birthday", title: "A birthday", line: "A person. A number. A gathering." },
  { id: "shower", title: "A shower or party", line: "Before the wedding, or just a party." },
  { id: "other", title: "Something else", line: "Say what it is as we go." },
];

export type HouseEvent = {
  id: string;
  kind: EventKind;
  title: string;
  honoreeA?: string;
  honoreeB?: string;
  date?: string;
  location?: string;
  shape?: string;
  enterHow?: string;
  guests?: string;
  cap?: string;
  thoughts?: string;
  active: boolean;
  createdAt: string;
};

export function isEventKind(v: unknown): v is EventKind {
  return EVENT_KINDS.includes(v as EventKind);
}

export function kindOf(v?: string | null): EventKind {
  return isEventKind(v) ? v : "wedding";
}

export function kindTitle(kind?: string | null) {
  const card = EVENT_KIND_CARDS.find((c) => c.id === kindOf(kind));
  return card?.title || "An event";
}

export function eventTitle(input: {
  kind?: string | null;
  honoreeA?: string;
  honoreeB?: string;
  fallback?: string;
}) {
  const names = [input.honoreeA, input.honoreeB].filter(Boolean).join(" & ");
  if (!names) return input.fallback || kindTitle(input.kind);
  const kind = kindOf(input.kind);
  if (kind === "wedding") return `${names}'s wedding`;
  if (kind === "mitzvah") return `${names}'s mitzvah`;
  if (kind === "gala") return `${names} gala`;
  if (kind === "anniversary") return `${names} anniversary`;
  if (kind === "birthday") return `${names}'s birthday`;
  if (kind === "shower") return `${names}'s shower`;
  return names;
}

export function nameLabels(kind?: string | null): { a: string; b: string } {
  switch (kindOf(kind)) {
    case "mitzvah":
      return { a: "The child", b: "A parent" };
    case "gala":
      return { a: "Honoree or host", b: "Organization" };
    case "anniversary":
      return { a: "One of you", b: "The other" };
    case "birthday":
      return { a: "The person", b: "Who is hosting" };
    case "shower":
      return { a: "For whom", b: "Who is hosting" };
    case "other":
      return { a: "Who this is for", b: "Who is hosting" };
    default:
      return { a: "One of you", b: "The other" };
  }
}

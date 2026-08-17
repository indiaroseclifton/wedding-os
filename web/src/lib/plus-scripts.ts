export const PLUS_SCRIPTS = [
  {
    id: "no-plus",
    title: "No plus-one",
    body: "You're invited — just you. The room is full, so we can't add a guest. We hope you'll still come.",
  },
  {
    id: "named-only",
    title: "Named guest only",
    body: "You're invited with [name]. We can't swap or add anyone else — the count is locked with catering.",
  },
  {
    id: "need-address",
    title: "Need an address",
    body: "We're sending paper and don't have a place to send it. Reply with a mailing address when you can.",
  },
  {
    id: "please-rsvp",
    title: "We need a real answer",
    body: "We still don't have a yes or no from you. Catering needs a number by Friday — can you reply?",
  },
  {
    id: "confirm-yes",
    title: "You said yes — still coming?",
    body: "You RSVP'd yes. If anything changed, please tell us now so we don't hold a seat and a plate.",
  },
] as const;

import { categoryKey } from "./attachments";

export type VendorNeed = {
  id: string;
  label: string;
  done: boolean;
  fileUrl?: string;
  fileName?: string;
};

export type VendorQuestion = {
  id: string;
  from: string;
  body: string;
  at: string;
  answer?: string;
  answeredAt?: string;
};

export function defaultNeeds(category: string): VendorNeed[] {
  const key = categoryKey(category);
  const labels =
    key === "venue"
      ? ["Approve the floor", "Confirm curfew / hard stop", "Send COI"]
      : key === "catering" || key === "cake"
        ? ["Ack headcount", "Menu proof", "Staff count"]
        : key === "dj"
          ? ["Confirm cues", "Dinner-swap song"]
          : key === "florist"
            ? ["Delivery window", "Vessel list"]
            : key === "photo" || key === "video"
              ? ["Ack shot list", "Need a meal?"]
              : ["Confirm you have this"];
  return labels.map((label, i) => ({ id: `need-${key}-${i}`, label, done: false }));
}

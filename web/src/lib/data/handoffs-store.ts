import path from "path";
import { randomUUID } from "crypto";
import { dataDir, readJson, writeJson } from "./store-io";

const packagesFile = path.join(dataDir, "packages.json");

export type HandoffTemplate =
  | "DAY_OF"
  | "DJ"
  | "PHOTOGRAPHER"
  | "CATERING"
  | "FLORIST"
  | "PLANNER"
  | "HMU"
  | "CAKE"
  | "TRANSPORT"
  | "VENUE";

export type StoredPackage = {
  id: string;
  workspaceId: string;
  template: HandoffTemplate;
  title: string;
  status: "DRAFT" | "SHARED";
  recipientName?: string;
  recipientEmail?: string;
  shareToken?: string;
  sections: Record<string, string>;
  shareVersion: number;
  sharedAt?: string;
  receivedAt?: string;
  receivedName?: string;
  lastRefreshedAt?: string;
  lastRefreshedFrom?: "music" | "guests";
  createdAt: string;
  updatedAt: string;
};

export const TEMPLATE_SECTIONS: Record<HandoffTemplate, string[]> = {
  DAY_OF: [
    "date_locations",
    "timeline_notes",
    "key_contacts",
    "special_notes",
    "vendor_list",
  ],
  DJ: ["must_play", "do_not_play", "spotify_playlist", "music_moments", "tone_notes", "day_of_contact"],
  PHOTOGRAPHER: [
    "must_have_moments",
    "group_notes",
    "timeline_notes",
    "style_notes",
    "constraints",
  ],
  CATERING: [
    "headcount",
    "dietary_summary",
    "dietary_detail",
    "service_notes",
    "day_of_contact",
  ],
  FLORIST: [
    "date_locations",
    "arrangement_list",
    "palette_notes",
    "diy_mix",
    "constraints",
    "day_of_contact",
  ],
  PLANNER: [
    "date_locations",
    "vendor_list",
    "timeline_notes",
    "key_contacts",
    "special_notes",
  ],
  HMU: [
    "date_locations",
    "party_count",
    "call_times",
    "style_notes",
    "day_of_contact",
  ],
  CAKE: [
    "date_locations",
    "headcount",
    "flavor_notes",
    "display_notes",
    "day_of_contact",
  ],
  TRANSPORT: [
    "date_locations",
    "pickup_plan",
    "hotel_addresses",
    "timeline_notes",
    "day_of_contact",
  ],
  VENUE: [
    "date_locations",
    "timeline_notes",
    "vendor_list",
    "constraints",
    "key_contacts",
  ],
};

export const SECTION_LABELS: Record<string, string> = {
  date_locations: "Date & locations",
  timeline_notes: "Timeline notes",
  key_contacts: "Key contacts",
  special_notes: "Special notes",
  vendor_list: "Vendor list",
  must_play: "Must-play",
  do_not_play: "Do-not-play",
  spotify_playlist: "Spotify playlist",
  music_moments: "Music moments",
  tone_notes: "Tone / energy",
  day_of_contact: "Day-of contact",
  must_have_moments: "Must-have moments",
  group_notes: "Family / group notes",
  style_notes: "Style notes",
  constraints: "Constraints",
  headcount: "Headcount",
  dietary_summary: "Dietary summary",
  dietary_detail: "Guest dietary detail",
  meal_counts: "Meal choices",
  service_notes: "Service notes",
  arrangement_list: "What you're making",
  palette_notes: "Palette",
  diy_mix: "DIY pieces on site",
  party_count: "Party count",
  call_times: "Call times",
  flavor_notes: "Flavors",
  display_notes: "Display / cutting",
  pickup_plan: "Pickup plan",
  hotel_addresses: "Hotels / addresses",
};

export async function listPackages(workspaceId: string) {
  return (await readJson<StoredPackage>(packagesFile))
    .filter((r) => r.workspaceId === workspaceId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getPackage(id: string) {
  return (await readJson<StoredPackage>(packagesFile)).find((r) => r.id === id) ?? null;
}

export async function getPackageByToken(token: string) {
  return (
    (await readJson<StoredPackage>(packagesFile)).find(
      (r) => r.shareToken === token && r.status === "SHARED",
    ) ?? null
  );
}

export async function createPackage(input: {
  workspaceId: string;
  template: HandoffTemplate;
  title: string;
  recipientName?: string;
  recipientEmail?: string;
  sections?: Record<string, string>;
}) {
  const rows = await readJson<StoredPackage>(packagesFile);
  const now = new Date().toISOString();
  const sections: Record<string, string> = {};
  for (const key of TEMPLATE_SECTIONS[input.template]) sections[key] = "";
  if (input.sections) Object.assign(sections, input.sections);
  const row: StoredPackage = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    template: input.template,
    title: input.title,
    status: "DRAFT",
    recipientName: input.recipientName,
    recipientEmail: input.recipientEmail,
    sections,
    shareVersion: 0,
    createdAt: now,
    updatedAt: now,
  };
  rows.push(row);
  await writeJson(packagesFile, rows);
  return row;
}

export async function updatePackage(
  id: string,
  patch: Partial<
    Pick<
      StoredPackage,
      | "title"
      | "status"
      | "recipientName"
      | "recipientEmail"
      | "sections"
      | "shareToken"
      | "sharedAt"
      | "shareVersion"
      | "lastRefreshedAt"
      | "lastRefreshedFrom"
    >
  >,
) {
  const rows = await readJson<StoredPackage>(packagesFile);
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  row.updatedAt = new Date().toISOString();
  await writeJson(packagesFile, rows);
  return row;
}

export async function sharePackage(id: string) {
  const row = await getPackage(id);
  if (!row) return null;
  const token = row.shareToken || randomUUID().replace(/-/g, "");
  return updatePackage(id, {
    status: "SHARED",
    shareToken: token,
    sharedAt: new Date().toISOString(),
    shareVersion: (row.shareVersion || 0) + 1,
  });
}

export async function markReceived(token: string, name?: string) {
  const rows = await readJson<StoredPackage>(packagesFile);
  const row = rows.find((p) => p.shareToken === token);
  if (!row) return null;
  row.receivedAt = new Date().toISOString();
  row.receivedName = name?.slice(0, 80) || row.recipientName || "Vendor";
  row.updatedAt = new Date().toISOString();
  await writeJson(packagesFile, rows);
  return row;
}

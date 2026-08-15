import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dataDir } from "./store-io";

const packagesFile = path.join(dataDir, "packages.json");

export type HandoffTemplate = "DAY_OF" | "DJ" | "PHOTOGRAPHER" | "CATERING";

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
  DJ: ["must_play", "do_not_play", "music_moments", "tone_notes", "day_of_contact"],
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
};

export const SECTION_LABELS: Record<string, string> = {
  date_locations: "Date & locations",
  timeline_notes: "Timeline notes",
  key_contacts: "Key contacts",
  special_notes: "Special notes",
  vendor_list: "Vendor list",
  must_play: "Must-play",
  do_not_play: "Do-not-play",
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
  service_notes: "Service notes",
};

async function ensureFile(file: string, fallback = "[]") {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, fallback, "utf8");
  }
}

async function readJson<T>(file: string): Promise<T[]> {
  await ensureFile(file);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw || "[]") as T[];
}

async function writeJson<T>(file: string, rows: T[]) {
  await ensureFile(file);
  await fs.writeFile(file, JSON.stringify(rows, null, 2), "utf8");
}

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

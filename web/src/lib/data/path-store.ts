import path from "path";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const file = path.join(dataDir, "path.json");

export const PATH_CATEGORIES = [
  { id: "flowers", label: "Flowers", hireHref: "/vendors/browse?category=Florist", diyHref: "/diy/flowers" },
  { id: "tables", label: "Table decor", hireHref: "/vendors/browse?category=Rentals", diyHref: "/diy/table-decor" },
  { id: "signs", label: "Signage", hireHref: "/vendors/browse?category=Stationery", diyHref: "/diy/signage" },
  { id: "lighting", label: "Lighting", hireHref: "/vendors/browse?category=Rentals", diyHref: "/diy/lighting" },
  { id: "cake", label: "Cake / dessert", hireHref: "/vendors/browse?category=Cake", diyHref: "/diy/cake" },
  { id: "backdrop", label: "Ceremony backdrop", hireHref: "/vendors/browse?category=Florist", diyHref: "/diy/backdrop" },
  { id: "favors", label: "Favors", hireHref: "/vendors/browse", diyHref: "/diy/favors" },
  { id: "photo", label: "Photography", hireHref: "/vendors/browse?category=Photographer", diyHref: "" },
] as const;

export type PathChoice = "undecided" | "hire" | "diy" | "mix";

export type StoredPath = {
  workspaceId: string;
  choices: Record<string, PathChoice>;
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredPath>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(file));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredPath>) {
  await writeText(file, JSON.stringify(all, null, 2));
}

export async function getPath(workspaceId: string): Promise<StoredPath> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = { workspaceId, choices: {}, updatedAt: new Date().toISOString() };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function setPathChoice(workspaceId: string, category: string, choice: PathChoice) {
  const current = await getPath(workspaceId);
  const all = await readAll();
  all[workspaceId] = {
    ...current,
    choices: { ...current.choices, [category]: choice },
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[workspaceId];
}

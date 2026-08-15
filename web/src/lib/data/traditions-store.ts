import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dataDir } from "./store-io";

const traditionsFile = path.join(dataDir, "traditions.json");

export type TraditionItem = {
  id: string;
  title: string;
  timing?: string;
  notes?: string;
  done: boolean;
};

export type TraditionPack = {
  id: string;
  name: string;
  description: string;
  items: Omit<TraditionItem, "id" | "done">[];
};

export const PACKS: TraditionPack[] = [
  {
    id: "jewish",
    name: "Jewish",
    description: "Common ceremony and reception elements",
    items: [
      { title: "Ketubah signing", timing: "Before ceremony" },
      { title: "Bedeken (veiling)", timing: "Before ceremony" },
      { title: "Chuppah setup", timing: "Ceremony" },
      { title: "Seven blessings / Sheva Brachot", timing: "Ceremony / dinner" },
      { title: "Breaking the glass", timing: "End of ceremony" },
      { title: "Hora / chair dance", timing: "Reception" },
      { title: "Yichud room", timing: "After ceremony" },
    ],
  },
  {
    id: "hindu",
    name: "Hindu",
    description: "Common ceremony anchors (customize by region)",
    items: [
      { title: "Mehndi / henna", timing: "Pre-wedding" },
      { title: "Haldi", timing: "Pre-wedding" },
      { title: "Baraat arrival", timing: "Ceremony day" },
      { title: "Jaimala / garland exchange", timing: "Ceremony" },
      { title: "Saptapadi / seven steps", timing: "Ceremony" },
      { title: "Sangeet", timing: "Pre-wedding" },
      { title: "Priest / pandit brief", timing: "Planning" },
    ],
  },
  {
    id: "chinese",
    name: "Chinese",
    description: "Tea ceremony and common customs",
    items: [
      { title: "Tea ceremony schedule", timing: "Ceremony day" },
      { title: "Red envelopes / lai see logistics", timing: "Reception" },
      { title: "Door games (if any)", timing: "Morning" },
      { title: "Banquet course timing with venue", timing: "Reception" },
      { title: "Color palette notes (red/gold etc.)", timing: "Planning" },
    ],
  },
  {
    id: "hispanic",
    name: "Hispanic / Latin",
    description: "Common ceremony and reception traditions",
    items: [
      { title: "Lazo / lasso ceremony", timing: "Ceremony" },
      { title: "Arras / coins", timing: "Ceremony" },
      { title: "Padrinos / sponsors list", timing: "Planning" },
      { title: "Money dance", timing: "Reception" },
      { title: "Late-night snack or after-party", timing: "Reception" },
    ],
  },
  {
    id: "greek_orthodox",
    name: "Greek Orthodox",
    description: "Ceremony structure notes",
    items: [
      { title: "Confirm priest and church requirements", timing: "Planning" },
      { title: "Stefana (crowns)", timing: "Ceremony" },
      { title: "Koumbaros / koumbara role", timing: "Planning" },
      { title: "Procession and duration briefing for guests", timing: "Planning" },
      { title: "Reception timing after liturgy", timing: "Day-of" },
    ],
  },
  {
    id: "christian_general",
    name: "Christian (general)",
    description: "Flexible ceremony checklist",
    items: [
      { title: "Processional order", timing: "Ceremony" },
      { title: "Readings and readers", timing: "Ceremony" },
      { title: "Unity ritual (candle/sand/other)", timing: "Ceremony" },
      { title: "Communion or special rites (if any)", timing: "Ceremony" },
      { title: "Recessional and photo timing", timing: "After ceremony" },
    ],
  },
];

export type StoredTraditions = {
  workspaceId: string;
  activePackIds: string[];
  items: TraditionItem[];
  customNotes?: string;
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredTraditions>> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(traditionsFile, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredTraditions>) {
  await fs.writeFile(traditionsFile, JSON.stringify(all, null, 2), "utf8");
}

export async function getTraditions(workspaceId: string): Promise<StoredTraditions> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      activePackIds: [],
      items: [],
      customNotes: "",
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function applyPack(workspaceId: string, packId: string) {
  const pack = PACKS.find((p) => p.id === packId);
  if (!pack) return getTraditions(workspaceId);
  const current = await getTraditions(workspaceId);
  if (current.activePackIds.includes(packId)) return current;
  const newItems: TraditionItem[] = pack.items.map((i) => ({
    id: randomUUID(),
    title: i.title,
    timing: i.timing,
    notes: i.notes,
    done: false,
  }));
  const all = await readAll();
  all[workspaceId] = {
    ...current,
    activePackIds: [...current.activePackIds, packId],
    items: [...current.items, ...newItems],
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[workspaceId];
}

export async function toggleTraditionItem(
  workspaceId: string,
  itemId: string,
  done: boolean
) {
  const current = await getTraditions(workspaceId);
  const items = current.items.map((i) => (i.id === itemId ? { ...i, done } : i));
  const all = await readAll();
  all[workspaceId] = { ...current, items, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function saveTraditionNotes(workspaceId: string, customNotes: string) {
  const current = await getTraditions(workspaceId);
  const all = await readAll();
  all[workspaceId] = { ...current, customNotes, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

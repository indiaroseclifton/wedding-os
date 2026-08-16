import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const checklistFile = path.join(dataDir, "checklist.json");

export type ChecklistItem = {
  id: string;
  phase: string;
  title: string;
  done: boolean;
  custom?: boolean;
};

export type StoredChecklist = {
  workspaceId: string;
  items: ChecklistItem[];
  updatedAt: string;
};

export const PHASES = [
  { id: "12-18", label: "12–18 months" },
  { id: "9-11", label: "9–11 months" },
  { id: "6-8", label: "6–8 months" },
  { id: "4-5", label: "4–5 months" },
  { id: "2-3", label: "2–3 months" },
  { id: "1", label: "1 month" },
  { id: "week", label: "Week of" },
  { id: "after", label: "After" },
] as const;

/** Original items synthesized from common 12-month planner structure. */
const STARTER: Omit<ChecklistItem, "id">[] = [
  { phase: "12-18", title: "Set a total budget and who contributes", done: false },
  { phase: "12-18", title: "Write down the top three priorities", done: false },
  { phase: "12-18", title: "Pick a date (or a few options)", done: false },
  { phase: "12-18", title: "Book ceremony and reception venues", done: false },
  { phase: "12-18", title: "Book photographer", done: false },
  { phase: "12-18", title: "Choose wedding party", done: false },
  { phase: "12-18", title: "Start a guest-list draft", done: false },
  { phase: "12-18", title: "Set up one shared planning folder", done: false },
  { phase: "9-11", title: "Book caterer", done: false },
  { phase: "9-11", title: "Book DJ or band", done: false },
  { phase: "9-11", title: "Book florist", done: false },
  { phase: "9-11", title: "Book officiant", done: false },
  { phase: "9-11", title: "Reserve hotel blocks for guests", done: false },
  { phase: "9-11", title: "Send save-the-dates", done: false },
  { phase: "9-11", title: "Start dress shopping", done: false },
  { phase: "9-11", title: "Create a wedding website", done: false },
  { phase: "6-8", title: "Order dress and book fittings", done: false },
  { phase: "6-8", title: "Choose wedding-party attire", done: false },
  { phase: "6-8", title: "Book hair and makeup + a trial", done: false },
  { phase: "6-8", title: "Book rentals (chairs, linens, lighting, tent)", done: false },
  { phase: "6-8", title: "Design invitations", done: false },
  { phase: "6-8", title: "Book cake or dessert", done: false },
  { phase: "6-8", title: "Book transportation", done: false },
  { phase: "6-8", title: "Open a registry", done: false },
  { phase: "6-8", title: "Start honeymoon planning / check passports", done: false },
  { phase: "4-5", title: "Send invitations (RSVP about a month before)", done: false },
  { phase: "4-5", title: "Track RSVPs as they come in", done: false },
  { phase: "4-5", title: "Finalize ceremony readings and music", done: false },
  { phase: "4-5", title: "Book rehearsal dinner", done: false },
  { phase: "4-5", title: "Confirm hotel-block cutoff dates", done: false },
  { phase: "2-3", title: "Draft the seating chart", done: false },
  { phase: "2-3", title: "Write vows", done: false },
  { phase: "2-3", title: "Confirm vendor contracts and remaining payments", done: false },
  { phase: "2-3", title: "Apply for the marriage license", done: false },
  { phase: "2-3", title: "Schedule final fittings", done: false },
  { phase: "2-3", title: "Order thank-you cards", done: false },
  { phase: "1", title: "Give final guest count to vendors", done: false },
  { phase: "1", title: "Finalize seating and meals", done: false },
  { phase: "1", title: "Confirm day-of timeline with every vendor", done: false },
  { phase: "1", title: "Pick up attire", done: false },
  { phase: "1", title: "Pack a day-of emergency kit", done: false },
  { phase: "week", title: "Reconfirm every vendor", done: false },
  { phase: "week", title: "Pack for the day and delegate leftovers", done: false },
  { phase: "after", title: "Send thank-you notes (aim for 3 months)", done: false },
  { phase: "after", title: "Review and choose photos", done: false },
  { phase: "after", title: "Preserve dress / suit", done: false },
  { phase: "after", title: "Name-change paperwork if needed", done: false },
  { phase: "after", title: "Leave vendor reviews", done: false },
];

async function readAll(): Promise<Record<string, StoredChecklist>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(checklistFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredChecklist>) {
  await writeText(checklistFile, JSON.stringify(all, null, 2));
}

export async function getChecklist(workspaceId: string): Promise<StoredChecklist> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      items: STARTER.map((s) => ({ ...s, id: randomUUID() })),
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveChecklist(workspaceId: string, patch: Partial<StoredChecklist>) {
  const all = await readAll();
  const current = await getChecklist(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function patchChecklistItem(
  workspaceId: string,
  id: string,
  patch: Partial<ChecklistItem>
) {
  const current = await getChecklist(workspaceId);
  return saveChecklist(workspaceId, {
    items: current.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  });
}

export async function addChecklistItem(
  workspaceId: string,
  input: { title: string; phase?: string }
) {
  const current = await getChecklist(workspaceId);
  const item: ChecklistItem = {
    id: randomUUID(),
    phase: input.phase || "1",
    title: input.title,
    done: false,
    custom: true,
  };
  return saveChecklist(workspaceId, { items: [...current.items, item] });
}

export async function deleteChecklistItem(workspaceId: string, id: string) {
  const current = await getChecklist(workspaceId);
  return saveChecklist(workspaceId, { items: current.items.filter((i) => i.id !== id) });
}

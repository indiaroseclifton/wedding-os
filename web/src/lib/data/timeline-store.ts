import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText, ensureFile, pathExists } from "./store-io";

const timelineFile = path.join(dataDir, "timeline.json");

export type TimelineItem = {
  id: string;
  workspaceId: string;
  title: string;
  when: string; // ISO date or free text time
  category: string;
  notes?: string;
  done: boolean;
  createdAt: string;
};

async function readJson(): Promise<TimelineItem[]> {
  await ensureDir();
  try {
    return JSON.parse(await readText(timelineFile));
  } catch {
    return [];
  }
}

async function writeJson(rows: TimelineItem[]) {
  await writeText(timelineFile, JSON.stringify(rows, null, 2));
}

export async function listTimeline(workspaceId: string) {
  return (await readJson())
    .filter((r) => r.workspaceId === workspaceId)
    .sort((a, b) => a.when.localeCompare(b.when));
}

export async function addTimelineItem(input: {
  workspaceId: string;
  title: string;
  when: string;
  category?: string;
  notes?: string;
}) {
  const rows = await readJson();
  const row: TimelineItem = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    title: input.title,
    when: input.when,
    category: input.category || "General",
    notes: input.notes,
    done: false,
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  await writeJson(rows);
  return row;
}

export async function patchTimelineItem(
  id: string,
  patch: Partial<Pick<TimelineItem, "title" | "when" | "category" | "notes" | "done">>
) {
  const rows = await readJson();
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  await writeJson(rows);
  return row;
}

export async function deleteTimelineItem(id: string) {
  const rows = await readJson();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeJson(next);
  return true;
}

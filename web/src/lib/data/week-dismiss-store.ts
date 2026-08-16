import path from "path";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const file = path.join(dataDir, "week-dismiss.json");

async function readAll(): Promise<Record<string, string[]>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(file));
  } catch {
    return {};
  }
}

export async function getDismissedWeek(workspaceId: string) {
  const all = await readAll();
  return all[workspaceId] || [];
}

export async function dismissWeekItem(workspaceId: string, id: string) {
  const all = await readAll();
  const next = new Set(all[workspaceId] || []);
  next.add(id);
  all[workspaceId] = Array.from(next);
  await writeText(file, JSON.stringify(all, null, 2));
  return all[workspaceId];
}

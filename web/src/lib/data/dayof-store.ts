import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dataDir } from "./store-io";

const dayOfFile = path.join(dataDir, "day-of.json");

export type CheckIn = {
  id: string;
  name: string;
  role: string;
  status: "NOT_STARTED" | "ON_THE_WAY" | "ARRIVED" | "READY" | "BLOCKED";
  note?: string;
};

export type DayOfUpdate = {
  id: string;
  body: string;
  createdAt: string;
};

export type ScheduleSlot = {
  id: string;
  time: string;
  title: string;
  owner?: string;
};

export type StoredDayOf = {
  workspaceId: string;
  weatherNote?: string;
  emergencyContact?: string;
  checkIns: CheckIn[];
  updates: DayOfUpdate[];
  schedule: ScheduleSlot[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredDayOf>> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(dayOfFile, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredDayOf>) {
  await fs.writeFile(dayOfFile, JSON.stringify(all, null, 2), "utf8");
}

const DEFAULT_SCHEDULE: Omit<ScheduleSlot, "id">[] = [
  { time: "10:00", title: "Hair & makeup start", owner: "Party" },
  { time: "13:00", title: "Photographer arrives", owner: "Vendor" },
  { time: "14:30", title: "First look / portraits", owner: "Couple" },
  { time: "16:00", title: "Ceremony", owner: "All" },
  { time: "17:00", title: "Cocktail hour", owner: "Guests" },
  { time: "18:00", title: "Reception entrance", owner: "All" },
  { time: "18:30", title: "Dinner service", owner: "Catering" },
  { time: "20:00", title: "First dance", owner: "Couple" },
  { time: "22:00", title: "Last dance / send-off", owner: "All" },
];

export async function getDayOf(workspaceId: string): Promise<StoredDayOf> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      checkIns: [
        { id: randomUUID(), name: "Photographer", role: "Vendor", status: "NOT_STARTED" },
        { id: randomUUID(), name: "Day-of coordinator", role: "Vendor", status: "NOT_STARTED" },
        { id: randomUUID(), name: "Maid of honor", role: "Party", status: "NOT_STARTED" },
      ],
      updates: [],
      schedule: DEFAULT_SCHEDULE.map((s) => ({ ...s, id: randomUUID() })),
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  } else if (!all[workspaceId].schedule) {
    all[workspaceId].schedule = DEFAULT_SCHEDULE.map((s) => ({ ...s, id: randomUUID() }));
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveDayOf(workspaceId: string, patch: Partial<StoredDayOf>) {
  const all = await readAll();
  const current = await getDayOf(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function patchCheckIn(
  workspaceId: string,
  checkInId: string,
  patch: Partial<CheckIn>
) {
  const current = await getDayOf(workspaceId);
  const checkIns = current.checkIns.map((c) =>
    c.id === checkInId ? { ...c, ...patch } : c
  );
  return saveDayOf(workspaceId, { checkIns });
}

export async function addUpdate(workspaceId: string, body: string) {
  const current = await getDayOf(workspaceId);
  const updates = [
    { id: randomUUID(), body, createdAt: new Date().toISOString() },
    ...current.updates,
  ].slice(0, 50);
  return saveDayOf(workspaceId, { updates });
}

export async function addScheduleSlot(
  workspaceId: string,
  slot: { time: string; title: string; owner?: string }
) {
  const current = await getDayOf(workspaceId);
  const schedule = [
    ...current.schedule,
    { id: randomUUID(), ...slot },
  ].sort((a, b) => a.time.localeCompare(b.time));
  return saveDayOf(workspaceId, { schedule });
}

export async function removeScheduleSlot(workspaceId: string, slotId: string) {
  const current = await getDayOf(workspaceId);
  return saveDayOf(workspaceId, {
    schedule: current.schedule.filter((s) => s.id !== slotId),
  });
}

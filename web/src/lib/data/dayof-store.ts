import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";
import {
  type Audience,
  type RunSlot,
  audiencesOf,
  sortSlots,
} from "./run-of-show";

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

export type ScheduleSlot = RunSlot;

export type StoredDayOf = {
  workspaceId: string;
  weatherNote?: string;
  emergencyContact?: string;
  shareToken?: string;
  checkIns: CheckIn[];
  updates: DayOfUpdate[];
  schedule: ScheduleSlot[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredDayOf>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(dayOfFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredDayOf>) {
  await writeText(dayOfFile, JSON.stringify(all, null, 2));
}

const DEFAULT_SCHEDULE: Omit<ScheduleSlot, "id">[] = [
  {
    time: "10:00",
    endTime: "13:00",
    title: "Hair & makeup",
    location: "Getting-ready suite",
    lead: "Party",
    audiences: ["couple", "party"],
    notes: "Artists arrive at 10. Need outlets and a window.",
  },
  {
    time: "13:00",
    endTime: "13:20",
    title: "Photographer arrives",
    location: "Suite",
    lead: "Photo",
    audiences: ["couple", "party", "vendor"],
  },
  {
    time: "14:30",
    endTime: "15:30",
    title: "First look / portraits",
    location: "Garden / oaks",
    lead: "Photo",
    audiences: ["couple", "vendor"],
    notes: "Keep the party out of frame until after first look.",
  },
  {
    time: "15:40",
    endTime: "15:55",
    title: "Family groupings",
    location: "Lawn",
    lead: "Photo",
    audiences: ["couple", "party", "vendor"],
    notes: "List is on the photo handoff. Do not shout names from the lawn.",
  },
  {
    time: "16:00",
    endTime: "16:25",
    title: "Ceremony",
    guestTitle: "Ceremony",
    location: "Lawn (rain: loft)",
    lead: "Officiant",
    audiences: ["couple", "party", "vendor", "guests"],
  },
  {
    time: "16:30",
    endTime: "17:45",
    title: "Cocktail hour",
    guestTitle: "Cocktails & bites",
    location: "Terrace",
    lead: "Catering",
    audiences: ["couple", "party", "vendor", "guests"],
    notes: "Couple portraits until 17:00. Guests do not wait on you.",
  },
  {
    time: "18:00",
    endTime: "18:15",
    title: "Reception entrance",
    guestTitle: "Dinner",
    location: "Dining room",
    lead: "DJ",
    audiences: ["couple", "party", "vendor", "guests"],
  },
  {
    time: "18:15",
    endTime: "19:30",
    title: "Dinner service",
    guestTitle: "Dinner",
    location: "Dining room",
    lead: "Catering",
    audiences: ["couple", "vendor", "guests"],
  },
  {
    time: "20:00",
    endTime: "20:10",
    title: "First dance",
    guestTitle: "First dance",
    location: "Floor",
    lead: "DJ",
    audiences: ["couple", "party", "vendor", "guests"],
  },
  {
    time: "22:00",
    endTime: "22:15",
    title: "Last dance / send-off",
    guestTitle: "Send-off",
    location: "Front steps",
    lead: "Coordinator",
    audiences: ["couple", "party", "vendor", "guests"],
    notes: "Sparklers only if the venue said yes.",
  },
];

function normalizeSlot(slot: ScheduleSlot): ScheduleSlot {
  return {
    ...slot,
    audiences: audiencesOf(slot),
  };
}

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
  } else {
    all[workspaceId].schedule = sortSlots(all[workspaceId].schedule.map(normalizeSlot));
  }
  return all[workspaceId];
}

export async function getDayOfByShareToken(token: string) {
  if (!token) return null;
  const all = await readAll();
  const row = Object.values(all).find((item) => item.shareToken === token);
  if (!row) return null;
  return { ...row, schedule: sortSlots((row.schedule || []).map(normalizeSlot)) };
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
  slot: Omit<ScheduleSlot, "id">
) {
  const current = await getDayOf(workspaceId);
  const schedule = sortSlots([
    ...current.schedule,
    { id: randomUUID(), ...slot, audiences: slot.audiences || audiencesOf(slot) },
  ]);
  return saveDayOf(workspaceId, { schedule });
}

export async function patchScheduleSlot(
  workspaceId: string,
  id: string,
  patch: Partial<Omit<ScheduleSlot, "id">>
) {
  const current = await getDayOf(workspaceId);
  const schedule = sortSlots(
    current.schedule.map((s) => (s.id === id ? normalizeSlot({ ...s, ...patch }) : s))
  );
  return saveDayOf(workspaceId, { schedule });
}

export async function removeScheduleSlot(workspaceId: string, slotId: string) {
  const current = await getDayOf(workspaceId);
  return saveDayOf(workspaceId, {
    schedule: current.schedule.filter((s) => s.id !== slotId),
  });
}

export async function shareRunOfShow(workspaceId: string) {
  const current = await getDayOf(workspaceId);
  const shareToken = current.shareToken || randomUUID().replace(/-/g, "").slice(0, 16);
  return saveDayOf(workspaceId, { shareToken });
}

export function resetDefaultSchedule(workspaceId: string) {
  return saveDayOf(workspaceId, {
    schedule: DEFAULT_SCHEDULE.map((s) => ({ ...s, id: randomUUID() })),
  });
}

export type { Audience };

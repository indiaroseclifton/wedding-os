import path from "path";
import { randomUUID } from "crypto";
import { dataDir, readJson, writeJson } from "./store-io";
import type { SeatConstraint, SeatFreeze, SeatGuest } from "./seating";

const file = path.join(dataDir, "seating-plan.json");

export type StoredSeatingPlan = {
  id: string;
  workspaceId: string;
  constraints: SeatConstraint[];
  freezes: SeatFreeze[];
  seatMode?: "holding" | "plates";
  updatedAt: string;
};

async function readAll() {
  return readJson<StoredSeatingPlan>(file);
}

export async function getSeatingPlan(workspaceId: string): Promise<StoredSeatingPlan> {
  const rows = await readAll();
  const row = rows.find((r) => r.workspaceId === workspaceId);
  if (row) return row;
  const fresh: StoredSeatingPlan = {
    id: randomUUID(),
    workspaceId,
    constraints: [],
    freezes: [],
    seatMode: "holding",
    updatedAt: new Date().toISOString(),
  };
  rows.push(fresh);
  await writeJson(file, rows);
  return fresh;
}

async function save(plan: StoredSeatingPlan) {
  const rows = await readAll();
  const i = rows.findIndex((r) => r.workspaceId === plan.workspaceId);
  plan.updatedAt = new Date().toISOString();
  if (i >= 0) rows[i] = plan;
  else rows.push(plan);
  await writeJson(file, rows);
  return plan;
}

export async function addConstraint(
  workspaceId: string,
  input: Omit<SeatConstraint, "id">
) {
  const plan = await getSeatingPlan(workspaceId);
  plan.constraints.push({ ...input, id: randomUUID() });
  return save(plan);
}

export async function removeConstraint(workspaceId: string, id: string) {
  const plan = await getSeatingPlan(workspaceId);
  plan.constraints = plan.constraints.filter((c) => c.id !== id);
  return save(plan);
}

export async function freezeSeating(workspaceId: string, guests: SeatGuest[], label?: string) {
  const plan = await getSeatingPlan(workspaceId);
  const n = plan.freezes.length + 1;
  const freeze: SeatFreeze = {
    id: randomUUID(),
    label: label?.trim() || `v${n}`,
    at: new Date().toISOString(),
    assignments: guests.map((g) => ({
      guestId: g.id,
      name: g.name,
      table: g.tableLabel || null,
      seatIndex: g.seatIndex ?? null,
    })),
  };
  plan.freezes = [freeze, ...plan.freezes].slice(0, 12);
  await save(plan);
  return freeze;
}

export async function setSeatMode(workspaceId: string, seatMode: "holding" | "plates") {
  const plan = await getSeatingPlan(workspaceId);
  plan.seatMode = seatMode === "plates" ? "plates" : "holding";
  return save(plan);
}

import path from "path";
import { createHash, randomUUID } from "crypto";
import { dataDir, pathExists, readText, writeText } from "@/lib/data/store-io";
import {
  emptyControl,
  isSeat,
  type ControlConnections,
  type ControlPerson,
  type ControlState,
  type ControlYou,
  type Seat,
} from "@/lib/control";

export const controlFile = path.join(dataDir, "control.json");

function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function readState(): Promise<ControlState> {
  if (!(await pathExists(controlFile))) return emptyControl();
  try {
    const raw = JSON.parse(await readText(controlFile)) as ControlState;
    return {
      ...emptyControl(),
      ...raw,
      you: { ...emptyControl().you, ...(raw.you || {}) },
      connections: raw.connections || {},
      people: Array.isArray(raw.people) ? raw.people : [],
    };
  } catch {
    return emptyControl();
  }
}

async function writeState(next: ControlState) {
  next.updatedAt = new Date().toISOString();
  await writeText(controlFile, JSON.stringify(next, null, 2));
  return next;
}

export function publicControl(state: ControlState) {
  return {
    you: state.you,
    hasPassword: Boolean(state.passwordHash),
    plan: state.plan,
    connections: state.connections,
    people: state.people,
    updatedAt: state.updatedAt,
  };
}

export async function getControl() {
  return publicControl(await readState());
}

export async function patchYou(patch: Partial<ControlYou>) {
  const state = await readState();
  const you: ControlYou = {
    name: typeof patch.name === "string" ? patch.name.slice(0, 80) : state.you.name,
    email: typeof patch.email === "string" ? patch.email.slice(0, 160).toLowerCase() : state.you.email,
    phone: typeof patch.phone === "string" ? patch.phone.slice(0, 40) : state.you.phone,
    timezone: typeof patch.timezone === "string" ? patch.timezone.slice(0, 60) : state.you.timezone,
    photoUrl: typeof patch.photoUrl === "string" ? patch.photoUrl.slice(0, 500) : state.you.photoUrl,
  };
  return publicControl(await writeState({ ...state, you }));
}

export async function setControlPassword(next: string, current?: string) {
  const state = await readState();
  if (state.passwordHash) {
    if (!current || hashPassword(current) !== state.passwordHash) {
      return { ok: false as const, error: "Current password does not match." };
    }
  }
  if (next.length < 8) {
    return { ok: false as const, error: "New password needs 8 characters." };
  }
  await writeState({ ...state, passwordHash: hashPassword(next) });
  return { ok: true as const };
}

export async function setControlPlan(plan: ControlState["plan"]) {
  const state = await readState();
  return publicControl(await writeState({ ...state, plan }));
}

export async function setConnections(patch: ControlConnections) {
  const state = await readState();
  const connections: ControlConnections = { ...state.connections };
  for (const [key, value] of Object.entries(patch)) {
    if (key !== "drive" && key !== "onedrive" && key !== "icloud" && key !== "pinterest") continue;
    const url = typeof value === "string" ? value.trim().slice(0, 500) : "";
    if (!url) delete connections[key as keyof ControlConnections];
    else connections[key as keyof ControlConnections] = url;
  }
  return publicControl(await writeState({ ...state, connections }));
}

export async function addPerson(input: { name?: string; email?: string; seat?: string }) {
  const name = (input.name || "").trim().slice(0, 80);
  const email = (input.email || "").trim().slice(0, 160).toLowerCase();
  if (!name && !email) return { ok: false as const, error: "Name or email is required." };
  const seat: Seat = isSeat(input.seat) ? input.seat : "family";
  const state = await readState();
  const person: ControlPerson = {
    id: randomUUID(),
    name: name || email.split("@")[0],
    email,
    seat,
    status: "invited",
    createdAt: new Date().toISOString(),
  };
  state.people = [person, ...state.people];
  return { ok: true as const, control: publicControl(await writeState(state)) };
}

export async function removePerson(id: string) {
  const state = await readState();
  state.people = state.people.filter((p) => p.id !== id);
  return publicControl(await writeState(state));
}

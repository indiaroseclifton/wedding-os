import path from "path";
import { randomUUID } from "crypto";
import type { WorkspacePrefs } from "@/lib/preferences";
import {
  dataDir,
  ensureFile,
  readJson,
  writeJson,
  readText,
  writeText,
} from "./store-io";

const decisionsFile = path.join(dataDir, "decisions.json");
const invitesFile = path.join(dataDir, "invites.json");
const membersFile = path.join(dataDir, "members.json");
const tasksFile = path.join(dataDir, "tasks.json");
const guestsFile = path.join(dataDir, "guests.json");
const tablesFile = path.join(dataDir, "tables.json");
const workspaceMetaFile = path.join(dataDir, "workspace-meta.json");

export type StoredDecision = {
  id: string;
  workspaceId: string;
  type: string;
  title: string;
  status: string;
  summary: string;
  payload: Record<string, unknown>;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type StoredMember = {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  role: "COUPLE" | "WEDDING_PARTY";
  status: "ACTIVE" | "PENDING";
  createdAt: string;
};

export type StoredInvite = {
  id: string;
  workspaceId: string;
  email?: string;
  token: string;
  role: "COUPLE" | "WEDDING_PARTY";
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  name?: string;
  createdAt: string;
  acceptedAt?: string;
};

export type StoredTask = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  dueDate?: string;
  decisionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredGuest = {
  id: string;
  workspaceId: string;
  name: string;
  side?: string;
  partyName?: string;
  email?: string;
  address?: string;
  city?: string;
  region?: string;
  postal?: string;
  phone?: string;
  lastNudgedAt?: string;
  lastAddressNudgedAt?: string;
  nudgeCount?: number;
  inviteEmailedAt?: string;
  saveTheDateAt?: string;
  answers?: Record<string, string>;
  rsvp: string;
  plusOnes: number;
  plusOneNames?: string[];
  dietary?: string;
  meal?: string;
  rsvpToken?: string;
  tableLabel?: string;
  seatIndex?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredTable = {
  id: string;
  workspaceId: string;
  name: string;
  capacity: number;
  shape: "ROUND" | "RECT" | "HEAD" | "SWEETHEART" | "OTHER";
  notes?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export async function listDecisions(workspaceId: string) {
  const rows = await readJson<StoredDecision>(decisionsFile);
  return rows.filter((r) => r.workspaceId === workspaceId).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getDecision(id: string) {
  const rows = await readJson<StoredDecision>(decisionsFile);
  return rows.find((r) => r.id === id) ?? null;
}

export async function createDecision(input: Omit<StoredDecision, "id" | "createdAt" | "updatedAt">) {
  const rows = await readJson<StoredDecision>(decisionsFile);
  const now = new Date().toISOString();
  const row: StoredDecision = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
  rows.push(row);
  await writeJson(decisionsFile, rows);
  return row;
}

export async function updateDecision(id: string, patch: Partial<StoredDecision>) {
  const rows = await readJson<StoredDecision>(decisionsFile);
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, patch, { updatedAt: new Date().toISOString() });
  await writeJson(decisionsFile, rows);
  return row;
}

export async function upsertPrioritiesDecision(
  input: Omit<StoredDecision, "id" | "createdAt" | "updatedAt" | "type" | "title">
) {
  const rows = await readJson<StoredDecision>(decisionsFile);
  const existing = rows.find((r) => r.workspaceId === input.workspaceId && r.type === "PRIORITIES");
  const now = new Date().toISOString();
  if (existing) {
    existing.status = input.status;
    existing.summary = input.summary;
    existing.payload = input.payload;
    existing.participantIds = input.participantIds;
    existing.updatedAt = now;
    await writeJson(decisionsFile, rows);
    return existing;
  }
  return createDecision({ ...input, type: "PRIORITIES", title: "Priorities & Trade-offs" });
}

export async function upsertStyleVibeDecision(
  input: Omit<StoredDecision, "id" | "createdAt" | "updatedAt" | "type" | "title">
) {
  const rows = await readJson<StoredDecision>(decisionsFile);
  const existing = rows.find((r) => r.workspaceId === input.workspaceId && r.type === "STYLE_VIBE");
  const now = new Date().toISOString();
  if (existing) {
    Object.assign(existing, input, { updatedAt: now });
    await writeJson(decisionsFile, rows);
    return existing;
  }
  return createDecision({ ...input, type: "STYLE_VIBE", title: "Style & Vibe" });
}

export async function upsertVenueTypeDecision(
  input: Omit<StoredDecision, "id" | "createdAt" | "updatedAt" | "type" | "title">
) {
  const rows = await readJson<StoredDecision>(decisionsFile);
  const existing = rows.find((r) => r.workspaceId === input.workspaceId && r.type === "VENUE_TYPE");
  const now = new Date().toISOString();
  if (existing) {
    Object.assign(existing, input, { updatedAt: now });
    await writeJson(decisionsFile, rows);
    return existing;
  }
  return createDecision({ ...input, type: "VENUE_TYPE", title: "Venue Type & Setting" });
}

export async function listMembers(workspaceId: string) {
  const rows = await readJson<StoredMember>(membersFile);
  return rows.filter((r) => r.workspaceId === workspaceId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function ensureOwnerMember(
  workspaceId: string,
  owner: { userId: string; name: string; email: string }
) {
  const rows = await readJson<StoredMember>(membersFile);
  const existing = rows.find((r) => r.workspaceId === workspaceId && r.userId === owner.userId);
  if (existing) {
    if (existing.status !== "ACTIVE") {
      existing.status = "ACTIVE";
      await writeJson(membersFile, rows);
    }
    return existing;
  }
  const row: StoredMember = {
    id: randomUUID(),
    workspaceId,
    userId: owner.userId,
    name: owner.name,
    email: owner.email,
    role: "COUPLE",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  await writeJson(membersFile, rows);
  return row;
}

export async function addOrActivateMember(input: {
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  role: "COUPLE" | "WEDDING_PARTY";
}) {
  const rows = await readJson<StoredMember>(membersFile);
  const existing = rows.find((r) => r.workspaceId === input.workspaceId && r.userId === input.userId);
  if (existing) {
    existing.status = "ACTIVE";
    existing.role = input.role;
    existing.name = input.name;
    existing.email = input.email;
    await writeJson(membersFile, rows);
    return existing;
  }
  const row: StoredMember = {
    id: randomUUID(),
    ...input,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  await writeJson(membersFile, rows);
  return row;
}

export async function listInvites(workspaceId: string) {
  return (await readJson<StoredInvite>(invitesFile)).filter((r) => r.workspaceId === workspaceId);
}

export async function createInvite(input: {
  workspaceId: string;
  email?: string;
  name?: string;
  role: "COUPLE" | "WEDDING_PARTY";
}) {
  const rows = await readJson<StoredInvite>(invitesFile);
  const row: StoredInvite = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    email: input.email,
    name: input.name,
    token: randomUUID().replace(/-/g, ""),
    role: input.role,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  await writeJson(invitesFile, rows);
  return row;
}

export async function getInviteByToken(token: string) {
  return (await readJson<StoredInvite>(invitesFile)).find((r) => r.token === token) ?? null;
}

export async function acceptInvite(token: string, acceptor?: { name?: string }) {
  const rows = await readJson<StoredInvite>(invitesFile);
  const invite = rows.find((r) => r.token === token);
  if (!invite || invite.status !== "PENDING") return { ok: false as const };
  invite.status = "ACCEPTED";
  invite.acceptedAt = new Date().toISOString();
  await writeJson(invitesFile, rows);
  const name = acceptor?.name || invite.name || invite.email || "Guest";
  const email = invite.email || `${token.slice(0, 8)}@example.com`;
  const member = await addOrActivateMember({
    workspaceId: invite.workspaceId,
    userId: `user_${token.slice(0, 8)}`,
    name,
    email,
    role: invite.role,
  });
  return { ok: true as const, invite, member };
}

export async function listTasks(workspaceId: string) {
  return (await readJson<StoredTask>(tasksFile))
    .filter((r) => r.workspaceId === workspaceId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getTask(id: string) {
  return (await readJson<StoredTask>(tasksFile)).find((r) => r.id === id) ?? null;
}

export async function createTask(input: {
  workspaceId: string;
  title: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  dueDate?: string;
  decisionId?: string;
}) {
  const rows = await readJson<StoredTask>(tasksFile);
  const now = new Date().toISOString();
  const row: StoredTask = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    title: input.title,
    description: input.description,
    ownerId: input.ownerId,
    ownerName: input.ownerName,
    status: "NOT_STARTED",
    dueDate: input.dueDate,
    decisionId: input.decisionId,
    createdAt: now,
    updatedAt: now,
  };
  rows.push(row);
  await writeJson(tasksFile, rows);
  return row;
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<StoredTask, "title" | "description" | "ownerId" | "ownerName" | "status" | "dueDate" | "decisionId">>
) {
  const rows = await readJson<StoredTask>(tasksFile);
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  row.updatedAt = new Date().toISOString();
  await writeJson(tasksFile, rows);
  return row;
}

export async function deleteTask(id: string) {
  const rows = await readJson<StoredTask>(tasksFile);
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeJson(tasksFile, next);
  return true;
}

export async function listGuests(workspaceId: string) {
  return (await readJson<StoredGuest>(guestsFile)).filter((r) => r.workspaceId === workspaceId);
}

export async function getGuest(id: string) {
  return (await readJson<StoredGuest>(guestsFile)).find((r) => r.id === id) ?? null;
}

export async function getGuestByRsvpToken(token: string) {
  if (!token) return null;
  return (await readJson<StoredGuest>(guestsFile)).find((r) => r.rsvpToken === token) ?? null;
}

export async function ensureGuestRsvpTokens(workspaceId: string) {
  const rows = await readJson<StoredGuest>(guestsFile);
  let changed = false;
  for (const row of rows) {
    if (row.workspaceId === workspaceId && !row.rsvpToken) {
      row.rsvpToken = randomUUID().replace(/-/g, "").slice(0, 16);
      changed = true;
    }
  }
  if (changed) await writeJson(guestsFile, rows);
  return rows.filter((r) => r.workspaceId === workspaceId);
}

export async function createGuest(input: Omit<StoredGuest, "id" | "createdAt" | "updatedAt">) {
  const rows = await readJson<StoredGuest>(guestsFile);
  const now = new Date().toISOString();
  const row: StoredGuest = {
    ...input,
    id: randomUUID(),
    rsvpToken: input.rsvpToken || randomUUID().replace(/-/g, "").slice(0, 16),
    createdAt: now,
    updatedAt: now,
  };
  rows.push(row);
  await writeJson(guestsFile, rows);
  return row;
}

export async function updateGuest(id: string, patch: Partial<StoredGuest>) {
  const rows = await readJson<StoredGuest>(guestsFile);
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, patch, { updatedAt: new Date().toISOString() });
  await writeJson(guestsFile, rows);
  return row;
}

export async function deleteGuest(id: string) {
  const rows = await readJson<StoredGuest>(guestsFile);
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeJson(guestsFile, next);
  return true;
}

export async function createGuestsBulk(
  inputs: Array<Omit<StoredGuest, "id" | "createdAt" | "updatedAt">>
) {
  const rows = await readJson<StoredGuest>(guestsFile);
  const now = new Date().toISOString();
  const created = inputs.map((input) => ({
    ...input,
    id: randomUUID(),
    rsvpToken: input.rsvpToken || randomUUID().replace(/-/g, "").slice(0, 16),
    createdAt: now,
    updatedAt: now,
  }));
  rows.push(...created);
  await writeJson(guestsFile, rows);
  return created;
}

export async function listTables(workspaceId: string) {
  return (await readJson<StoredTable>(tablesFile))
    .filter((r) => r.workspaceId === workspaceId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function getTable(id: string) {
  return (await readJson<StoredTable>(tablesFile)).find((r) => r.id === id) ?? null;
}

export async function createTable(input: {
  workspaceId: string;
  name: string;
  capacity?: number;
  shape?: StoredTable["shape"];
  notes?: string;
}) {
  const rows = await readJson<StoredTable>(tablesFile);
  const now = new Date().toISOString();
  const sortOrder =
    rows.filter((r) => r.workspaceId === input.workspaceId).reduce((m, r) => Math.max(m, r.sortOrder), 0) + 1;
  const row: StoredTable = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    name: input.name.trim(),
    capacity: Math.max(1, input.capacity ?? 8),
    shape: input.shape || "ROUND",
    notes: input.notes,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
  rows.push(row);
  await writeJson(tablesFile, rows);
  return row;
}

export async function updateTable(
  id: string,
  patch: Partial<Pick<StoredTable, "name" | "capacity" | "shape" | "notes" | "sortOrder">>
) {
  const rows = await readJson<StoredTable>(tablesFile);
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  if (patch.capacity != null) row.capacity = Math.max(1, Number(patch.capacity) || 1);
  row.updatedAt = new Date().toISOString();
  await writeJson(tablesFile, rows);
  return row;
}

export async function deleteTable(id: string) {
  const rows = await readJson<StoredTable>(tablesFile);
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeJson(tablesFile, next);
  return true;
}

export async function assignGuestToTable(guestId: string, tableName: string | null) {
  return updateGuest(guestId, { tableLabel: tableName || undefined });
}

export async function assignGuestsToTable(
  guestIds: string[],
  tableName: string | null,
  seatIndex?: number
) {
  const rows = await readJson<StoredGuest>(guestsFile);
  const now = new Date().toISOString();
  const ids = new Set(guestIds);
  const taken = new Set(
    rows
      .filter((r) => r.tableLabel === tableName && r.seatIndex != null && !ids.has(r.id))
      .map((r) => r.seatIndex as number)
  );
  let next = typeof seatIndex === "number" ? seatIndex : 0;
  while (taken.has(next)) next += 1;
  for (const row of rows) {
    if (!ids.has(row.id)) continue;
    if (!tableName) {
      row.tableLabel = undefined;
      row.seatIndex = undefined;
    } else {
      row.tableLabel = tableName;
      if (typeof seatIndex === "number" && guestIds.length === 1) {
        row.seatIndex = seatIndex;
      } else {
        while (taken.has(next)) next += 1;
        row.seatIndex = next;
        taken.add(next);
        next += 1 + Math.max(0, row.plusOnes || 0);
      }
    }
    row.updatedAt = now;
  }
  await writeJson(guestsFile, rows);
  return rows.filter((r) => ids.has(r.id));
}

export async function expandPlusOnes(workspaceId: string) {
  const rows = await readJson<StoredGuest>(guestsFile);
  const mine = rows.filter((r) => r.workspaceId === workspaceId);
  const existing = new Set(mine.map((g) => g.name.trim().toLowerCase()));
  const created: StoredGuest[] = [];
  const now = new Date().toISOString();
  for (const parent of mine) {
    const names = (parent.plusOneNames || []).map((n) => n.trim()).filter(Boolean);
    if (!names.length) continue;
    let made = 0;
    for (const name of names) {
      const key = name.toLowerCase();
      if (existing.has(key)) continue;
      const row: StoredGuest = {
        workspaceId,
        name,
        side: parent.side,
        partyName: parent.partyName || householdFrom(parent.name),
        rsvp: parent.rsvp === "NO" ? "NO" : parent.rsvp || "UNKNOWN",
        plusOnes: 0,
        plusOneNames: [],
        dietary: undefined,
        meal: parent.meal,
        tableLabel: parent.tableLabel,
        notes: `Plus-one of ${parent.name}`,
        id: randomUUID(),
        rsvpToken: randomUUID().replace(/-/g, "").slice(0, 16),
        createdAt: now,
        updatedAt: now,
      };
      rows.push(row);
      created.push(row);
      existing.add(key);
      made += 1;
    }
    if (made) {
      parent.plusOnes = Math.max(0, (parent.plusOnes || 0) - made);
      parent.plusOneNames = [];
      parent.updatedAt = now;
    }
  }
  if (created.length) await writeJson(guestsFile, rows);
  return created;
}

function householdFrom(name: string) {
  return name.trim().split(/\s+/).slice(-1)[0] || name;
}

export async function remapGuestTableLabel(
  workspaceId: string,
  fromName: string,
  toName: string | null
) {
  const rows = await readJson<StoredGuest>(guestsFile);
  const now = new Date().toISOString();
  for (const row of rows) {
    if (row.workspaceId !== workspaceId || row.tableLabel !== fromName) continue;
    row.tableLabel = toName || undefined;
    row.updatedAt = now;
  }
  await writeJson(guestsFile, rows);
}

export type WorkspaceMetaRow = {
  name?: string;
  weddingDate?: string;
  location?: string;
  coupleNames?: string;
  coverUrl?: string;
} & WorkspacePrefs;

export async function getWorkspaceMeta(workspaceId: string, fallbackName: string) {
  await ensureFile(workspaceMetaFile, "{}");
  const raw = await readText(workspaceMetaFile);
  const all = JSON.parse(raw || "{}") as Record<string, WorkspaceMetaRow>;
  if (!all[workspaceId]) {
    all[workspaceId] = {
      name: fallbackName,
      coupleNames: "Alex & Jordan",
      weddingDate: "2026-10-17",
      location: "Atlanta, GA",
      coverUrl: "/brand/tablescape.jpg",
      theme: "linen",
      faith: "none",
    };
    await writeText(workspaceMetaFile, JSON.stringify(all, null, 2));
  }
  const row = all[workspaceId];
  let dirty = false;
  if (!row.coupleNames) {
    row.coupleNames = "Alex & Jordan";
    dirty = true;
  }
  if (!row.weddingDate) {
    row.weddingDate = "2026-10-17";
    dirty = true;
  }
  if (!row.location) {
    row.location = "Atlanta, GA";
    dirty = true;
  }
  if (!row.coverUrl) {
    row.coverUrl = "/brand/tablescape.jpg";
    dirty = true;
  }
  if (!row.theme) {
    row.theme = "linen";
    dirty = true;
  }
  if (!row.faith) {
    row.faith = "none";
    dirty = true;
  }
  if (dirty) {
    all[workspaceId] = row;
    await writeText(workspaceMetaFile, JSON.stringify(all, null, 2));
  }
  return {
    workspaceId,
    name: row.name || fallbackName,
    weddingDate: row.weddingDate,
    location: row.location,
    coupleNames: row.coupleNames,
    coverUrl: row.coverUrl,
    theme: row.theme || "linen",
    faith: row.faith || "none",
    faithPacks: row.faithPacks || [],
    ceremonyStyle: row.ceremonyStyle,
    formality: row.formality,
    weekend: row.weekend,
    partnerA: row.partnerA,
    partnerB: row.partnerB,
    kidsWelcome: row.kidsWelcome,
    unplugged: row.unplugged,
    defaultPlusOnes: row.defaultPlusOnes,
    timezone: row.timezone,
    guestSitePublic: row.guestSitePublic,
    onboarded: row.onboarded === true,
    firstWalkDone: row.firstWalkDone === true,
    diyBias: row.diyBias,
    shape: row.shape,
    enterHow: row.enterHow,
    gatheringDate: row.gatheringDate,
    siteMode: row.siteMode,
    motion: row.motion,
  };
}

export async function saveWorkspaceMeta(workspaceId: string, patch: Partial<WorkspaceMetaRow>) {
  await ensureFile(workspaceMetaFile, "{}");
  const raw = await readText(workspaceMetaFile);
  const all = JSON.parse(raw || "{}") as Record<string, WorkspaceMetaRow>;
  all[workspaceId] = { ...all[workspaceId], ...patch };
  await writeText(workspaceMetaFile, JSON.stringify(all, null, 2));
  return all[workspaceId];
}

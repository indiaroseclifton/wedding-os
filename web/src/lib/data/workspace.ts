import {
  acceptInvite,
  createInvite,
  createTask,
  deleteTask,
  ensureOwnerMember,
  getDecision,
  createDecision,
  updateDecision,
  getInviteByToken,
  getTask,
  listDecisions,
  listInvites,
  listMembers,
  listTasks,
  updateTask,
  upsertPrioritiesDecision,
  upsertStyleVibeDecision,
  upsertVenueTypeDecision,
  listGuests,
  getGuest,
  getGuestByRsvpToken,
  ensureGuestRsvpTokens,
  createGuest,
  updateGuest,
  deleteGuest,
  createGuestsBulk,
  getWorkspaceMeta,
  saveWorkspaceMeta,
  listTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  assignGuestToTable,
  assignGuestsToTable,
  remapGuestTableLabel,
  addOrActivateMember,
} from "@/lib/data/store";

export const DEMO_WORKSPACE_ID = "ws_alex_jordan";
export const DEMO_ALEX_ID = "user_alex";
export const DEMO_JORDAN_ID = "user_jordan";

export const DEMO_WORKSPACE = {
  id: DEMO_WORKSPACE_ID,
  name: "Alex & Jordan's Wedding",
};

export const DEMO_USERS = {
  alex: { id: DEMO_ALEX_ID, name: "Alex Rivera", email: "alex@example.com" },
  jordan: { id: DEMO_JORDAN_ID, name: "Jordan Lee", email: "jordan@example.com" },
};

export async function ensureDemoWorkspace() {
  await ensureOwnerMember(DEMO_WORKSPACE_ID, {
    userId: DEMO_USERS.alex.id,
    name: DEMO_USERS.alex.name,
    email: DEMO_USERS.alex.email,
  });
  await ensureOwnerMember(DEMO_WORKSPACE_ID, {
    userId: DEMO_USERS.jordan.id,
    name: DEMO_USERS.jordan.name,
    email: DEMO_USERS.jordan.email,
  });
  const meta = await getWorkspaceMeta(DEMO_WORKSPACE_ID, DEMO_WORKSPACE.name);
  return {
    workspace: { id: DEMO_WORKSPACE_ID, name: meta.name || DEMO_WORKSPACE.name },
    meta,
  };
}

export async function ensureEmailMember(user: {
  userId: string;
  name: string;
  email: string;
}) {
  await ensureDemoWorkspace();
  return addOrActivateMember({
    workspaceId: DEMO_WORKSPACE_ID,
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: "COUPLE",
  });
}

export async function getCurrentMembership(userId: string) {
  const members = await listMembers(DEMO_WORKSPACE_ID);
  return members.find((m) => m.userId === userId && m.status === "ACTIVE") ?? null;
}

export async function getWorkspaceDecisions(workspaceId: string) {
  return listDecisions(workspaceId);
}

export { createDecision, updateDecision };

export async function getWorkspaceTasks(workspaceId: string) {
  return listTasks(workspaceId);
}

export async function getTaskById(id: string) {
  return getTask(id);
}

export async function addTask(input: Parameters<typeof createTask>[0]) {
  return createTask(input);
}

export async function patchTask(id: string, patch: Parameters<typeof updateTask>[1]) {
  return updateTask(id, patch);
}

export async function removeTask(id: string) {
  return deleteTask(id);
}

export async function savePrioritiesDecision(input: Parameters<typeof upsertPrioritiesDecision>[0]) {
  return upsertPrioritiesDecision(input);
}

export async function saveStyleVibeDecision(input: Parameters<typeof upsertStyleVibeDecision>[0]) {
  return upsertStyleVibeDecision(input);
}

export async function saveVenueTypeDecision(input: Parameters<typeof upsertVenueTypeDecision>[0]) {
  return upsertVenueTypeDecision(input);
}

export async function getDecisionById(id: string) {
  return getDecision(id);
}

export async function getWorkspaceGuests(workspaceId: string) {
  return listGuests(workspaceId);
}

export async function getGuestById(id: string) {
  return getGuest(id);
}

export async function findGuestByRsvpToken(token: string) {
  return getGuestByRsvpToken(token);
}

export async function ensureRsvpTokens(workspaceId: string) {
  return ensureGuestRsvpTokens(workspaceId);
}

export async function addGuest(input: Parameters<typeof createGuest>[0]) {
  return createGuest(input);
}

export async function patchGuest(id: string, patch: Parameters<typeof updateGuest>[1]) {
  return updateGuest(id, patch);
}

export async function removeGuest(id: string) {
  return deleteGuest(id);
}

export async function bulkAddGuests(inputs: Parameters<typeof createGuestsBulk>[0]) {
  return createGuestsBulk(inputs);
}

export async function getWorkspaceTables(workspaceId: string) {
  return listTables(workspaceId);
}

export async function getTableById(id: string) {
  return getTable(id);
}

export async function addTable(input: Parameters<typeof createTable>[0]) {
  return createTable(input);
}

export async function patchTable(id: string, patch: Parameters<typeof updateTable>[1]) {
  return updateTable(id, patch);
}

export async function removeTable(id: string) {
  return deleteTable(id);
}

export async function seatGuest(guestId: string, tableName: string | null) {
  return assignGuestToTable(guestId, tableName);
}

export async function seatGuests(
  guestIds: string[],
  tableName: string | null,
  seatIndex?: number
) {
  return assignGuestsToTable(guestIds, tableName, seatIndex);
}

export async function remapSeats(
  workspaceId: string,
  fromName: string,
  toName: string | null
) {
  return remapGuestTableLabel(workspaceId, fromName, toName);
}

export async function getWorkspaceInvites(workspaceId: string) {
  return listInvites(workspaceId);
}

export async function addInvite(input: Parameters<typeof createInvite>[0]) {
  return createInvite(input);
}

export async function findInviteByToken(token: string) {
  return getInviteByToken(token);
}

export async function acceptInviteToken(token: string, acceptor?: { name?: string }) {
  return acceptInvite(token, acceptor);
}

export async function loadWorkspaceMeta(workspaceId: string, fallbackName: string) {
  return getWorkspaceMeta(workspaceId, fallbackName);
}

export async function updateWorkspaceMeta(
  workspaceId: string,
  patch: Parameters<typeof saveWorkspaceMeta>[1]
) {
  return saveWorkspaceMeta(workspaceId, patch);
}

export async function getWorkspaceMembers(workspaceId: string) {
  return listMembers(workspaceId);
}

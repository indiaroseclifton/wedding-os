import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText, ensureFile, pathExists } from "./store-io";

const pollsFile = path.join(dataDir, "polls.json");

export type StoredPoll = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  mode: "SINGLE" | "RANKED";
  options: { id: string; label: string }[];
  /** userId -> optionId for single; userId -> ordered optionIds for ranked */
  votes: Record<string, string | string[]>;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
};

async function readJson(): Promise<StoredPoll[]> {
  await ensureDir();
  try {
    return JSON.parse(await readText(pollsFile));
  } catch {
    return [];
  }
}

async function writeJson(rows: StoredPoll[]) {
  await ensureDir();
  await writeText(pollsFile, JSON.stringify(rows, null, 2));
}

export async function listPolls(workspaceId: string) {
  return (await readJson())
    .filter((p) => p.workspaceId === workspaceId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getPoll(id: string) {
  return (await readJson()).find((p) => p.id === id) ?? null;
}

export async function createPoll(input: {
  workspaceId: string;
  title: string;
  description?: string;
  options: string[];
  mode?: "SINGLE" | "RANKED";
}) {
  const rows = await readJson();
  const now = new Date().toISOString();
  const poll: StoredPoll = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    title: input.title,
    description: input.description,
    mode: input.mode || "SINGLE",
    options: input.options.filter(Boolean).map((label) => ({
      id: randomUUID(),
      label,
    })),
    votes: {},
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  };
  rows.push(poll);
  await writeJson(rows);
  return poll;
}

export async function castVote(
  pollId: string,
  userId: string,
  optionId: string | string[]
) {
  const rows = await readJson();
  const poll = rows.find((p) => p.id === pollId);
  if (!poll || poll.status !== "OPEN") return null;

  if (poll.mode === "RANKED") {
    const ranking = Array.isArray(optionId) ? optionId : [optionId];
    const valid = ranking.every((id) => poll.options.some((o) => o.id === id));
    if (!valid || ranking.length === 0) return null;
    poll.votes[userId] = ranking;
  } else {
    const id = Array.isArray(optionId) ? optionId[0] : optionId;
    if (!poll.options.some((o) => o.id === id)) return null;
    poll.votes[userId] = id;
  }

  poll.updatedAt = new Date().toISOString();
  await writeJson(rows);
  return poll;
}

export async function closePoll(pollId: string) {
  const rows = await readJson();
  const poll = rows.find((p) => p.id === pollId);
  if (!poll) return null;
  poll.status = "CLOSED";
  poll.updatedAt = new Date().toISOString();
  await writeJson(rows);
  return poll;
}

/** Borda-style points for ranked polls: n points for 1st, n-1 for 2nd, ... */
export function tallyRanked(poll: StoredPoll): { optionId: string; points: number }[] {
  const n = poll.options.length;
  const points: Record<string, number> = {};
  for (const o of poll.options) points[o.id] = 0;
  for (const vote of Object.values(poll.votes)) {
    if (!Array.isArray(vote)) continue;
    vote.forEach((optionId, index) => {
      points[optionId] = (points[optionId] || 0) + (n - index);
    });
  }
  return Object.entries(points)
    .map(([optionId, pts]) => ({ optionId, points: pts }))
    .sort((a, b) => b.points - a.points);
}

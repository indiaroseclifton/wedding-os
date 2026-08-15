import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const dataDir = path.join(process.cwd(), ".data");
const pollsFile = path.join(dataDir, "polls.json");

export type StoredPoll = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  options: { id: string; label: string }[];
  votes: Record<string, string>; // userId -> optionId
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
};

async function readJson(): Promise<StoredPoll[]> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(pollsFile, "utf8"));
  } catch {
    return [];
  }
}

async function writeJson(rows: StoredPoll[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(pollsFile, JSON.stringify(rows, null, 2), "utf8");
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
}) {
  const rows = await readJson();
  const now = new Date().toISOString();
  const poll: StoredPoll = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    title: input.title,
    description: input.description,
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

export async function castVote(pollId: string, userId: string, optionId: string) {
  const rows = await readJson();
  const poll = rows.find((p) => p.id === pollId);
  if (!poll || poll.status !== "OPEN") return null;
  if (!poll.options.some((o) => o.id === optionId)) return null;
  poll.votes[userId] = optionId;
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

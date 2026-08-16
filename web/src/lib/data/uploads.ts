import path from "path";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const metaFile = path.join(dataDir, "uploads.json");
const dir = path.join(dataDir, "files");

export type StoredUpload = {
  id: string;
  workspaceId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
};

async function readAll(): Promise<Record<string, StoredUpload>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(metaFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredUpload>) {
  await writeText(metaFile, JSON.stringify(all, null, 2));
}

export async function putUpload(
  workspaceId: string,
  file: { name: string; type: string; bytes: Buffer }
): Promise<StoredUpload> {
  const id = randomUUID().replace(/-/g, "").slice(0, 16);
  const ext = path.extname(file.name || "").slice(0, 8) || guessExt(file.type);
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  let url = `/api/uploads/${id}${ext}`;

  if (token) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`wedding-os/${workspaceId}/${id}${ext}`, file.bytes, {
      access: "public",
      contentType: file.type || "application/octet-stream",
      token,
    });
    url = blob.url;
  } else {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${id}${ext}`), file.bytes);
  }

  const row: StoredUpload = {
    id,
    workspaceId,
    name: (file.name || "file").slice(0, 120),
    type: file.type || "application/octet-stream",
    size: file.bytes.length,
    url,
    createdAt: new Date().toISOString(),
  };
  const all = await readAll();
  all[id] = row;
  await writeAll(all);
  return row;
}

export async function getUpload(id: string) {
  const all = await readAll();
  return all[id] || null;
}

export async function readLocalFile(id: string) {
  const row = await getUpload(id);
  if (!row) return null;
  const ext = path.extname(row.url) || guessExt(row.type);
  const filePath = path.join(dir, `${id}${ext}`);
  try {
    const bytes = await fs.readFile(filePath);
    return { bytes, type: row.type, name: row.name };
  } catch {
    return null;
  }
}

function guessExt(type: string) {
  if (type.includes("pdf")) return ".pdf";
  if (type.includes("png")) return ".png";
  if (type.includes("jpeg") || type.includes("jpg")) return ".jpg";
  if (type.includes("webp")) return ".webp";
  if (type.includes("gif")) return ".gif";
  return "";
}

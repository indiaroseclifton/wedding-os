import { writeFileSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL — skipping JsonStore ensure");
  process.exit(0);
}

const sql = `
CREATE TABLE IF NOT EXISTS "JsonStore" (
  "key" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JsonStore_pkey" PRIMARY KEY ("key")
);
`;

const file = join(tmpdir(), "wedding-os-jsonstore.sql");
writeFileSync(file, sql);
const result = spawnSync(
  "npx",
  ["prisma", "db", "execute", "--file", file, "--schema", "prisma/schema.prisma"],
  { stdio: "inherit", env: process.env },
);
try {
  unlinkSync(file);
} catch {
  // ignore
}
process.exit(result.status ?? 1);

import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL — skipping prisma migrate deploy");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);

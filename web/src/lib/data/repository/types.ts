export type DataBackend = "file" | "prisma";

export function getDataBackend(): DataBackend {
  // Production with a database always persists — ignore leftover DATA_BACKEND=file.
  if (process.env.DATABASE_URL && process.env.VERCEL) return "prisma";
  if (process.env.DATA_BACKEND === "prisma") return "prisma";
  if (process.env.DATA_BACKEND === "file") return "file";
  return process.env.DATABASE_URL ? "prisma" : "file";
}

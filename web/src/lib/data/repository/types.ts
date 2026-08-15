export type DataBackend = "file" | "prisma";

export function getDataBackend(): DataBackend {
  if (process.env.DATA_BACKEND === "file") return "file";
  if (process.env.DATA_BACKEND === "prisma") return "prisma";
  return process.env.DATABASE_URL ? "prisma" : "file";
}

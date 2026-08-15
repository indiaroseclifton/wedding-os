export type DataBackend = "file" | "prisma";

export function getDataBackend(): DataBackend {
  return process.env.DATA_BACKEND === "prisma" ? "prisma" : "file";
}

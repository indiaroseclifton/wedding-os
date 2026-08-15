import { NextResponse } from "next/server";

/** Milestone A: liveness. Does not require Prisma. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    backend: process.env.DATA_BACKEND || "file",
    demoAuth: process.env.DEMO_AUTH !== "0",
    time: new Date().toISOString(),
  });
}

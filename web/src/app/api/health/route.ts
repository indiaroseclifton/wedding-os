import { NextResponse } from "next/server";
import { getDataBackend } from "@/lib/data/repository/types";

/** Milestone A: liveness. Does not require Prisma. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    backend: getDataBackend(),
    demoAuth: process.env.DEMO_AUTH !== "0",
    time: new Date().toISOString(),
  });
}

import { NextResponse } from "next/server";
import { emailLoginEnabled } from "@/lib/auth/session";
import { getDataBackend } from "@/lib/data/repository/types";
import { emailIsConnected } from "@/lib/email/send";

export async function GET() {
  return NextResponse.json({
    ok: true,
    backend: getDataBackend(),
    demoAuth: process.env.DEMO_AUTH !== "0",
    emailLogin: emailLoginEnabled(),
    email: emailIsConnected(),
    time: new Date().toISOString(),
  });
}
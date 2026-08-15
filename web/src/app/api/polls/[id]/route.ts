import { NextResponse } from "next/server";
import { requireCoupleApi, requireSession } from "@/lib/auth/access";
import { castVote, closePoll, getPoll } from "@/lib/data/polls-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireSession();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const poll = await getPoll(id);
  if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ poll });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireSession();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const body = await request.json();
  if (body.action === "close") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const poll = await closePoll(id);
    if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ poll });
  }
  if (body.action === "vote") {
    const poll = await castVote(id, access.session.userId, body.optionId);
    if (!poll) return NextResponse.json({ error: "Could not vote" }, { status: 400 });
    return NextResponse.json({ poll });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

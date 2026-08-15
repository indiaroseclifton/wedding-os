import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  addGuest,
  ensureDemoWorkspace,
  getWorkspaceGuests,
} from "@/lib/data/workspace";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

const RSVP = new Set(["UNKNOWN", "INVITED", "YES", "NO", "MAYBE"]);
const SIDES = new Set(["A", "B", "BOTH", "OTHER"]);

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const guests = await getWorkspaceGuests(workspace.id);
  const headcount = guests.reduce((sum, g) => {
    if (g.rsvp === "NO") return sum;
    return sum + 1 + (g.plusOnes || 0);
  }, 0);
  const yes = guests.filter((g) => g.rsvp === "YES").length;
  return NextResponse.json({ guests, stats: { total: guests.length, yes, headcount } });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const name = requiredString(body.name, "Name", 200);
    const { workspace } = await ensureDemoWorkspace();
    const guest = await addGuest({
      workspaceId: workspace.id,
      name,
      side: SIDES.has(body.side) ? body.side : "OTHER",
      partyName: optionalString(body.partyName, 120),
      email: optionalString(body.email, 200),
      rsvp: RSVP.has(body.rsvp) ? body.rsvp : "UNKNOWN",
      plusOnes: typeof body.plusOnes === "number" ? Math.max(0, body.plusOnes) : 0,
      dietary: optionalString(body.dietary, 500),
      notes: optionalString(body.notes, 2000),
    });
    return NextResponse.json({ guest });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create guest", error);
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  createEvent,
  listEvents,
  rollupEvents,
} from "@/lib/data/events-store";
import { countEventRsvps, listEventRsvps } from "@/lib/data/event-rsvp-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const events = await listEvents(workspace.id);
  const rsvps = await listEventRsvps(workspace.id);
  const withCounts = events.map((e) => ({
    ...e,
    rsvpCounts: countEventRsvps(rsvps.filter((r) => r.eventId === e.id)),
  }));
  return NextResponse.json({ events: withCounts, rollup: rollupEvents(events) });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const name = requiredString(body.name, "Name", 200);
    const { workspace } = await ensureDemoWorkspace();
    const event = await createEvent({
      workspaceId: workspace.id,
      name,
      type: body.type || "Other",
      date: optionalString(body.date, 40),
      location: optionalString(body.location, 200),
      budgetCap:
        body.budgetCap === "" || body.budgetCap == null
          ? undefined
          : Number(body.budgetCap) || 0,
      expectedGuests:
        body.expectedGuests === "" || body.expectedGuests == null
          ? undefined
          : Number(body.expectedGuests) || 0,
      notes: optionalString(body.notes, 2000),
      rsvpEnabled: Boolean(body.rsvpEnabled),
      askMeal: Boolean(body.askMeal),
      inviteMode: body.inviteMode === "everyone" ? "everyone" : "invited",
    });
    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

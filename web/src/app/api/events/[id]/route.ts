import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
} from "@/lib/data/workspace";
import {
  deleteEvent,
  getEvent,
  isWeddingDayEvent,
  updateEvent,
} from "@/lib/data/events-store";
import {
  countEventRsvps,
  deleteRsvpsForEvent,
  inviteGuestsToEvent,
  listRsvpsForEvent,
  uninviteGuest,
} from "@/lib/data/event-rsvp-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { workspace } = await ensureDemoWorkspace();
  if (event.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [rsvps, guests] = await Promise.all([
    listRsvpsForEvent(id),
    getWorkspaceGuests(workspace.id),
  ]);
  return NextResponse.json({
    event,
    rsvps,
    guests,
    rsvpCounts: countEventRsvps(rsvps),
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const current = await getEvent(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  for (const key of [
    "name",
    "type",
    "date",
    "location",
    "budgetCap",
    "expectedGuests",
    "notes",
    "rsvpEnabled",
    "askMeal",
    "inviteMode",
  ] as const) {
    if (key in body) patch[key] = body[key];
  }
  if (isWeddingDayEvent({ type: String(patch.type || current.type) })) {
    patch.rsvpEnabled = false;
  }
  const event = await updateEvent(id, patch);
  return NextResponse.json({ event });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  await deleteRsvpsForEvent(id);
  const ok = await deleteEvent(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { workspace } = await ensureDemoWorkspace();
  const body = await request.json();
  const guests = await getWorkspaceGuests(workspace.id);

  if (body.action === "invite") {
    let ids: string[] = Array.isArray(body.guestIds) ? body.guestIds.map(String) : [];
    if (body.preset === "wedding_yes") {
      ids = guests.filter((g) => g.rsvp === "YES").map((g) => g.id);
    } else if (body.preset === "all") {
      ids = guests.filter((g) => g.rsvp !== "NO").map((g) => g.id);
    }
    const rsvps = await inviteGuestsToEvent(workspace.id, id, ids);
    return NextResponse.json({ ok: true, rsvps, rsvpCounts: countEventRsvps(rsvps) });
  }
  if (body.action === "uninvite") {
    await uninviteGuest(id, String(body.guestId));
    const rsvps = await listRsvpsForEvent(id);
    return NextResponse.json({ ok: true, rsvps, rsvpCounts: countEventRsvps(rsvps) });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

import { NextResponse } from "next/server";
import { getSiteByToken } from "@/lib/data/site-store";
import {
  ensureGuestRsvpTokens,
  getGuestByRsvpToken,
  listGuests,
  updateGuest,
} from "@/lib/data/store";
import { getEvent } from "@/lib/data/events-store";
import {
  eventVisibleToGuest,
  publicEventsForGuest,
  rsvpsForGuest,
  upsertEventRsvp,
  type EventRsvpStatus,
} from "@/lib/data/event-rsvp-store";

const RSVP = new Set(["YES", "NO", "MAYBE"]);
const EVENT_RSVP = new Set(["YES", "NO", "MAYBE", "INVITED"]);

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteToken = url.searchParams.get("site") || "";
  const rsvpToken = url.searchParams.get("guest") || "";
  const site = await getSiteByToken(siteToken);
  if (!site || !site.published) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }
  const guest = await getGuestByRsvpToken(rsvpToken);
  if (!guest || guest.workspaceId !== site.workspaceId) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }
  const events = await publicEventsForGuest(site.workspaceId, guest.id);
  const household =
    guest.partyName?.trim()
      ? (await listGuests(site.workspaceId)).filter(
          (g) => g.partyName?.trim() === guest.partyName?.trim()
        )
      : [guest];
  return NextResponse.json({
    guest: {
      name: guest.name,
      rsvp: guest.rsvp,
      plusOnes: guest.plusOnes,
      dietary: guest.dietary,
      meal: guest.meal,
      notes: guest.notes,
      address: guest.address,
      city: guest.city,
      region: guest.region,
      postal: guest.postal,
      phone: guest.phone,
      partyName: guest.partyName,
      answers: guest.answers || {},
    },
    household: household.map((g) => ({
      id: g.id,
      name: g.name,
      rsvp: g.rsvp,
      rsvpToken: g.rsvpToken,
    })),
    questions: site.rsvpQuestions || [],
    events,
    collectAddress: site.collectAddress,
    requireAddress: site.requireAddress,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const siteToken = String(body.siteToken || "");
  const site = await getSiteByToken(siteToken);
  if (!site || !site.published) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }
  if (!site.rsvpOpen) {
    return NextResponse.json({ error: "RSVP is closed" }, { status: 400 });
  }

  if (body.action === "lookup") {
    const q = norm(String(body.name || ""));
    if (q.length < 3) {
      return NextResponse.json({ error: "Type at least 3 letters of your name" }, { status: 400 });
    }
    const guests = await ensureGuestRsvpTokens(site.workspaceId);
    const matches = guests
      .filter((g) => norm(g.name).includes(q) || q.includes(norm(g.name)))
      .slice(0, 6)
      .map((g) => ({
        name: g.name,
        rsvpToken: g.rsvpToken,
        rsvp: g.rsvp,
      }));
    return NextResponse.json({ matches });
  }

  if (body.action === "submit") {
    const guest = await getGuestByRsvpToken(String(body.rsvpToken || ""));
    if (!guest || guest.workspaceId !== site.workspaceId) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    const rsvp = String(body.rsvp || "");
    if (!RSVP.has(rsvp)) {
      return NextResponse.json({ error: "Pick yes, no, or maybe" }, { status: 400 });
    }
    const plusOnes = Math.max(0, Math.min(8, Number(body.plusOnes) || 0));
    if (site.requireAddress && !String(body.address || "").trim()) {
      return NextResponse.json({ error: "Please add a mailing address" }, { status: 400 });
    }
    const answers: Record<string, string> = {};
    if (body.answers && typeof body.answers === "object") {
      for (const q of site.rsvpQuestions || []) {
        answers[q.id] = String((body.answers as Record<string, string>)[q.id] || "").slice(0, 300);
      }
    }
    const updated = await updateGuest(guest.id, {
      rsvp,
      plusOnes,
      dietary: String(body.dietary || "").slice(0, 500) || undefined,
      meal: String(body.meal || "").slice(0, 80) || undefined,
      notes: String(body.notes || "").slice(0, 1000) || guest.notes,
      address: String(body.address || "").slice(0, 200) || undefined,
      city: String(body.city || "").slice(0, 80) || undefined,
      region: String(body.region || "").slice(0, 80) || undefined,
      postal: String(body.postal || "").slice(0, 20) || undefined,
      phone: String(body.phone || "").slice(0, 40) || undefined,
      answers,
    });

    if (body.forHousehold && guest.partyName) {
      const house = (await listGuests(site.workspaceId)).filter(
        (g) => g.id !== guest.id && g.partyName?.trim() === guest.partyName?.trim()
      );
      for (const other of house) {
        await updateGuest(other.id, { rsvp });
      }
    }

    const incoming = Array.isArray(body.eventRsvps) ? body.eventRsvps : [];
    const existing = await rsvpsForGuest(site.workspaceId, guest.id);
    const existingByEvent = new Map(existing.map((r) => [r.eventId, r]));
    for (const row of incoming) {
      const eventId = String(row.eventId || "");
      const status = String(row.status || "") as EventRsvpStatus;
      if (!eventId || !EVENT_RSVP.has(status) || status === "INVITED") continue;
      const event = await getEvent(eventId);
      if (!event || event.workspaceId !== site.workspaceId) continue;
      if (!eventVisibleToGuest(event, existingByEvent.get(eventId))) continue;
      await upsertEventRsvp({
        workspaceId: site.workspaceId,
        eventId,
        guestId: guest.id,
        status,
        meal: event.askMeal ? String(row.meal || "").slice(0, 80) : undefined,
      });
    }

    const events = await publicEventsForGuest(site.workspaceId, guest.id);
    return NextResponse.json({
      ok: true,
      guest: updated
        ? {
            name: updated.name,
            rsvp: updated.rsvp,
            plusOnes: updated.plusOnes,
            dietary: updated.dietary,
            meal: updated.meal,
          }
        : null,
      events,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

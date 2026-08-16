import { NextResponse } from "next/server";
import { getSiteByToken } from "@/lib/data/site-store";
import {
  ensureGuestRsvpTokens,
  getGuestByRsvpToken,
  updateGuest,
} from "@/lib/data/store";

const RSVP = new Set(["YES", "NO", "MAYBE"]);

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
  return NextResponse.json({
    guest: {
      name: guest.name,
      rsvp: guest.rsvp,
      plusOnes: guest.plusOnes,
      dietary: guest.dietary,
      meal: guest.meal,
      notes: guest.notes,
    },
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
    const updated = await updateGuest(guest.id, {
      rsvp,
      plusOnes,
      dietary: String(body.dietary || "").slice(0, 500) || undefined,
      meal: String(body.meal || "").slice(0, 80) || undefined,
      notes: String(body.notes || "").slice(0, 1000) || guest.notes,
    });
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
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

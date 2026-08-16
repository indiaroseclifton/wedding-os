import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, ensureRsvpTokens } from "@/lib/data/workspace";
import { getSite, publishSite, saveSite } from "@/lib/data/site-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [site, guests] = await Promise.all([
    getSite(workspace.id),
    ensureRsvpTokens(workspace.id),
  ]);
  return NextResponse.json({
    site,
    guests: guests.map((g) => ({
      id: g.id,
      name: g.name,
      rsvp: g.rsvp,
      rsvpToken: g.rsvpToken,
    })),
  });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const body = await request.json();
  if (body.action === "publish") {
    const site = await publishSite(workspace.id);
    return NextResponse.json({ site });
  }
  if (body.action === "unpublish") {
    const site = await saveSite(workspace.id, { published: false });
    return NextResponse.json({ site });
  }
  const site = await saveSite(workspace.id, {
    headline: body.headline,
    story: body.story,
    scheduleNote: body.scheduleNote,
    dressCode: body.dressCode,
    extra: body.extra,
    rsvpNote: body.rsvpNote,
    showTravel: Boolean(body.showTravel),
    showRegistry: Boolean(body.showRegistry),
    rsvpOpen: body.rsvpOpen !== false,
  });
  return NextResponse.json({ site });
}

import { NextResponse } from "next/server";
import { getSiteByToken } from "@/lib/data/site-store";
import { getWorkspaceMeta } from "@/lib/data/store";
import { getTravel } from "@/lib/data/travel-store";
import { getRegistry } from "@/lib/data/registry-store";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const site = await getSiteByToken(token);
  if (!site || !site.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const meta = await getWorkspaceMeta(site.workspaceId, DEMO_WORKSPACE.name);
  const travel = site.showTravel ? await getTravel(site.workspaceId) : null;
  const registry = site.showRegistry ? await getRegistry(site.workspaceId) : null;
  return NextResponse.json({
    site: {
      headline: site.headline,
      story: site.story,
      scheduleNote: site.scheduleNote,
      dressCode: site.dressCode,
      extra: site.extra,
      rsvpOpen: site.rsvpOpen,
      rsvpNote: site.rsvpNote,
      showTravel: site.showTravel,
      showRegistry: site.showRegistry,
    },
    wedding: {
      name: meta.name,
      coupleNames: meta.coupleNames,
      weddingDate: meta.weddingDate,
      location: meta.location,
    },
    travel: travel
      ? {
          airport: travel.airport,
          shuttle: travel.shuttle,
          parking: travel.parking,
          hotels: travel.hotels.map((h) => ({
            name: h.name,
            address: h.address,
            rate: h.rate,
            blockCode: h.blockCode,
            cutoff: h.cutoff,
            bookingUrl: h.bookingUrl,
          })),
        }
      : null,
    registry: registry
      ? registry.links.map((l) => ({ store: l.store, url: l.url }))
      : [],
  });
}

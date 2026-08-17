import { NextResponse } from "next/server";
import { getSiteByToken, rsvpIsOpen } from "@/lib/data/site-store";
import { getWorkspaceMeta, listGuests } from "@/lib/data/store";
import { getTravel } from "@/lib/data/travel-store";
import { getRegistry } from "@/lib/data/registry-store";
import { DEMO_WORKSPACE, getWorkspaceDecisions } from "@/lib/data/workspace";
import { siteModeFor } from "@/lib/shape";
import { normalizeVision, siteTemplateFor, visionHero } from "@/lib/vision";

function prettyDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

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
  const [decisions, guests] = await Promise.all([
    getWorkspaceDecisions(site.workspaceId),
    listGuests(site.workspaceId),
  ]);
  const vision = normalizeVision(decisions.find((d) => d.type === "STYLE_VIBE")?.payload);
  const lookName = site.template !== "letter" ? site.template : siteTemplateFor(vision.story);
  const announce = meta.siteMode === "announce" || siteModeFor(meta.shape) === "announce";
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
      dateLine: prettyDate(meta.weddingDate),
    },
    look: {
      coverUrl: visionHero(vision) || "",
      mode: announce ? "announce" : "invite",
      night: lookName === "midnight",
      seated: guests.some((g) => Boolean(g.tableLabel)),
      calendarHref: `/c/${site.siteToken}`,
      rsvpOpen: rsvpIsOpen(site) && !announce,
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

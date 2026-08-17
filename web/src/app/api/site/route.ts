import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  DEMO_WORKSPACE,
  ensureDemoWorkspace,
  ensureRsvpTokens,
  getWorkspaceDecisions,
} from "@/lib/data/workspace";
import { getWorkspaceMeta } from "@/lib/data/store";
import { getSite, publishSite, saveSite } from "@/lib/data/site-store";
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

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [site, guests, meta, decisions] = await Promise.all([
    getSite(workspace.id),
    ensureRsvpTokens(workspace.id),
    getWorkspaceMeta(workspace.id, DEMO_WORKSPACE.name),
    getWorkspaceDecisions(workspace.id),
  ]);
  const vision = normalizeVision(decisions.find((d) => d.type === "STYLE_VIBE")?.payload);
  const lookName = site.template !== "letter" ? site.template : siteTemplateFor(vision.story);
  const announce = meta.siteMode === "announce" || siteModeFor(meta.shape) === "announce";
  return NextResponse.json({
    site,
    guests: guests.map((g) => ({
      id: g.id,
      name: g.name,
      rsvp: g.rsvp,
      rsvpToken: g.rsvpToken,
    })),
    look: {
      names: meta.coupleNames || meta.name,
      date: prettyDate(meta.weddingDate),
      location: meta.location,
      coverUrl: visionHero(vision) || "",
      mode: announce ? "announce" : "invite",
      night: lookName === "midnight",
    },
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
    collectAddress: body.collectAddress !== false,
    requireAddress: Boolean(body.requireAddress),
    template: body.template === "garden" || body.template === "midnight" ? body.template : "letter",
    rsvpClose: typeof body.rsvpClose === "string" ? body.rsvpClose.slice(0, 12) : undefined,
    gate: typeof body.gate === "string" ? body.gate.slice(0, 80) : undefined,
    gallery: Array.isArray(body.gallery)
      ? body.gallery.map((u: unknown) => String(u).slice(0, 500)).filter(Boolean).slice(0, 12)
      : typeof body.galleryText === "string"
        ? String(body.galleryText)
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean)
            .slice(0, 12)
        : undefined,
    rsvpQuestions: Array.isArray(body.rsvpQuestions)
      ? body.rsvpQuestions
          .map((q: { id?: string; prompt?: string }) => ({
            id: String(q.id || "").slice(0, 40),
            prompt: String(q.prompt || "").slice(0, 160),
          }))
          .filter((q: { id: string; prompt: string }) => q.id && q.prompt)
      : undefined,
  });
  return NextResponse.json({ site });
}

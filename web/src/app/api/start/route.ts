import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { addGuest, ensureDemoWorkspace, updateWorkspaceMeta } from "@/lib/data/workspace";
import { createVendor } from "@/lib/data/vendors-store";
import { getSite, publishSite, saveSite } from "@/lib/data/site-store";
import { siteModeFor } from "@/lib/shape";
import { requiredString, ValidationError } from "@/lib/validation";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace, meta } = await ensureDemoWorkspace();

    if (body.action === "guests") {
      const names = String(body.names || "")
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean)
        .slice(0, 20);
      if (!names.length) return NextResponse.json({ error: "Add at least one name" }, { status: 400 });
      for (const line of names) {
        const [head, ...rest] = line.split(/\s+\+\s+/);
        const extras = rest.map((s) => s.trim()).filter(Boolean);
        await addGuest({
          workspaceId: workspace.id,
          name: head.trim(),
          rsvp: "INVITED",
          plusOnes: extras.length,
          plusOneNames: extras,
          partyName: head.includes(" ") ? `${head.trim().split(/\s+/).slice(-1)[0]} household` : undefined,
        });
      }
      return NextResponse.json({ ok: true, added: names.length });
    }

    if (body.action === "vendor") {
      const name = requiredString(body.name, "Vendor", 120);
      const category = requiredString(body.category, "Category", 40);
      await createVendor({
        workspaceId: workspace.id,
        name,
        category,
        status: "BOOKED",
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "publish") {
      const site = await getSite(workspace.id);
      const announce = siteModeFor(meta.shape) === "announce";
      await saveSite(workspace.id, {
        headline: site.headline || `${meta.coupleNames || meta.name} are getting married`,
        rsvpOpen: announce ? false : true,
      });
      const published = await publishSite(workspace.id);
      await updateWorkspaceMeta(workspace.id, { firstWalkDone: true, onboarded: true });
      return NextResponse.json({ ok: true, token: published.siteToken, announce });
    }

    if (body.action === "skip") {
      await updateWorkspaceMeta(workspace.id, { firstWalkDone: true, onboarded: true });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  ensureDemoWorkspace,
  loadWorkspaceMeta,
  updateWorkspaceMeta,
} from "@/lib/data/workspace";
import { optionalString, requiredString, ValidationError } from "@/lib/validation";
import { FAITHS, THEMES } from "@/lib/preferences";
import { syncFaithToPlanning } from "@/lib/data/sync-faith";
import { applyDiyBias } from "@/lib/data/path-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const meta = await loadWorkspaceMeta(workspace.id, workspace.name);
  return NextResponse.json({ meta, themes: THEMES, faiths: FAITHS });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    const faithPacks = Array.isArray(body.faithPacks)
      ? body.faithPacks.map((x: unknown) => String(x)).slice(0, 6)
      : undefined;
    const meta = await updateWorkspaceMeta(workspace.id, {
      name: body.name ? requiredString(body.name, "Wedding name", 120) : undefined,
      weddingDate: optionalString(body.weddingDate, 40),
      location: optionalString(body.location, 160),
      coupleNames: optionalString(body.coupleNames, 160),
      coverUrl: optionalString(body.coverUrl, 500),
      theme: optionalString(body.theme, 20) as never,
      glass:
        body.glass === "low" || body.glass === "mid" || body.glass === "high" ? body.glass : undefined,
      density:
        body.density === "roomy" || body.density === "regular" || body.density === "compact"
          ? body.density
          : undefined,
      typeScale:
        body.typeScale === "small" || body.typeScale === "regular" || body.typeScale === "large"
          ? body.typeScale
          : undefined,
      faith: optionalString(body.faith, 40) as never,
      faithPacks,
      ceremonyStyle: optionalString(body.ceremonyStyle, 20) as never,
      formality: optionalString(body.formality, 40),
      weekend: optionalString(body.weekend, 20),
      partnerA: optionalString(body.partnerA, 80),
      partnerB: optionalString(body.partnerB, 80),
      timezone: optionalString(body.timezone, 60),
      kidsWelcome: typeof body.kidsWelcome === "boolean" ? body.kidsWelcome : undefined,
      unplugged: typeof body.unplugged === "boolean" ? body.unplugged : undefined,
      guestSitePublic: typeof body.guestSitePublic === "boolean" ? body.guestSitePublic : undefined,
      onboarded: typeof body.onboarded === "boolean" ? body.onboarded : undefined,
      firstWalkDone: typeof body.firstWalkDone === "boolean" ? body.firstWalkDone : undefined,
      diyBias:
        body.diyBias === "hire" || body.diyBias === "diy" || body.diyBias === "mix"
          ? body.diyBias
          : undefined,
      defaultPlusOnes:
        typeof body.defaultPlusOnes === "number" ? Math.max(0, Math.min(4, body.defaultPlusOnes)) : undefined,
    });
    if (body.faith || faithPacks) {
      await syncFaithToPlanning(workspace.id, meta.faith, meta.faithPacks);
    }
    if (meta.diyBias) {
      await applyDiyBias(workspace.id, meta.diyBias);
    }
    return NextResponse.json({ meta });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

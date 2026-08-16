import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getWorkspaceMeta } from "@/lib/data/store";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";
import { PLACE_QUERY, placesConfigured, searchPlaces } from "@/lib/integrations/google-places";

export async function GET(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  if (!placesConfigured()) {
    return NextResponse.json({ configured: false, places: [] });
  }
  const { workspace } = await ensureDemoWorkspace();
  const meta = await getWorkspaceMeta(workspace.id, DEMO_WORKSPACE.name);
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "";
  const q = url.searchParams.get("q")?.trim() || "";
  const near = url.searchParams.get("near")?.trim() || meta.location || "Atlanta";
  const query = q || PLACE_QUERY[category] || category || "wedding venue";
  try {
    const places = await searchPlaces(query, near);
    return NextResponse.json({ configured: true, near, query, places });
  } catch (e) {
    return NextResponse.json(
      { configured: true, error: e instanceof Error ? e.message : "Search failed", places: [] },
      { status: 502 }
    );
  }
}

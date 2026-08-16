import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { createVendor, listVendors } from "@/lib/data/vendors-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const name = requiredString(body.name, "Name", 200);
    const { workspace } = await ensureDemoWorkspace();
    const existing = (await listVendors(workspace.id)).find(
      (v) => v.notes?.includes(String(body.placeId || "")) && body.placeId
    );
    if (existing) return NextResponse.json({ vendor: existing, already: true });
    const bits = [
      body.address ? `Address: ${body.address}` : "",
      body.placeId ? `Google place: ${body.placeId}` : "",
      body.mapsUrl ? `Maps: ${body.mapsUrl}` : "",
    ].filter(Boolean);
    const vendor = await createVendor({
      workspaceId: workspace.id,
      name,
      category: requiredString(body.category || "Other", "Category", 80),
      status: "RESEARCHING",
      phone: optionalString(body.phone, 40),
      website: optionalString(body.website || body.mapsUrl, 500),
      notes: bits.join("\n"),
    });
    return NextResponse.json({ vendor });
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not add vendor" }, { status: 500 });
  }
}

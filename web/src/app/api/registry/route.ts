import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addGift,
  addRegistryLink,
  deleteGift,
  deleteRegistryLink,
  getRegistry,
  patchGift,
} from "@/lib/data/registry-store";
import { optionalString, requiredString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const registry = await getRegistry(workspace.id);
  return NextResponse.json({ registry });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "add_link") {
      const registry = await addRegistryLink(workspace.id, {
        store: requiredString(body.store, "Store", 80),
        url: requiredString(body.url, "URL", 400),
        notes: optionalString(body.notes, 200),
      });
      return NextResponse.json({ registry });
    }
    if (body.action === "delete_link") {
      const registry = await deleteRegistryLink(workspace.id, String(body.id));
      return NextResponse.json({ registry });
    }
    if (body.action === "add_gift") {
      const registry = await addGift(workspace.id, {
        from: requiredString(body.from, "From", 120),
        description: requiredString(body.description, "Gift", 200),
      });
      return NextResponse.json({ registry });
    }
    if (body.action === "toggle_gift") {
      const registry = await patchGift(workspace.id, String(body.id), {
        received: !!body.received,
      });
      return NextResponse.json({ registry });
    }
    if (body.action === "delete_gift") {
      const registry = await deleteGift(workspace.id, String(body.id));
      return NextResponse.json({ registry });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

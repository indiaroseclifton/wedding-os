import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addBox,
  addBoxItem,
  deleteBox,
  getInventory,
  patchBox,
  toggleBoxItem,
  type InventoryFate,
} from "@/lib/data/inventory-store";
import { requiredString, ValidationError } from "@/lib/validation";

const FATES: InventoryFate[] = ["unset", "keep", "return", "sell", "donate", "reuse"];

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const inventory = await getInventory(workspace.id);
  return NextResponse.json({ inventory });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "add") {
      const inventory = await addBox(workspace.id, {
        name: requiredString(body.name, "Name", 80),
        zone: body.zone,
        takeTo: body.takeTo,
        owner: body.owner,
        setupBy: body.setupBy,
      });
      return NextResponse.json({ inventory });
    }
    if (body.action === "patch") {
      const inventory = await patchBox(workspace.id, String(body.id), {
        name: body.name,
        zone: body.zone,
        takeTo: body.takeTo,
        owner: body.owner,
        setupBy: body.setupBy,
        fate: FATES.includes(body.fate) ? body.fate : undefined,
      });
      return NextResponse.json({ inventory });
    }
    if (body.action === "delete") {
      const inventory = await deleteBox(workspace.id, String(body.id));
      return NextResponse.json({ inventory });
    }
    if (body.action === "add_item") {
      const inventory = await addBoxItem(
        workspace.id,
        String(body.id),
        requiredString(body.label, "Item", 120)
      );
      return NextResponse.json({ inventory });
    }
    if (body.action === "toggle_item") {
      const inventory = await toggleBoxItem(workspace.id, String(body.id), String(body.itemId));
      return NextResponse.json({ inventory });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

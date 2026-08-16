import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addGift,
  addRegistryItem,
  addRegistryLink,
  deleteGift,
  deleteRegistryItem,
  deleteRegistryLink,
  getRegistry,
  patchGift,
  patchRegistryItem,
} from "@/lib/data/registry-store";
import { importGiftsAsThanks } from "@/lib/data/thanks-store";
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
    if (body.action === "add_item") {
      const registry = await addRegistryItem(workspace.id, {
        name: requiredString(body.name, "Item", 160),
        url: optionalString(body.url, 400),
        qty: body.qty,
        price: body.price == null ? undefined : Number(body.price) || 0,
      });
      return NextResponse.json({ registry });
    }
    if (body.action === "patch_item") {
      const registry = await patchRegistryItem(workspace.id, String(body.id), {
        status: body.status,
        claimedBy: body.claimedBy,
        qty: body.qty,
        name: body.name,
      });
      return NextResponse.json({ registry });
    }
    if (body.action === "delete_item") {
      const registry = await deleteRegistryItem(workspace.id, String(body.id));
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
    if (body.action === "to_thanks") {
      const registry = await getRegistry(workspace.id);
      const gifts = [
        ...registry.gifts.filter((g) => g.received).map((g) => ({ from: g.from, description: g.description })),
        ...registry.items
          .filter((i) => i.status === "PURCHASED" && i.claimedBy)
          .map((i) => ({ from: i.claimedBy || "Someone", description: i.name })),
      ];
      await importGiftsAsThanks(workspace.id, gifts);
      return NextResponse.json({ registry, imported: gifts.length });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

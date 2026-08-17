import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getRegistry } from "@/lib/data/registry-store";
import {
  addThankYou,
  deleteThankYou,
  getThanks,
  importGiftsAsThanks,
  patchThankYou,
  seedThanksFromGuests,
} from "@/lib/data/thanks-store";
import { getWorkspaceGuests } from "@/lib/data/workspace";
import { optionalString, requiredString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const thanks = await getThanks(workspace.id);
  return NextResponse.json({ thanks });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "add") {
      const thanks = await addThankYou(workspace.id, {
        guestName: requiredString(body.guestName, "Name", 120),
        gift: optionalString(body.gift, 200),
        notes: optionalString(body.notes, 400),
      });
      return NextResponse.json({ thanks });
    }
    if (body.action === "toggle") {
      const thanks = await patchThankYou(workspace.id, String(body.id), {
        status: body.status === "SENT" ? "SENT" : "TODO",
        sentDate: body.status === "SENT" ? new Date().toISOString().slice(0, 10) : undefined,
      });
      return NextResponse.json({ thanks });
    }
    if (body.action === "delete") {
      const thanks = await deleteThankYou(workspace.id, String(body.id));
      return NextResponse.json({ thanks });
    }
    if (body.action === "import_gifts") {
      const registry = await getRegistry(workspace.id);
      const thanks = await importGiftsAsThanks(
        workspace.id,
        registry.gifts.map((g) => ({ from: g.from, description: g.description }))
      );
      return NextResponse.json({ thanks });
    }
    if (body.action === "seed_guests") {
      const guests = await getWorkspaceGuests(workspace.id);
      const thanks = await seedThanksFromGuests(workspace.id, guests);
      return NextResponse.json({ thanks });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

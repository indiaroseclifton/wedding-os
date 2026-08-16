import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { addHotel, deleteHotel, getTravel, saveTravel } from "@/lib/data/travel-store";
import { optionalString, requiredString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const travel = await getTravel(workspace.id);
  return NextResponse.json({ travel });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "meta") {
      const travel = await saveTravel(workspace.id, {
        airport: optionalString(body.airport, 300),
        shuttle: optionalString(body.shuttle, 400),
        parking: optionalString(body.parking, 400),
        honeymoon: optionalString(body.honeymoon, 400),
        notes: optionalString(body.notes, 2000),
      });
      return NextResponse.json({ travel });
    }
    if (body.action === "add_hotel") {
      const travel = await addHotel(workspace.id, {
        name: requiredString(body.name, "Hotel name", 160),
        address: optionalString(body.address, 200),
        rate: optionalString(body.rate, 80),
        blockCode: optionalString(body.blockCode, 80),
        cutoff: optionalString(body.cutoff, 40),
        rooms: body.rooms ? Number(body.rooms) || undefined : undefined,
        bookingUrl: optionalString(body.bookingUrl, 400),
        kind: body.kind === "guaranteed" ? "guaranteed" : body.kind === "other" ? "other" : "courtesy",
        notes: optionalString(body.notes, 400),
      });
      return NextResponse.json({ travel });
    }
    if (body.action === "delete_hotel") {
      const travel = await deleteHotel(workspace.id, String(body.id));
      return NextResponse.json({ travel });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

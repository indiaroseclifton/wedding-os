import { NextResponse } from "next/server";
import { requireCoupleApi, requireSession } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addScheduleSlot,
  addUpdate,
  getDayOf,
  patchCheckIn,
  removeScheduleSlot,
  saveDayOf,
} from "@/lib/data/dayof-store";

export async function GET() {
  const access = await requireSession();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const dayOf = await getDayOf(workspace.id);
  return NextResponse.json({ dayOf });
}

export async function POST(request: Request) {
  const access = await requireSession();
  if (!access.ok) return access.response;
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();

  if (body.action === "checkin") {
    const dayOf = await patchCheckIn(workspace.id, body.id, {
      status: body.status,
      note: body.note,
    });
    return NextResponse.json({ dayOf });
  }
  if (body.action === "update") {
    const dayOf = await addUpdate(workspace.id, String(body.body || ""));
    return NextResponse.json({ dayOf });
  }
  if (body.action === "meta") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const dayOf = await saveDayOf(workspace.id, {
      weatherNote: body.weatherNote,
      emergencyContact: body.emergencyContact,
    });
    return NextResponse.json({ dayOf });
  }
  if (body.action === "schedule_add") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const dayOf = await addScheduleSlot(workspace.id, {
      time: String(body.time || "12:00"),
      title: String(body.title || "Moment"),
      owner: body.owner ? String(body.owner) : undefined,
    });
    return NextResponse.json({ dayOf });
  }
  if (body.action === "schedule_remove") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const dayOf = await removeScheduleSlot(workspace.id, String(body.id));
    return NextResponse.json({ dayOf });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

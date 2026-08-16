import { NextResponse } from "next/server";
import { requireCoupleApi, requireSession } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addScheduleSlot,
  addSlotComment,
  addUpdate,
  copyMainToRain,
  getDayOf,
  patchCheckIn,
  patchScheduleSlot,
  removeScheduleSlot,
  resetDefaultSchedule,
  saveDayOf,
  shareRunOfShow,
} from "@/lib/data/dayof-store";
import { AUDIENCES, type Audience } from "@/lib/data/run-of-show";

function parseAudiences(raw: unknown): Audience[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.filter((a): a is Audience => AUDIENCES.includes(a as Audience));
}

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
      endTime: body.endTime ? String(body.endTime) : undefined,
      title: String(body.title || "Moment"),
      guestTitle: body.guestTitle ? String(body.guestTitle) : undefined,
      location: body.location ? String(body.location) : undefined,
      lead: body.lead ? String(body.lead) : undefined,
      assignee: body.assignee ? String(body.assignee) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      audiences: parseAudiences(body.audiences) || ["couple", "party", "vendor", "guests"],
    });
    return NextResponse.json({ dayOf });
  }
  if (body.action === "schedule_patch") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const dayOf = await patchScheduleSlot(workspace.id, String(body.id), {
      time: body.time,
      endTime: body.endTime,
      title: body.title,
      guestTitle: body.guestTitle,
      location: body.location,
      lead: body.lead,
      assignee: body.assignee,
      notes: body.notes,
      audiences: parseAudiences(body.audiences),
    });
    return NextResponse.json({ dayOf });
  }
  if (body.action === "schedule_remove") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const dayOf = await removeScheduleSlot(workspace.id, String(body.id));
    return NextResponse.json({ dayOf });
  }
  if (body.action === "schedule_share") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const dayOf = await shareRunOfShow(workspace.id);
    return NextResponse.json({
      dayOf,
      sharePath: dayOf.shareToken ? `/ros/${dayOf.shareToken}` : null,
    });
  }
  if (body.action === "schedule_reset") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const dayOf = await resetDefaultSchedule(workspace.id);
    return NextResponse.json({ dayOf });
  }
  if (body.action === "rain_copy") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const dayOf = await copyMainToRain(workspace.id);
    return NextResponse.json({ dayOf });
  }
  if (body.action === "plan") {
    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;
    const dayOf = await saveDayOf(workspace.id, {
      activePlan: body.plan === "rain" ? "rain" : "main",
    });
    return NextResponse.json({ dayOf });
  }
  if (body.action === "comment") {
    const dayOf = await addSlotComment(
      workspace.id,
      String(body.slotId),
      String(body.author || "Couple"),
      String(body.body || "")
    );
    return NextResponse.json({ dayOf });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

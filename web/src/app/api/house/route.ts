import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, updateWorkspaceMeta } from "@/lib/data/workspace";
import { createHouseEvent, seedHouseFromWorkspace, setActiveHouse } from "@/lib/data/house-store";
import { eventTitle, isEventKind } from "@/lib/house";

function opt(v: unknown, max: number) {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const house = await seedHouseFromWorkspace(workspace.id, workspace.name);
  return NextResponse.json(house);
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    await seedHouseFromWorkspace(workspace.id, workspace.name);
    const kind = isEventKind(body.kind) ? body.kind : "wedding";
    const honoreeA = opt(body.honoreeA || body.partnerA, 80);
    const honoreeB = opt(body.honoreeB || body.partnerB, 80);
    const date = opt(body.date || body.weddingDate, 40);
    const location = opt(body.location, 160);
    const event = await createHouseEvent({
      kind,
      honoreeA,
      honoreeB,
      date,
      location,
      shape: opt(body.shape, 20),
      enterHow: opt(body.enterHow, 20),
      guests: opt(body.guests, 20),
      cap: opt(body.cap, 20),
      thoughts: opt(body.thoughts, 2000),
      title: opt(body.title, 160),
    });
    const names = [honoreeA, honoreeB].filter(Boolean).join(" & ");
    await updateWorkspaceMeta(workspace.id, {
      name: event.title,
      coupleNames: names || undefined,
      partnerA: honoreeA,
      partnerB: honoreeB,
      weddingDate: date,
      location,
      onboarded: true,
      firstWalkDone: true,
    });
    const house = await seedHouseFromWorkspace(workspace.id, workspace.name);
    return NextResponse.json({ event, ...house });
  } catch {
    return NextResponse.json({ error: "Failed to add event" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const id = typeof body.activeId === "string" ? body.activeId : "";
    if (!id) return NextResponse.json({ error: "activeId required" }, { status: 400 });
    const { workspace } = await ensureDemoWorkspace();
    const event = await setActiveHouse(id);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const names = [event.honoreeA, event.honoreeB].filter(Boolean).join(" & ");
    await updateWorkspaceMeta(workspace.id, {
      name: event.title || eventTitle(event),
      coupleNames: names || undefined,
      partnerA: event.honoreeA,
      partnerB: event.honoreeB,
      weddingDate: event.date,
      location: event.location,
    });
    const house = await seedHouseFromWorkspace(workspace.id, workspace.name);
    return NextResponse.json({ event, ...house });
  } catch {
    return NextResponse.json({ error: "Failed to switch" }, { status: 500 });
  }
}

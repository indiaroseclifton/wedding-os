import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { seedHouseFromWorkspace } from "@/lib/data/house-store";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addPerson,
  getControl,
  patchYou,
  removePerson,
  setConnections,
  setControlPassword,
  setControlPlan,
} from "@/lib/data/control-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const house = await seedHouseFromWorkspace(workspace.id, workspace.name);
  const control = await getControl();
  return NextResponse.json({ ...control, events: house.events, activeId: house.activeId });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "save";

    if (action === "password") {
      const next = typeof body.next === "string" ? body.next : "";
      const current = typeof body.current === "string" ? body.current : undefined;
      const result = await setControlPassword(next, current);
      if (!result.ok) return NextResponse.json(result, { status: 400 });
      return NextResponse.json({ ok: true, ...(await getControl()) });
    }

    if (action === "plan") {
      const plan = body.plan === "better" || body.plan === "best" ? body.plan : "good";
      await setControlPlan(plan);
    } else if (action === "connections") {
      await setConnections(body.connections || {});
    } else if (action === "add-person") {
      const result = await addPerson(body);
      if (!result.ok) return NextResponse.json(result, { status: 400 });
    } else if (action === "remove-person") {
      if (typeof body.id === "string") await removePerson(body.id);
    } else {
      await patchYou(body.you || body);
    }

    const { workspace } = await ensureDemoWorkspace();
    const house = await seedHouseFromWorkspace(workspace.id, workspace.name);
    const control = await getControl();
    return NextResponse.json({ ok: true, ...control, events: house.events, activeId: house.activeId });
  } catch {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}

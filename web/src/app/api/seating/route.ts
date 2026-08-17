import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  getWorkspaceTables,
  seatGuests,
  promotePlusOnes,
} from "@/lib/data/workspace";
import { autoSeat, constraintViolations, inSeatingPool } from "@/lib/data/seating";
import {
  addConstraint,
  freezeSeating,
  getSeatingPlan,
  removeConstraint,
  setSeatMode,
} from "@/lib/data/seating-plan-store";
import { applyFreezeAssignments } from "@/lib/data/store";

function pack(tables: Awaited<ReturnType<typeof getWorkspaceTables>>, guests: Awaited<ReturnType<typeof getWorkspaceGuests>>) {
  return {
    tables,
    guests: guests.filter((g) => g.rsvp !== "NO"),
  };
}

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [tables, guests, plan] = await Promise.all([
    getWorkspaceTables(workspace.id),
    getWorkspaceGuests(workspace.id),
    getSeatingPlan(workspace.id),
  ]);
  const active = guests.filter((g) => g.rsvp !== "NO");
  return NextResponse.json({
    ...pack(tables, guests),
    plan,
    violations: constraintViolations(active, plan.constraints),
  });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const body = await request.json();

  if (body.action === "assign") {
    const ids = Array.isArray(body.guestIds)
      ? body.guestIds.map(String)
      : body.guestId
        ? [String(body.guestId)]
        : [];
    if (!ids.length) return NextResponse.json({ error: "No guests" }, { status: 400 });
    const tableName = body.tableName == null || body.tableName === "" ? null : String(body.tableName);
    await seatGuests(
      ids,
      tableName,
      typeof body.seatIndex === "number" ? body.seatIndex : undefined
    );
    const [tables, guests, plan] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
      getSeatingPlan(workspace.id),
    ]);
    const active = guests.filter((g) => g.rsvp !== "NO");
    return NextResponse.json({
      ok: true,
      ...pack(tables, guests),
      plan,
      violations: constraintViolations(active, plan.constraints),
    });
  }

  if (body.action === "auto") {
    const [tables, guests, plan] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
      getSeatingPlan(workspace.id),
    ]);
    const mode = plan.seatMode === "plates" ? "plates" : "holding";
    const pool = guests.filter((g) => inSeatingPool(g, mode));
    const result = autoSeat(tables, pool, plan.constraints);
    const byTable = new Map<string, { ids: string[]; firstSeat?: number }>();
    for (const row of result) {
      const list = byTable.get(row.table) || { ids: [] };
      list.ids.push(row.id);
      if (list.firstSeat == null) list.firstSeat = row.seatIndex;
      byTable.set(row.table, list);
    }
    for (const [table, packIds] of byTable) {
      await seatGuests(packIds.ids, table, packIds.firstSeat);
    }
    const [nextTables, nextGuests] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
    ]);
    const active = nextGuests.filter((g) => g.rsvp !== "NO");
    return NextResponse.json({
      ok: true,
      seated: result.length,
      ...pack(nextTables, nextGuests),
      plan,
      violations: constraintViolations(active, plan.constraints),
    });
  }

  if (body.action === "constraint") {
    if (body.remove) {
      const plan = await removeConstraint(workspace.id, String(body.remove));
      const [tables, guests] = await Promise.all([
        getWorkspaceTables(workspace.id),
        getWorkspaceGuests(workspace.id),
      ]);
      return NextResponse.json({
        ok: true,
        ...pack(tables, guests),
        plan,
        violations: constraintViolations(guests.filter((g) => g.rsvp !== "NO"), plan.constraints),
      });
    }
    const kind = body.kind === "must" || body.kind === "lock" ? body.kind : "never";
    const plan = await addConstraint(workspace.id, {
      kind,
      a: String(body.a || ""),
      b: body.b ? String(body.b) : undefined,
      tableName: body.tableName ? String(body.tableName) : undefined,
      note: typeof body.note === "string" ? body.note.slice(0, 120) : undefined,
    });
    const [tables, guests] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
    ]);
    return NextResponse.json({
      ok: true,
      ...pack(tables, guests),
      plan,
      violations: constraintViolations(guests.filter((g) => g.rsvp !== "NO"), plan.constraints),
    });
  }

  if (body.action === "freeze") {
    const guests = await getWorkspaceGuests(workspace.id);
    const freeze = await freezeSeating(
      workspace.id,
      guests.filter((g) => g.rsvp !== "NO"),
      typeof body.label === "string" ? body.label : undefined
    );
    const plan = await getSeatingPlan(workspace.id);
    const [tables] = await Promise.all([getWorkspaceTables(workspace.id)]);
    return NextResponse.json({
      ok: true,
      freeze,
      plan,
      ...pack(tables, guests),
    });
  }

  if (body.action === "mode") {
    const plan = await setSeatMode(workspace.id, body.seatMode === "plates" ? "plates" : "holding");
    const [tables, guests] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
    ]);
    return NextResponse.json({
      ok: true,
      ...pack(tables, guests),
      plan,
      violations: constraintViolations(guests.filter((g) => g.rsvp !== "NO"), plan.constraints),
    });
  }

  if (body.action === "restore") {
    const plan = await getSeatingPlan(workspace.id);
    const freeze = plan.freezes.find((f) => f.id === String(body.freezeId || plan.freezes[0]?.id));
    if (!freeze) return NextResponse.json({ error: "No freeze to restore" }, { status: 400 });
    await applyFreezeAssignments(workspace.id, freeze.assignments);
    const [tables, guests] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
    ]);
    return NextResponse.json({
      ok: true,
      restored: freeze.label,
      ...pack(tables, guests),
      plan,
      violations: constraintViolations(guests.filter((g) => g.rsvp !== "NO"), plan.constraints),
    });
  }

  if (body.action === "expand") {
    await promotePlusOnes(workspace.id);
    const [tables, guests, plan] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
      getSeatingPlan(workspace.id),
    ]);
    return NextResponse.json({
      ok: true,
      ...pack(tables, guests),
      plan,
      violations: constraintViolations(
        guests.filter((g) => g.rsvp !== "NO"),
        plan.constraints
      ),
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

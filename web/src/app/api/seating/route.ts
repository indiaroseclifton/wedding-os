import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  getWorkspaceTables,
  seatGuests,
} from "@/lib/data/workspace";
import { autoSeat } from "@/lib/data/seating";

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
    const [tables, guests] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
    ]);
    return NextResponse.json({ ok: true, tables, guests });
  }

  if (body.action === "auto") {
    const [tables, guests] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
    ]);
    const plan = autoSeat(tables, guests);
    const byTable = new Map<string, string[]>();
    for (const row of plan) {
      const list = byTable.get(row.table) || [];
      list.push(row.id);
      byTable.set(row.table, list);
    }
    for (const [table, ids] of byTable) {
      await seatGuests(ids, table);
    }
    const [nextTables, nextGuests] = await Promise.all([
      getWorkspaceTables(workspace.id),
      getWorkspaceGuests(workspace.id),
    ]);
    return NextResponse.json({
      ok: true,
      seated: plan.length,
      tables: nextTables,
      guests: nextGuests,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

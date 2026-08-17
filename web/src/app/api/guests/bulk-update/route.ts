import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { patchGuest, removeGuest } from "@/lib/data/workspace";

const RSVP = new Set(["UNKNOWN", "INVITED", "YES", "NO", "MAYBE"]);

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;

  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.filter((id: unknown) => typeof id === "string" && id)
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "Select at least one guest" }, { status: 400 });
    }
    if (ids.length > 500) {
      return NextResponse.json({ error: "Too many guests selected" }, { status: 400 });
    }

    const action = body.action as string;

    if (action === "rsvp") {
      const rsvp = String(body.rsvp || "").toUpperCase();
      if (!RSVP.has(rsvp)) {
        return NextResponse.json({ error: "Invalid RSVP" }, { status: 400 });
      }
      let updated = 0;
      for (const id of ids) {
        const g = await patchGuest(id, { rsvp, rsvpAt: new Date().toISOString() });
        if (g) updated += 1;
      }
      return NextResponse.json({ ok: true, updated, action: "rsvp" });
    }

    if (action === "table") {
      const tableLabel =
        body.tableLabel === null || body.tableLabel === ""
          ? undefined
          : String(body.tableLabel).trim();
      let updated = 0;
      for (const id of ids) {
        const g = await patchGuest(id, { tableLabel });
        if (g) updated += 1;
      }
      return NextResponse.json({ ok: true, updated, action: "table" });
    }

    if (action === "side") {
      const side = String(body.side || "OTHER");
      let updated = 0;
      for (const id of ids) {
        const g = await patchGuest(id, { side });
        if (g) updated += 1;
      }
      return NextResponse.json({ ok: true, updated, action: "side" });
    }

    if (action === "list") {
      const listTier = body.listTier === "B" ? "B" : "A";
      let updated = 0;
      for (const id of ids) {
        const g = await patchGuest(id, { listTier });
        if (g) updated += 1;
      }
      return NextResponse.json({ ok: true, updated, action: "list" });
    }

    if (action === "delete") {
      let deleted = 0;
      for (const id of ids) {
        const ok = await removeGuest(id);
        if (ok) deleted += 1;
      }
      return NextResponse.json({ ok: true, deleted, action: "delete" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { bulkAddGuests, ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { optionalString, requiredString, ValidationError } from "@/lib/validation";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const rows = Array.isArray(body.guests) ? body.guests : [];
    if (!rows.length) return NextResponse.json({ error: "No contacts" }, { status: 400 });
    const { workspace } = await ensureDemoWorkspace();
    const existing = await getWorkspaceGuests(workspace.id);
    const have = new Set(
      existing.map((g) => `${(g.name || "").toLowerCase()}|${(g.email || "").toLowerCase()}`)
    );
    const inputs = [];
    for (const raw of rows.slice(0, 200)) {
      const name = requiredString(raw.name || raw.fullName, "Name", 200);
      const email = optionalString(raw.email, 200);
      const key = `${name.toLowerCase()}|${(email || "").toLowerCase()}`;
      if (have.has(key)) continue;
      have.add(key);
      inputs.push({
        workspaceId: workspace.id,
        name,
        email,
        phone: optionalString(raw.phone || raw.tel, 40),
        address: optionalString(raw.address, 200),
        rsvp: "UNKNOWN",
        plusOnes: 0,
        side: "OTHER",
      });
    }
    const created = inputs.length ? await bulkAddGuests(inputs) : [];
    return NextResponse.json({ added: created.length, skipped: rows.length - created.length });
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

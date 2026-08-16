import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { bulkAddGuests, ensureDemoWorkspace } from "@/lib/data/workspace";

const RSVP = new Set(["UNKNOWN", "INVITED", "YES", "NO", "MAYBE"]);

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const list = Array.isArray(body.guests) ? body.guests : [];
    if (!list.length) {
      return NextResponse.json({ error: "No guests" }, { status: 400 });
    }
    const { workspace } = await ensureDemoWorkspace();
    const created = await bulkAddGuests(
      list
        .filter((g: { name?: string }) => g?.name)
        .map((g: {
          name: string;
          email?: string;
          side?: string;
          rsvp?: string;
          plusOnes?: number;
          dietary?: string;
          notes?: string;
          address?: string;
          city?: string;
          region?: string;
          postal?: string;
          phone?: string;
          partyName?: string;
        }) => ({
          workspaceId: workspace.id,
          name: String(g.name).trim(),
          email: g.email,
          side: g.side || "OTHER",
          rsvp: RSVP.has(String(g.rsvp || "").toUpperCase())
            ? String(g.rsvp).toUpperCase()
            : "UNKNOWN",
          plusOnes: Math.max(0, Number(g.plusOnes) || 0),
          dietary: g.dietary,
          notes: g.notes,
          address: g.address,
          city: g.city,
          region: g.region,
          postal: g.postal,
          phone: g.phone,
          partyName: g.partyName,
        }))
    );
    return NextResponse.json({ count: created.length, guests: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

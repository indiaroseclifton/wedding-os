import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { bulkAddGuests, ensureDemoWorkspace } from "@/lib/data/workspace";
import { normalizeListTier } from "@/lib/data/guest-mail";
import { parsePlusOneNames, withPlusOnes } from "@/lib/households";

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
          meal?: string;
          listTier?: string;
          plusOneNames?: string;
        }) => {
          const extras = withPlusOnes(
            Math.max(0, Number(g.plusOnes) || 0),
            parsePlusOneNames(g.plusOneNames)
          );
          return {
          workspaceId: workspace.id,
          name: String(g.name).trim(),
          email: g.email,
          side: g.side || "OTHER",
          rsvp: RSVP.has(String(g.rsvp || "").toUpperCase())
            ? String(g.rsvp).toUpperCase()
            : "UNKNOWN",
          plusOnes: extras.plusOnes,
          plusOneNames: extras.plusOneNames,
          dietary: g.dietary,
          meal: g.meal,
          notes: g.notes,
          address: g.address,
          city: g.city,
          region: g.region,
          postal: g.postal,
          phone: g.phone,
          partyName: g.partyName,
          listTier: normalizeListTier(g.listTier),
          rsvpAt: ["YES", "NO", "MAYBE"].includes(
            RSVP.has(String(g.rsvp || "").toUpperCase()) ? String(g.rsvp).toUpperCase() : ""
          )
            ? new Date().toISOString()
            : undefined,
        };
        })
    );
    return NextResponse.json({ count: created.length, guests: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

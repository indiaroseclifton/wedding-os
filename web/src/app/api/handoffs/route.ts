import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  loadWorkspaceMeta,
} from "@/lib/data/workspace";
import {
  createPackage,
  listPackages,
  updatePackage,
  getPackage,
  type HandoffTemplate,
} from "@/lib/data/handoffs-store";
import { getMusic } from "@/lib/data/music-store";
import { dietarySections } from "@/lib/data/dietary";
import { listVendors } from "@/lib/data/vendors-store";
import { getTravel } from "@/lib/data/travel-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

const TEMPLATES = new Set([
  "DAY_OF",
  "DJ",
  "PHOTOGRAPHER",
  "CATERING",
  "FLORIST",
  "PLANNER",
  "HMU",
  "CAKE",
  "TRANSPORT",
  "VENUE",
]);

function vendorListText(
  vendors: Awaited<ReturnType<typeof listVendors>>
) {
  return vendors
    .map((v) => `${v.category}: ${v.name}${v.status ? ` (${v.status})` : ""}`)
    .join("\n");
}

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const packages = await listPackages(workspace.id);
  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const template = body.template as string;
    if (!TEMPLATES.has(template)) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }
    const title = requiredString(body.title, "Title", 200);
    const { workspace } = await ensureDemoWorkspace();
    const meta = await loadWorkspaceMeta(workspace.id, workspace.name);
    const dateLine = [meta.weddingDate, meta.location].filter(Boolean).join(" · ");

    let prefill: Record<string, string> = {};
    if (dateLine) prefill.date_locations = dateLine;

    if (template === "CATERING" && body.prefillFromGuests !== false) {
      const guests = await getWorkspaceGuests(workspace.id);
      Object.assign(prefill, dietarySections(guests));
    }
    if (template === "CAKE") {
      const guests = await getWorkspaceGuests(workspace.id);
      prefill.headcount = dietarySections(guests).headcount;
    }
    if (template === "PLANNER" || template === "DAY_OF" || template === "VENUE") {
      const vendors = await listVendors(workspace.id);
      prefill.vendor_list = vendorListText(vendors);
    }
    if (template === "TRANSPORT") {
      const travel = await getTravel(workspace.id);
      prefill.hotel_addresses = travel.hotels
        .map((h) => `${h.name}${h.address ? ` — ${h.address}` : ""}`)
        .join("\n");
      prefill.pickup_plan = [travel.airport, travel.shuttle].filter(Boolean).join("\n");
    }

    const pkg = await createPackage({
      workspaceId: workspace.id,
      template: template as HandoffTemplate,
      title,
      recipientName: optionalString(body.recipientName, 120),
      recipientEmail: optionalString(body.recipientEmail, 200),
      sections: prefill,
    });

    if (template === "DJ" && body.prefillFromMusic !== false) {
      const music = await getMusic(workspace.id);
      await updatePackage(pkg.id, {
        sections: {
          ...pkg.sections,
          must_play: (music.mustPlay || []).join("\n"),
          do_not_play: (music.doNotPlay || []).join("\n"),
          tone_notes: music.notes || "",
          music_moments: (music.moments || [])
            .map((m) => (m.song ? `${m.label}: ${m.song}` : m.label))
            .join("\n"),
        },
      });
      const refreshed = await getPackage(pkg.id);
      return NextResponse.json({ package: refreshed || pkg });
    }

    return NextResponse.json({ package: pkg });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}

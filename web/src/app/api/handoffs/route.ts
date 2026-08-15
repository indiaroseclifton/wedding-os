import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
} from "@/lib/data/workspace";
import {
  createPackage,
  listPackages,
  updatePackage,
  getPackage,
  type HandoffTemplate,
} from "@/lib/data/handoffs-store";
import { getMusic } from "@/lib/data/music-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

const TEMPLATES = new Set(["DAY_OF", "DJ", "PHOTOGRAPHER", "CATERING"]);

function dietarySections(guests: Awaited<ReturnType<typeof getWorkspaceGuests>>) {
  const attending = guests.filter((g) => g.rsvp !== "NO");
  const headcount = attending.reduce((s, g) => s + 1 + (g.plusOnes || 0), 0);
  const withDiet = attending.filter((g) => g.dietary?.trim());
  const counts = new Map<string, number>();
  for (const g of withDiet) {
    const key = g.dietary!.trim().toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1 + (g.plusOnes || 0));
  }
  const summary = Array.from(counts.entries())
    .map(([label, count]) => `${count}× ${label}`)
    .join("\n");
  const detail = withDiet
    .map((g) => `${g.name}: ${g.dietary}${g.tableLabel ? ` (${g.tableLabel})` : ""}`)
    .join("\n");
  return {
    headcount: String(headcount),
    dietary_summary: summary || "No dietary notes recorded",
    dietary_detail: detail || "—",
  };
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

    let prefill: Record<string, string> | undefined;
    if (template === "CATERING" && body.prefillFromGuests !== false) {
      const guests = await getWorkspaceGuests(workspace.id);
      prefill = dietarySections(guests);
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

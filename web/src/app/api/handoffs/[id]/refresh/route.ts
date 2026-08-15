import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { getPackage, updatePackage } from "@/lib/data/handoffs-store";
import { getMusic } from "@/lib/data/music-store";

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

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;

  const { id } = await context.params;
  const pkg = await getPackage(id);
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { workspace } = await ensureDemoWorkspace();
  let sections = { ...pkg.sections };
  let source: "music" | "guests" | null = null;

  if (pkg.template === "DJ") {
    const music = await getMusic(workspace.id);
    sections = {
      ...sections,
      must_play: (music.mustPlay || []).join("\n"),
      do_not_play: (music.doNotPlay || []).join("\n"),
      tone_notes: music.notes || sections.tone_notes || "",
      music_moments: (music.moments || [])
        .map((m) => (m.song ? `${m.label}: ${m.song}` : m.label))
        .join("\n"),
    };
    source = "music";
  } else if (pkg.template === "CATERING") {
    const guests = await getWorkspaceGuests(workspace.id);
    sections = {
      ...sections,
      ...dietarySections(guests),
    };
    source = "guests";
  } else {
    return NextResponse.json(
      { error: "Refresh is available for DJ and Catering packages only" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const updated = await updatePackage(id, {
    sections,
    lastRefreshedAt: now,
    lastRefreshedFrom: source,
  });
  return NextResponse.json({
    package: updated,
    refreshedFrom: source,
    lastRefreshedAt: now,
    message:
      source === "music"
        ? "Pulled latest must-play / do-not-play from Music"
        : "Pulled latest headcount and dietary notes from Guests",
  });
}

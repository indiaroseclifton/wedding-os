import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, loadWorkspaceMeta } from "@/lib/data/workspace";
import { saveDayOf } from "@/lib/data/dayof-store";
import { forecastForPlace } from "@/lib/integrations/weather";

export async function POST() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const meta = await loadWorkspaceMeta(workspace.id, workspace.name);
  const place = meta.location;
  if (!place) {
    return NextResponse.json({ error: "Add a city in Settings first" }, { status: 400 });
  }
  try {
    const forecast = await forecastForPlace(place);
    const note = `${forecast.name}: ${forecast.detail}`;
    await saveDayOf(workspace.id, { weatherNote: note });
    return NextResponse.json({ forecast, note });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Forecast failed" }, { status: 502 });
  }
}

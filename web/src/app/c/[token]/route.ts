import { NextResponse } from "next/server";
import { getSiteByToken } from "@/lib/data/site-store";
import { collectCalendar } from "@/lib/calendar/collect";
import { toIcs } from "@/lib/calendar/ics";

export async function GET(_req: Request, context: { params: Promise<{ token: string }> }) {
  const { token: raw } = await context.params;
  const token = raw.replace(/\.ics$/i, "");
  const site = await getSiteByToken(token);
  if (!site) return new NextResponse("Not found", { status: 404 });
  const { name, events } = await collectCalendar(site.workspaceId, "Wedding");
  const body = toIcs(name, events);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${token}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}

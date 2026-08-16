import { NextResponse } from "next/server";
import { PLACE_QUERY, placesConfigured, searchPlaces } from "@/lib/integrations/google-places";

export async function GET(request: Request) {
  if (!placesConfigured()) {
    return NextResponse.json({ configured: false, places: [] });
  }
  const url = new URL(request.url);
  const near = (url.searchParams.get("near") || "").trim();
  const category = url.searchParams.get("category") || "Venue";
  const q = url.searchParams.get("q")?.trim() || "";
  if (near.length < 3) {
    return NextResponse.json({ error: "Type a city", places: [], configured: true }, { status: 400 });
  }
  const query = q || PLACE_QUERY[category] || category || "wedding venue";
  try {
    const places = await searchPlaces(query, near);
    return NextResponse.json({ configured: true, near, query, places });
  } catch (e) {
    return NextResponse.json(
      { configured: true, error: e instanceof Error ? e.message : "Search failed", places: [] },
      { status: 502 }
    );
  }
}

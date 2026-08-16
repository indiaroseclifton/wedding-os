import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireCoupleApi } from "@/lib/auth/access";
import { appOrigin, authorizeUrl, spotifyConfigured } from "@/lib/integrations/spotify";

export async function GET(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  if (!spotifyConfigured()) {
    return NextResponse.redirect(new URL("/integrations?spotify=missing", request.url));
  }
  const state = randomBytes(16).toString("hex");
  const origin = appOrigin(request);
  const res = NextResponse.redirect(authorizeUrl(origin, state));
  res.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https"),
    path: "/",
    maxAge: 600,
  });
  return res;
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getMusic, saveMusic } from "@/lib/data/music-store";
import { appOrigin, exchangeCode, me } from "@/lib/integrations/spotify";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const err = url.searchParams.get("error");
  if (err) return NextResponse.redirect(new URL(`/music?spotify=denied`, request.url));

  const access = await requireCoupleApi();
  if (!access.ok) {
    return NextResponse.redirect(new URL("/login?next=/music", request.url));
  }

  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const jar = await cookies();
  const expected = jar.get("spotify_oauth_state")?.value;
  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/music?spotify=state", request.url));
  }

  try {
    const tokens = await exchangeCode(code, appOrigin(request));
    if (!tokens.refresh_token) {
      return NextResponse.redirect(new URL("/music?spotify=token", request.url));
    }
    const profile = await me(tokens.access_token);
    const { workspace } = await ensureDemoWorkspace();
    const current = await getMusic(workspace.id);
    await saveMusic(workspace.id, {
      spotify: {
        refreshToken: tokens.refresh_token,
        displayName: profile.display_name || profile.id,
        playlistId: current.spotify?.playlistId,
        playlistUrl: current.spotify?.playlistUrl,
        connectedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/music?spotify=error", request.url));
  }

  const res = NextResponse.redirect(new URL("/music?spotify=connected", request.url));
  res.cookies.set("spotify_oauth_state", "", { path: "/", maxAge: 0 });
  return res;
}

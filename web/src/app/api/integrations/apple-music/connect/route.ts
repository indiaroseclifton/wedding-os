import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getMusic, saveMusic } from "@/lib/data/music-store";
import { verifyAppleUser } from "@/lib/integrations/apple-music";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json().catch(() => ({}));
  const userToken = String(body.userToken || "");
  if (!userToken) return NextResponse.json({ error: "Missing Apple user token" }, { status: 400 });
  try {
    const profile = await verifyAppleUser(userToken);
    const { workspace } = await ensureDemoWorkspace();
    const current = await getMusic(workspace.id);
    await saveMusic(workspace.id, {
      appleMusic: {
        userToken,
        storefront: profile.storefront,
        playlistId: current.appleMusic?.playlistId,
        playlistUrl: current.appleMusic?.playlistUrl,
        connectedAt: new Date().toISOString(),
      },
    });
    return NextResponse.json({ ok: true, storefront: profile.storefront });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not connect" }, { status: 502 });
  }
}

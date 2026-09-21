import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { sameOrigin } from "@/lib/studio/validation";
import {
  configured,
  exchange,
  providerConfig,
  saveToken,
  seal,
  unseal,
  type Provider,
} from "@/lib/studio/connections";
type Context = { params: Promise<{ provider: string; action: string }> };
type State = {
  state: string;
  verifier: string;
  workspace: string;
  user: string;
  redirect: string;
  expires: number;
};
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/api/studio/connections",
  secure: process.env.NODE_ENV === "production",
};
export async function POST(request: Request, { params }: Context) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request origin does not match" },
      { status: 403 },
    );
  const { provider, action } = await params;
  if (!["canva", "pinterest"].includes(provider) || action !== "authorize")
    return NextResponse.json(
      { error: "Unknown connection action" },
      { status: 404 },
    );
  const p = provider as Provider;
  if (!configured(p))
    return NextResponse.json(
      {
        error: `${p === "canva" ? "Canva" : "Pinterest"} needs app credentials and approval before connecting. You can use links and manual exports now.`,
      },
      { status: 503 },
    );
  const { workspace } = await ensureDemoWorkspace(),
    state = randomBytes(32).toString("hex"),
    verifier = randomBytes(48).toString("base64url"),
    origin = process.env.APP_URL || new URL(request.url).origin,
    redirect = new URL(`/api/studio/connections/${p}/callback`, origin).href,
    c = providerConfig(p);
  const url = new URL(c.auth);
  url.searchParams.set("client_id", c.id!);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", c.scope);
  url.searchParams.set("state", state);
  if (p === "canva") {
    url.searchParams.set("code_challenge_method", "S256");
    url.searchParams.set(
      "code_challenge",
      createHash("sha256").update(verifier).digest("base64url"),
    );
  }
  const jar = await cookies();
  jar.set(
    `studio_oauth_${p}`,
    seal({
      state,
      verifier,
      workspace: workspace.id,
      user: access.session.userId,
      redirect,
      expires: Date.now() + 600000,
    } satisfies State),
    { ...cookieOptions, maxAge: 600 },
  );
  return NextResponse.json({ url: url.href });
}
export async function GET(request: Request, { params }: Context) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { provider, action } = await params;
  if (!["canva", "pinterest"].includes(provider) || action !== "callback")
    return NextResponse.json(
      { error: "Unknown connection action" },
      { status: 404 },
    );
  const p = provider as Provider,
    jar = await cookies(),
    encrypted = jar.get(`studio_oauth_${p}`)?.value;
  jar.set(`studio_oauth_${p}`, "", { ...cookieOptions, maxAge: 0 });
  const target = new URL(
    "/studio/connections",
    process.env.APP_URL || new URL(request.url).origin,
  );
  try {
    if (!encrypted)
      throw new Error("Connection session expired. Try connecting again.");
    const saved = unseal<State>(encrypted),
      { workspace } = await ensureDemoWorkspace(),
      url = new URL(request.url),
      state = url.searchParams.get("state") || "",
      code = url.searchParams.get("code");
    if (
      saved.user !== access.session.userId ||
      saved.workspace !== workspace.id ||
      saved.expires < Date.now() ||
      state.length !== saved.state.length ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(saved.state)) ||
      !code
    )
      throw new Error("Connection was cancelled or expired. Try again.");
    const result = await exchange(p, {
      grant_type: "authorization_code",
      code,
      redirect_uri: saved.redirect,
      ...(p === "canva" ? { code_verifier: saved.verifier } : {}),
    });
    await saveToken(workspace.id, access.session.userId, p, result);
    target.searchParams.set("connected", p);
  } catch (e) {
    target.searchParams.set("error", (e as Error).message);
  }
  return NextResponse.redirect(target);
}

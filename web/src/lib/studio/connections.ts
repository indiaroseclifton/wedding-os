import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "crypto";
import { mutateRecord, readRecord } from "./persistence";
export type Provider = "canva" | "pinterest";
type Token = {
  access_token: string;
  refresh_token?: string;
  expiresAt: number;
  scope?: string;
};
const file = "studio-connections.json";
export function providerConfig(provider: Provider) {
  return provider === "canva"
    ? {
        id: process.env.CANVA_CLIENT_ID,
        secret: process.env.CANVA_CLIENT_SECRET,
        auth: "https://www.canva.com/api/oauth/authorize",
        token: "https://api.canva.com/rest/v1/oauth/token",
        api: "https://api.canva.com/rest/v1",
        scope: "design:meta:read design:content:read",
      }
    : {
        id: process.env.PINTEREST_CLIENT_ID,
        secret: process.env.PINTEREST_CLIENT_SECRET,
        auth: "https://www.pinterest.com/oauth/",
        token: "https://api.pinterest.com/v5/oauth/token",
        api: "https://api.pinterest.com/v5",
        scope: "boards:read,pins:read",
      };
}
function key() {
  const secret =
    process.env.STUDIO_INTEGRATION_SECRET || process.env.AUTH_SECRET || "";
  if (secret.length < 32 || /replace|example|placeholder/i.test(secret))
    throw new Error("Studio integration encryption is not configured.");
  return createHash("sha256").update(secret).digest();
}
export function configured(p: Provider) {
  try {
    key();
    const c = providerConfig(p);
    return !!(c.id && c.secret);
  } catch {
    return false;
  }
}
export function seal(value: unknown) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv),
    data = Buffer.concat([
      cipher.update(JSON.stringify(value), "utf8"),
      cipher.final(),
    ]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}
export function unseal<T>(value: string): T {
  const bytes = Buffer.from(value, "base64url"),
    decipher = createDecipheriv("aes-256-gcm", key(), bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  return JSON.parse(
    Buffer.concat([
      decipher.update(bytes.subarray(28)),
      decipher.final(),
    ]).toString("utf8"),
  );
}
function recordKey(workspace: string, user: string, provider: Provider) {
  return `${workspace}:${user}:${provider}`;
}
export async function saveToken(
  workspace: string,
  user: string,
  p: Provider,
  data: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  },
) {
  const token: Token = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiresAt: Date.now() + Math.max(60, data.expires_in || 3600) * 1000,
    scope: data.scope,
  };
  if (!token.access_token)
    throw new Error("The provider did not return an access token.");
  await mutateRecord<string, void>(file, (rows) => {
    rows[recordKey(workspace, user, p)] = seal(token);
  });
  return token;
}
export async function disconnect(workspace: string, user: string, p: Provider) {
  await mutateRecord<string, void>(file, (rows) => {
    delete rows[recordKey(workspace, user, p)];
  });
}
export async function connectionStatuses(workspace: string, user: string) {
  const rows = await readRecord<string>(file);
  return (["canva", "pinterest"] as Provider[]).map((id) => ({
    id,
    configured: configured(id),
    connected: configured(id) && !!rows[recordKey(workspace, user, id)],
  }));
}
export async function exchange(p: Provider, params: Record<string, string>) {
  const c = providerConfig(p);
  const r = await fetch(c.token, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${c.id}:${c.secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  if (!r.ok)
    throw new Error(
      "The connection could not be authorised. Check the provider app settings and try again.",
    );
  return r.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  }>;
}
async function tokenFor(workspace: string, user: string, p: Provider) {
  const stored = (await readRecord<string>(file))[
    recordKey(workspace, user, p)
  ];
  if (!stored) throw new Error("Connect this account first.");
  let token = unseal<Token>(stored);
  if (token.expiresAt < Date.now() + 60000) {
    if (!token.refresh_token)
      throw new Error("Your connection expired. Reconnect this account.");
    const next = await exchange(p, {
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
    });
    token = await saveToken(workspace, user, p, {
      ...next,
      refresh_token: next.refresh_token || token.refresh_token,
    });
  }
  return token;
}
export async function providerRequest<T = Record<string, unknown>>(
  workspace: string,
  user: string,
  p: Provider,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await tokenFor(workspace, user, p);
  const r = await fetch(providerConfig(p).api + path, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  if (!r.ok)
    throw new Error(
      r.status === 401
        ? "Your connection expired. Reconnect this account."
        : r.status === 429
          ? "This provider is busy. Try again shortly."
          : "The provider could not complete this request. Check access to the selected design or board.",
    );
  return r.json() as Promise<T>;
}

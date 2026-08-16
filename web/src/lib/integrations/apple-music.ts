import { createPrivateKey, sign } from "crypto";

const API = "https://api.music.apple.com/v1";

export type AppleTrack = {
  title: string;
  artist: string;
  appleId: string;
  url: string;
};

export function appleMusicConfigured() {
  return Boolean(
    (process.env.APPLE_MUSIC_TEAM_ID &&
      process.env.APPLE_MUSIC_KEY_ID &&
      process.env.APPLE_MUSIC_PRIVATE_KEY) ||
      process.env.APPLE_MUSIC_TOKEN
  );
}

export function appleStorefront() {
  return process.env.APPLE_MUSIC_STOREFRONT || "us";
}

function normalizePem(raw: string) {
  return raw.replace(/\\n/g, "\n").trim();
}

export function appleDeveloperToken() {
  if (process.env.APPLE_MUSIC_TOKEN) return process.env.APPLE_MUSIC_TOKEN;
  const team = process.env.APPLE_MUSIC_TEAM_ID || "";
  const kid = process.env.APPLE_MUSIC_KEY_ID || "";
  const pem = normalizePem(process.env.APPLE_MUSIC_PRIVATE_KEY || "");
  if (!team || !kid || !pem) throw new Error("Apple Music keys are not set");

  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ iss: team, iat: now, exp: now + 60 * 60 * 12 })
  ).toString("base64url");
  const data = `${header}.${payload}`;
  const key = createPrivateKey(pem);
  const sig = sign("SHA256", Buffer.from(data), { key, dsaEncoding: "ieee-p1363" });
  return `${data}.${sig.toString("base64url")}`;
}

async function appleFetch(path: string, init: RequestInit & { userToken?: string } = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${appleDeveloperToken()}`);
  headers.set("Accept", "application/json");
  if (init.userToken) headers.set("Music-User-Token", init.userToken);
  const { userToken: _drop, ...rest } = init;
  const res = await fetch(`${API}${path}`, { ...rest, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.errors?.[0]?.detail || data.errors?.[0]?.title || "Apple Music request failed";
    throw new Error(msg);
  }
  return data;
}

export async function searchAppleSongs(query: string, storefront = appleStorefront()): Promise<AppleTrack[]> {
  const data = await appleFetch(
    `/catalog/${storefront}/search?${new URLSearchParams({
      term: query,
      types: "songs",
      limit: "6",
    })}`
  );
  const items = data.results?.songs?.data || [];
  return items.map((item: {
    id: string;
    attributes?: { name?: string; artistName?: string; url?: string };
  }) => ({
    title: item.attributes?.name || "Untitled",
    artist: item.attributes?.artistName || "",
    appleId: item.id,
    url: item.attributes?.url || "",
  }));
}

export async function verifyAppleUser(userToken: string) {
  const data = await appleFetch("/me/storefront", { userToken });
  return { storefront: data.data?.[0]?.id || appleStorefront() };
}

export async function createApplePlaylist(input: {
  userToken: string;
  name: string;
  description: string;
  songIds: string[];
}) {
  const created = await appleFetch("/me/library/playlists", {
    method: "POST",
    userToken: input.userToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attributes: { name: input.name, description: input.description },
      relationships: input.songIds.length
        ? {
            tracks: {
              data: input.songIds.slice(0, 100).map((id) => ({ id, type: "songs" })),
            },
          }
        : undefined,
    }),
  });
  const playlist = created.data?.[0] || created.data;
  const id = playlist?.id || "";
  const url =
    playlist?.attributes?.url ||
    (id ? `https://music.apple.com/library/playlist/${id}` : "");
  return { playlistId: id, playlistUrl: url };
}

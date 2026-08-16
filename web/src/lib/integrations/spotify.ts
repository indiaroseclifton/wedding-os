const AUTH = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";
const SCOPES = ["playlist-modify-public", "playlist-modify-private", "user-read-private"].join(" ");

export type SpotifyTrack = {
  title: string;
  artist: string;
  uri: string;
  url: string;
};

export function spotifyConfigured() {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

export function appOrigin(request: Request) {
  const env = process.env.APP_URL || process.env.AUTH_URL;
  if (env) return env.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export function redirectUri(origin: string) {
  return `${origin}/api/integrations/spotify/callback`;
}

function basicAuth() {
  const id = process.env.SPOTIFY_CLIENT_ID || "";
  const secret = process.env.SPOTIFY_CLIENT_SECRET || "";
  return Buffer.from(`${id}:${secret}`).toString("base64");
}

export function authorizeUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID || "",
    response_type: "code",
    redirect_uri: redirectUri(origin),
    scope: SCOPES,
    state,
    show_dialog: "false",
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function tokenRequest(body: URLSearchParams) {
  const res = await fetch(AUTH, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Spotify token failed");
  }
  return data as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

export async function clientAccessToken() {
  return tokenRequest(new URLSearchParams({ grant_type: "client_credentials" }));
}

export async function exchangeCode(code: string, origin: string) {
  return tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(origin),
    })
  );
}

export async function refreshAccess(refreshToken: string) {
  return tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  );
}

function mapTrack(item: {
  name?: string;
  uri?: string;
  external_urls?: { spotify?: string };
  artists?: { name: string }[];
}): SpotifyTrack {
  return {
    title: item.name || "Untitled",
    artist: (item.artists || []).map((a) => a.name).join(", "),
    uri: item.uri || "",
    url: item.external_urls?.spotify || "",
  };
}

export async function searchTracks(query: string, accessToken?: string): Promise<SpotifyTrack[]> {
  const token = accessToken || (await clientAccessToken()).access_token;
  const res = await fetch(
    `${API}/search?${new URLSearchParams({ q: query, type: "track", limit: "6" })}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || "Search failed");
  return ((data.tracks?.items || []) as Parameters<typeof mapTrack>[0][]).map(mapTrack);
}

export async function me(accessToken: string) {
  const res = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token(accessToken)}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || "Could not read Spotify profile");
  return data as { id: string; display_name?: string };
}

function token(value: string) {
  return value;
}

export async function upsertMustPlayPlaylist(input: {
  accessToken: string;
  userId: string;
  name: string;
  description: string;
  uris: string[];
  playlistId?: string;
}) {
  let playlistId = input.playlistId;
  let playlistUrl = "";

  if (playlistId) {
    const check = await fetch(`${API}/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${input.accessToken}` },
    });
    if (!check.ok) playlistId = undefined;
    else {
      const existing = await check.json();
      playlistUrl = existing.external_urls?.spotify || "";
    }
  }

  if (!playlistId) {
    const created = await fetch(`${API}/users/${input.userId}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        public: true,
      }),
    });
    const data = await created.json().catch(() => ({}));
    if (!created.ok) throw new Error(data.error?.message || "Could not create playlist");
    playlistId = data.id;
    playlistUrl = data.external_urls?.spotify || "";
  } else {
    await fetch(`${API}/playlists/${playlistId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: input.name, description: input.description }),
    });
  }

  if (input.uris.length) {
    const add = await fetch(`${API}/playlists/${playlistId}/tracks`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: input.uris.slice(0, 100) }),
    });
    if (!add.ok) {
      const data = await add.json().catch(() => ({}));
      throw new Error(data.error?.message || "Could not write tracks");
    }
  }

  return { playlistId: playlistId!, playlistUrl };
}

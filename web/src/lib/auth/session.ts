import { cookies } from "next/headers";

export const SESSION_COOKIE = "wedding_os_user";

export type SessionUser = {
  userId: string;
  name: string;
  email: string;
};

function demoAuthEnabled() {
  return process.env.DEMO_AUTH !== "0";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!demoAuthEnabled()) {
    try {
      const { auth } = await import("@/lib/auth/auth");
      const session = await auth();
      if (!session?.user?.email) return null;
      const id = (session.user as { id?: string }).id;
      if (!id) return null;
      return {
        userId: id,
        email: session.user.email,
        name: session.user.name || session.user.email.split("@")[0],
      };
    } catch (error) {
      console.error("Auth session read failed", error);
      return null;
    }
  }

  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as SessionUser;
  } catch {
    return null;
  }
}

export async function setSessionUser(user: SessionUser) {
  if (!demoAuthEnabled()) {
    throw new Error("Demo session is disabled (DEMO_AUTH=0)");
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionUser() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

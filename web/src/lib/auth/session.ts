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

export function emailLoginEnabled() {
  const key = process.env.RESEND_API_KEY || "";
  return key.startsWith("re_") && key !== "re_demo_unused";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const { auth } = await import("@/lib/auth/auth");
    const session = await auth();
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase();
      return {
        userId: session.user.id || email,
        email,
        name: session.user.name || email.split("@")[0],
      };
    }
  } catch (error) {
    console.error("Auth session read failed", error);
  }

  if (!demoAuthEnabled()) return null;

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

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  ensureDemoWorkspace,
  getCurrentMembership,
  getTaskById,
} from "@/lib/data/workspace";

export async function requireSession() {
  const session = await getSessionUser();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }
  await ensureDemoWorkspace();
  return { ok: true as const, session };
}

export async function requireCoupleApi() {
  const sessionResult = await requireSession();
  if (!sessionResult.ok) return sessionResult;

  const membership = await getCurrentMembership(sessionResult.session.userId);
  if (membership?.role === "WEDDING_PARTY") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "This action is only available to the couple" },
        { status: 403 }
      ),
    };
  }

  return { ok: true as const, session: sessionResult.session, membership };
}

/** Party members may only read/update tasks they own. Couples may access all. */
export async function requireTaskAccess(taskId: string) {
  const sessionResult = await requireSession();
  if (!sessionResult.ok) return sessionResult;

  const task = await getTaskById(taskId);
  if (!task) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  const membership = await getCurrentMembership(sessionResult.session.userId);
  if (
    membership?.role === "WEDDING_PARTY" &&
    task.ownerId !== sessionResult.session.userId
  ) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "You can only access tasks assigned to you" },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    session: sessionResult.session,
    membership,
    task,
  };
}

import { NextResponse } from "next/server";
import { requireCoupleApi, requireSession } from "@/lib/auth/access";
import {
  DEMO_USERS,
  addTask,
  ensureDemoWorkspace,
  getWorkspaceTasks,
  getCurrentMembership,
  getWorkspaceMembers,
} from "@/lib/data/workspace";
import {
  ValidationError,
  optionalId,
  optionalString,
  requiredString,
} from "@/lib/validation";

export async function GET() {
  const access = await requireSession();
  if (!access.ok) return access.response;

  const { workspace } = await ensureDemoWorkspace();
  const tasks = await getWorkspaceTasks(workspace.id);
  const membership = await getCurrentMembership(access.session.userId);

  if (membership?.role === "WEDDING_PARTY") {
    return NextResponse.json({
      tasks: tasks.filter((t) => t.ownerId === access.session.userId),
    });
  }

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;

  try {
    const body = await request.json();
    const session = access.session;
    const { workspace } = await ensureDemoWorkspace();

    const title = requiredString(body.title, "Title", 200);
    const description = optionalString(body.description, 5000);
    const ownerId =
      optionalId(body.ownerId) || session.userId || DEMO_USERS.alex.id;
    let ownerName =
      optionalString(body.ownerName, 120) || session.name || DEMO_USERS.alex.name;

    const members = await getWorkspaceMembers(workspace.id);
    const member = members.find((m) => m.userId === ownerId);
    if (member) ownerName = member.name;

    const task = await addTask({
      workspaceId: workspace.id,
      title,
      description,
      ownerId,
      ownerName,
      dueDate: optionalId(body.dueDate),
      decisionId: optionalId(body.decisionId),
    });

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to create task", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

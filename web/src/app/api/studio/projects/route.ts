import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  createFromTemplate,
  deleteProject,
  getStudio,
  setAfter,
  setStage,
  toggleMaterial,
  toggleStep,
} from "@/lib/data/studio-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const studio = await getStudio(workspace.id);
  return NextResponse.json({ studio });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  try {
    const body = await request.json();
    if (body.action === "make") {
      const studio = await createFromTemplate(workspace.id, {
        templateId: String(body.templateId),
        qty: Number(body.qty) || 1,
        title: body.title,
        inspiration: body.inspiration,
        intent: body.intent,
        budget: Number(body.budget) || 0,
      });
      return NextResponse.json({ studio });
    }
    if (body.action === "toggle_material") {
      const studio = await toggleMaterial(workspace.id, String(body.id), String(body.materialId));
      return NextResponse.json({ studio });
    }
    if (body.action === "toggle_step") {
      const studio = await toggleStep(workspace.id, String(body.id), String(body.stepId));
      return NextResponse.json({ studio });
    }
    if (body.action === "stage") {
      const studio = await setStage(workspace.id, String(body.id), body.stage);
      return NextResponse.json({ studio });
    }
    if (body.action === "after") {
      const studio = await setAfter(workspace.id, String(body.id), body.afterFate);
      return NextResponse.json({ studio });
    }
    if (body.action === "delete") {
      const studio = await deleteProject(workspace.id, String(body.id));
      return NextResponse.json({ studio });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

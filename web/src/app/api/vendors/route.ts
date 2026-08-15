import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  createVendor,
  listVendors,
} from "@/lib/data/vendors-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

const STATUSES = new Set([
  "RESEARCHING",
  "CONTACTED",
  "BOOKED",
  "PAID_DEPOSIT",
  "DONE",
  "DECLINED",
]);

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const vendors = await listVendors(workspace.id);
  return NextResponse.json({ vendors });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const name = requiredString(body.name, "Name", 200);
    const category = requiredString(body.category || "Other", "Category", 80);
    const { workspace } = await ensureDemoWorkspace();
    const vendor = await createVendor({
      workspaceId: workspace.id,
      name,
      category,
      status: STATUSES.has(body.status) ? body.status : "RESEARCHING",
      contactName: optionalString(body.contactName, 120),
      email: optionalString(body.email, 200),
      phone: optionalString(body.phone, 40),
      website: optionalString(body.website, 300),
      notes: optionalString(body.notes, 2000),
    });
    return NextResponse.json({ vendor });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}

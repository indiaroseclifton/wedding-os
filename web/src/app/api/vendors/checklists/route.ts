import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { VENDOR_CHECKLIST_TEMPLATES } from "@/lib/vendor-checklists";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  return NextResponse.json({ templates: VENDOR_CHECKLIST_TEMPLATES });
}

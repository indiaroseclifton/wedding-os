import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { DIRECTORY } from "@/lib/data/vendor-directory";
import {
  addInquiry,
  getDirectoryState,
  hireFromDirectory,
  toggleShortlist,
} from "@/lib/data/directory-store";
import { listVendors } from "@/lib/data/vendors-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [state, vendors] = await Promise.all([
    getDirectoryState(workspace.id),
    listVendors(workspace.id),
  ]);
  const hiredSlugs = vendors.map((v) => v.directorySlug).filter(Boolean);
  return NextResponse.json({
    listings: DIRECTORY,
    shortlist: state.shortlist,
    inquiries: state.inquiries,
    hiredSlugs,
  });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();
  const slug = String(body.slug || "");
  try {
    if (body.action === "shortlist") {
      const state = await toggleShortlist(workspace.id, slug);
      return NextResponse.json({ ok: true, shortlist: state.shortlist });
    }
    if (body.action === "inquire") {
      const state = await addInquiry(workspace.id, slug, String(body.message || ""));
      return NextResponse.json({ ok: true, inquiries: state.inquiries, shortlist: state.shortlist });
    }
    if (body.action === "hire") {
      const status =
        body.status === "BOOKED" || body.status === "CONTACTED" ? body.status : "RESEARCHING";
      const result = await hireFromDirectory(workspace.id, slug, status);
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, loadWorkspaceMeta } from "@/lib/data/workspace";
import { DIRECTORY, getDirectoryVendor } from "@/lib/data/vendor-directory";
import {
  addInquiry,
  getDirectoryState,
  hireFromDirectory,
  toggleShortlist,
} from "@/lib/data/directory-store";
import { listVendors } from "@/lib/data/vendors-store";
import { sendInquiryEmails } from "@/lib/email/resend";

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
    yourEmail: access.session.email,
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
      const listing = getDirectoryVendor(slug);
      if (!listing) return NextResponse.json({ error: "Unknown listing" }, { status: 404 });
      const message = String(body.message || "").trim();
      if (!message) return NextResponse.json({ error: "Write a note" }, { status: 400 });
      const replyEmail = String(body.replyEmail || access.session.email || "").trim();
      const state = await addInquiry(workspace.id, slug, message);
      const meta = await loadWorkspaceMeta(workspace.id, workspace.name);
      const mailed = await sendInquiryEmails({
        coupleTo: replyEmail,
        vendorTo: listing.email,
        vendorName: listing.name,
        coupleName: access.session.name || meta.coupleNames || "The couple",
        weddingName: meta.name || workspace.name,
        date: meta.weddingDate,
        location: meta.location,
        replyEmail,
        message,
      });
      return NextResponse.json({
        ok: true,
        inquiries: state.inquiries,
        shortlist: state.shortlist,
        emailedYou: mailed.emailedYou,
        emailedVendor: mailed.emailedVendor,
        emailError: mailed.error || undefined,
        demoVendor: listing.email.endsWith(".example") || listing.email.endsWith("@example.com"),
      });
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

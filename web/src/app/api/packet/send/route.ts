import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { sendAppEmail } from "@/lib/email/send";
import { requiredString, ValidationError } from "@/lib/validation";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const to = requiredString(body.to, "Email", 160);
    if (!to.includes("@")) return NextResponse.json({ error: "Need an email" }, { status: 400 });
    const text = String(body.text || "").slice(0, 20000);
    const subject = String(body.subject || "Day-of packet").slice(0, 160);
    const sent = await sendAppEmail({
      to,
      subject,
      text,
      html: `<pre style="font-family:Georgia,serif;white-space:pre-wrap">${text
        .replace(/&/g, "&")
        .replace(/</g, "<")}</pre>`,
    });
    if (!sent.ok) return NextResponse.json({ error: sent.error }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

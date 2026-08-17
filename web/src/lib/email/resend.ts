import { Resend } from "resend";
import { sendAppEmail } from "./send";

export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const resend = getResend();
  const from = process.env.EMAIL_FROM || "Vowfolk <onboarding@resend.dev>";
  if (!resend) {
    console.info("[email:dev]", input.to, input.subject, input.text || input.html);
    return { ok: true as const, dev: true };
  }
  await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  return { ok: true as const, dev: false };
}

export async function sendInviteEmail(input: {
  to: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
}) {
  const roleLabel = input.role === "COUPLE" ? "partner" : "wedding party member";
  return sendEmail({
    to: input.to,
    subject: `${input.inviterName} invited you to plan a wedding together`,
    text: `${input.inviterName} invited you as a ${roleLabel}.\n\nAccept: ${input.acceptUrl}`,
    html: `<p><strong>${input.inviterName}</strong> invited you as a ${roleLabel}.</p>
           <p><a href="${input.acceptUrl}">Accept invitation</a></p>
           <p style="color:#666;font-size:12px">${input.acceptUrl}</p>`,
  });
}

export async function sendMagicLinkEmail(input: { to: string; url: string }) {
  return sendEmail({
    to: input.to,
    subject: "Your Vowfolk sign-in link",
    text: `Sign in: ${input.url}`,
    html: `<p><a href="${input.url}">Sign in to Vowfolk</a></p>
           <p style="color:#666;font-size:12px">This link expires soon. If you did not request it, ignore this email.</p>`,
  });
}

function isDemoAddress(email?: string) {
  if (!email) return true;
  return email.endsWith(".example") || email.endsWith("@example.com");
}

export async function sendInquiryEmails(input: {
  coupleTo?: string;
  vendorTo?: string;
  vendorName: string;
  coupleName: string;
  weddingName: string;
  date?: string;
  location?: string;
  replyEmail?: string;
  message: string;
}) {
  const subject = `Inquiry: ${input.weddingName} → ${input.vendorName}`;
  const text = [
    `${input.coupleName} inquired about ${input.vendorName}.`,
    input.date ? `Date: ${input.date}` : "",
    input.location ? `Where: ${input.location}` : "",
    input.replyEmail ? `Reply to: ${input.replyEmail}` : "",
    "",
    input.message,
  ]
    .filter((line) => line !== "")
    .join("\n");
  const html = `<p><strong>${input.coupleName}</strong> inquired about <strong>${input.vendorName}</strong> for <strong>${input.weddingName}</strong>.</p>
${input.date ? `<p>Date: ${input.date}</p>` : ""}
${input.location ? `<p>Where: ${input.location}</p>` : ""}
${input.replyEmail ? `<p>Reply to: <a href="mailto:${input.replyEmail}">${input.replyEmail}</a></p>` : ""}
<p style="white-space:pre-wrap">${input.message.replace(/</g, "<")}</p>`;

  const results = { emailedYou: false, emailedVendor: false, error: "" };

  if (input.coupleTo && !isDemoAddress(input.coupleTo)) {
    const r = await sendAppEmail({
      to: input.coupleTo,
      subject: `Copy: ${subject}`,
      html,
      text,
    });
    results.emailedYou = r.ok;
    if (!r.ok) results.error = r.error;
  }
  if (input.vendorTo && !isDemoAddress(input.vendorTo)) {
    const r = await sendAppEmail({ to: input.vendorTo, subject, html, text });
    results.emailedVendor = r.ok;
    if (!r.ok && !results.error) results.error = r.error;
  }
  return results;
}

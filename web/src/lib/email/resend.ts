import { Resend } from "resend";

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
  const from = process.env.EMAIL_FROM || "Wedding OS <onboarding@resend.dev>";
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
    html: `<p><strong>${input.inviterName}</strong> invited you as a ${roleLabel}.</p>\n           <p><a href="${input.acceptUrl}">Accept invitation</a></p>\n           <p style="color:#666;font-size:12px">${input.acceptUrl}</p>`,
  });
}

export async function sendMagicLinkEmail(input: { to: string; url: string }) {
  return sendEmail({
    to: input.to,
    subject: "Your Wedding OS sign-in link",
    text: `Sign in: ${input.url}`,
    html: `<p><a href="${input.url}">Sign in to Wedding OS</a></p>\n           <p style="color:#666;font-size:12px">This link expires soon. If you did not request it, ignore this email.</p>`,
  });
}

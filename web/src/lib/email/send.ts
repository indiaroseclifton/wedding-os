export function emailIsConnected() {
  const key = process.env.RESEND_API_KEY || "";
  return key.startsWith("re_") && key !== "re_demo_unused";
}

export async function sendAppEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!emailIsConnected()) {
    return { ok: false, error: "Email is not connected. Copy the link instead." };
  }

  const key = process.env.RESEND_API_KEY as string;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Wedding OS <onboarding@resend.dev>",
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend send failed", res.status, body);
    return { ok: false, error: body.slice(0, 300) };
  }
  return { ok: true };
}

export function requestOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return "https://wedding-os-taupe.vercel.app";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

"use server";

import { signIn } from "@/lib/auth/auth";
import { emailLoginEnabled } from "@/lib/auth/session";

export async function sendMagicLink(formData: FormData) {
  if (!emailLoginEnabled()) {
    return { error: "Email login is not connected yet." };
  }
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email." };
  }
  try {
    await signIn("resend", { email, redirectTo: "/dashboard" });
  } catch (error) {
    const digest =
      typeof error === "object" && error && "digest" in error
        ? String((error as { digest?: string }).digest)
        : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw error;
    console.error("Magic link send failed", error);
    return { error: "Could not send the email. Try again in a minute." };
  }
}

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
  await signIn("resend", { email, redirectTo: "/dashboard" });
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { sendMagicLink } from "./actions";

const DEMO_USERS = [
  {
    userId: "user_alex",
    name: "Alex Rivera",
    email: "alex@example.com",
    label: "Continue as Alex (owner)",
  },
  {
    userId: "user_jordan",
    name: "Jordan Lee",
    email: "jordan@example.com",
    label: "Continue as Jordan (partner)",
  },
];

export function LoginForm({ emailReady }: { emailReady: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const verify = params.get("verify") === "1";
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function signInDemo(user: (typeof DEMO_USERS)[number]) {
    setLoadingId(user.userId);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!res.ok) throw new Error("Could not sign in");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
      setLoadingId(null);
    }
  }

  async function onEmail(formData: FormData) {
    setSending(true);
    setError(null);
    const result = await sendMagicLink(formData);
    if (result?.error) {
      setError(result.error);
      setSending(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-night text-ivory">
      <img src="/brand/tablescape.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[center_35%]" />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <p className="font-serif text-2xl tracking-tight">Wedding OS</p>
        <h1 className="mt-4 max-w-lg text-center font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          The wedding you’re actually throwing
        </h1>
        <div className="glass mt-8 w-full max-w-sm space-y-5 rounded-[1.4rem] p-6">
          <div>
            <h2 className="font-serif text-2xl">Sign in</h2>
            <p className="mt-2 text-sm text-white/65">
              {verify
                ? "Check your email for a sign-in link. It may take a minute."
                : "Email a link, or use a demo person."}
            </p>
          </div>
          {verify ? (
            <p className="rounded-lg bg-white/10 px-3 py-2 text-sm text-champagne">
              Link sent. Open it on this device.
            </p>
          ) : (
            <form action={onEmail} className="space-y-3">
              <label className="block text-xs font-medium text-white/70">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  disabled={!emailReady || sending}
                  placeholder="you@email.com"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-ivory outline-none placeholder:text-white/35 focus:border-champagne disabled:opacity-50"
                />
              </label>
              <button
                type="submit"
                disabled={!emailReady || sending}
                className="flex w-full items-center justify-center rounded-lg bg-champagne px-4 py-2.5 text-sm font-medium text-night disabled:opacity-50"
              >
                {sending ? "Sending…" : "Email me a sign-in link"}
              </button>
            </form>
          )}
          <div className="space-y-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.userId}
                type="button"
                disabled={!!loadingId}
                onClick={() => signInDemo(user)}
                className="flex w-full items-center justify-center rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-ivory disabled:opacity-50"
              >
                {loadingId === user.userId ? "Signing in…" : user.label}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-clay-soft">{error}</p>}
        </div>
      </div>
    </div>
  );
}

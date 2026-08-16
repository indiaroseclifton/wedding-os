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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden min-h-[40vh] lg:block">
        <img src="/brand/garden.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-ink/10" />
        <p className="absolute bottom-10 left-10 right-10 text-2xl font-medium leading-tight tracking-tight text-moss-fg">
          The coordination hub for the wedding you’re actually throwing.
        </p>
      </div>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,_#d7e0d6_0%,_transparent_70%)]"
      />
      <div className="relative w-full max-w-sm">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-moss">
          Wedding OS
        </p>
        <h1 className="mt-3 text-center text-3xl font-medium tracking-tight text-ink">
          Plan it in one place
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-ink-soft">
          The coordination hub — vendors, DIY, guests, and the day itself.
        </p>

        <div className="mt-8 space-y-6 rounded-xl border border-line bg-surface p-6 shadow-[0_1px_0_rgba(28,25,21,0.04)]">
          <div>
            <h2 className="text-lg font-medium tracking-tight text-ink">Sign in</h2>
            <p className="mt-2 text-sm text-ink-soft">
              {verify
                ? "Check your email for a sign-in link. It may take a minute."
                : "Email a link to yourself, or use a demo person while we finish setup."}
            </p>
          </div>

          {verify ? (
            <p className="rounded-lg bg-moss-soft px-3 py-2 text-sm text-moss">
              Link sent. Open it on this device.
            </p>
          ) : (
            <form action={onEmail} className="space-y-3">
              <label className="block text-xs font-medium text-ink-soft">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  disabled={!emailReady || sending}
                  placeholder="you@email.com"
                  className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-moss focus:ring-2 focus:ring-moss/20 disabled:bg-paper"
                />
              </label>
              <button
                type="submit"
                disabled={!emailReady || sending}
                className="flex w-full items-center justify-center rounded-lg bg-moss px-4 py-2.5 text-sm font-medium text-moss-fg hover:bg-moss/90 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Email me a sign-in link"}
              </button>
              {!emailReady && (
                <p className="text-xs text-muted">
                  Email login connects after the Resend key is added. Demo buttons still work.
                </p>
              )}
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                Demo
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.userId}
                type="button"
                disabled={!!loadingId}
                onClick={() => signInDemo(user)}
                className="flex w-full items-center justify-center rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper disabled:opacity-50"
              >
                {loadingId === user.userId ? "Signing in…" : user.label}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-clay">{error}</p>}
        </div>
      </div>
      </div>
    </div>
  );
}

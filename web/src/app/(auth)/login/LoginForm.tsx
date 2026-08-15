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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            {verify
              ? "Check your email for a sign-in link. It may take a minute."
              : "Email a link to yourself, or use a demo person while we finish setup."}
          </p>
        </div>

        {verify ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Link sent. Open it on this device.
          </p>
        ) : (
          <form action={onEmail} className="space-y-3">
            <label className="block text-xs font-medium text-slate-600">
              Email
              <input
                type="email"
                name="email"
                required
                disabled={!emailReady || sending}
                placeholder="you@email.com"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-900 focus:ring-2 disabled:bg-slate-50"
              />
            </label>
            <button
              type="submit"
              disabled={!emailReady || sending}
              className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Email me a sign-in link"}
            </button>
            {!emailReady && (
              <p className="text-xs text-slate-500">
                Email login connects after the Resend key is added. Demo buttons still work.
              </p>
            )}
          </form>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
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
              className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              {loadingId === user.userId ? "Signing in…" : user.label}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </div>
  );
}

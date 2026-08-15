"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function LoginPage() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(user: (typeof DEMO_USERS)[number]) {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Demo session so the app knows who you are while we build.
          </p>
        </div>
        <div className="space-y-2">
          {DEMO_USERS.map((user) => (
            <button
              key={user.userId}
              type="button"
              disabled={!!loadingId}
              onClick={() => signIn(user)}
              className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
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

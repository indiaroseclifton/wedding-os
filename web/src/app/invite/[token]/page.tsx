"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function accept(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not accept invite");
      }
      const data = await res.json();
      if (data.role === "WEDDING_PARTY") {
        router.push("/party");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <form
        onSubmit={accept}
        className="glass-panel w-full max-w-sm space-y-4 rounded-2xl p-6"
      >
        <div>
          <p className="kicker kicker-moss">Invite</p>
          <h1 className="title mt-2">You're on this wedding</h1>
          <p className="deck mt-2">Your name, then you're in.</p>
        </div>
        <label className="block text-sm">
          <span className="kicker">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="field mt-1"
          />
        </label>
        {error && <p className="text-xs text-clay">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          {loading ? "Joining…" : "Accept invite"}
        </button>
      </form>
    </div>
  );
}

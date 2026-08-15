"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type Invite = {
  id: string;
  name?: string;
  email?: string;
  token: string;
  role: string;
  status: string;
};

export default function PeoplePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/invites");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members || []);
      setInvites(data.invites || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role: "WEDDING_PARTY" }),
    });
    if (!res.ok) {
      setError("Could not create invite");
      return;
    }
    const data = await res.json();
    setLastLink(`${window.location.origin}${data.invitePath}`);
    setName("");
    setEmail("");
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">People</h1>
        <p className="mt-1 text-sm text-slate-600">
          Invite the wedding party with a link. They land in a simpler portal.
        </p>
      </div>

      <form onSubmit={createInvite} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium">Invite wedding party</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email (optional)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Create invite link
        </button>
      </form>

      {lastLink && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-emerald-900">Share this link</p>
            <CopyButton value={lastLink} />
          </div>
          <p className="mt-2 break-all text-emerald-800">{lastLink}</p>
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Members</p>
        <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {members.map((m) => (
            <li key={m.id} className="flex justify-between px-4 py-3 text-sm">
              <span>
                {m.name}
                <span className="text-xs text-slate-500"> · {m.role}</span>
              </span>
              <span className="text-xs text-slate-500">{m.status}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Invites</p>
        <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {invites.map((i) => {
            const link =
              typeof window !== "undefined"
                ? `${window.location.origin}/invite/${i.token}`
                : `/invite/${i.token}`;
            return (
              <li key={i.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>
                    {i.name || i.email || "Invite"}
                    <span className="text-xs text-slate-500"> · {i.status}</span>
                  </p>
                  {i.status === "PENDING" && <CopyButton value={link} label="Copy link" />}
                </div>
              </li>
            );
          })}
          {!invites.length && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">No invites yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}

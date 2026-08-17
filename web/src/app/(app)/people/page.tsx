"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

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
  const [role, setRole] = useState("WEDDING_PARTY");
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [emailNote, setEmailNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [emailConnected, setEmailConnected] = useState(false);

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
    fetch("/api/health")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEmailConnected(Boolean(d?.email)))
      .catch(() => {});
  }, []);

  async function createInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailNote(null);
    setSending(true);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    setSending(false);
    if (!res.ok) {
      setError("Could not create invite");
      return;
    }
    const data = await res.json();
    setLastLink(`${window.location.origin}${data.invitePath}`);
    if (email) {
      setEmailNote(
        data.emailed
          ? `Invite emailed to ${email}.`
          : "Link created. Email could not be sent — copy the link, or use the inbox on your Resend account until a domain is verified."
      );
    }
    setName("");
    setEmail("");
    load();
  }

  return (
    <div className="space-y-6">
      <RoomSubnav room="day" />
      <div>
        <p className="kicker kicker-moss">Day-of</p>
        <h1 className="title mt-2">People</h1>
        <p className="deck mt-2">Partner or party. They get the smaller desk.</p>
      </div>

      <form onSubmit={createInvite} className="glass-panel space-y-3 rounded-2xl p-5">
        <p className="text-sm font-medium">Send an invite</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="field"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="field"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="field"
        >
          <option value="WEDDING_PARTY">Wedding party</option>
          <option value="COUPLE">Partner / couple</option>
        </select>
        {error && <p className="text-xs text-clay">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className={`btn disabled:opacity-50 ${emailConnected ? "btn-primary" : "btn-ghost"}`}
        >
          {sending
            ? emailConnected
              ? "Sending…"
              : "Creating…"
            : emailConnected
              ? "Create invite"
              : "Create link"}
        </button>
      </form>

      {lastLink && (
        <div className="glass-panel rounded-2xl p-5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-ink">Share this link</p>
            <CopyButton value={lastLink} primary={!emailConnected} />
          </div>
          <p className="mt-2 break-all text-ink-soft">{lastLink}</p>
          {emailNote && <p className="mt-2 text-xs text-ink-soft">{emailNote}</p>}
        </div>
      )}

      <div>
        <p className="kicker">Members</p>
        {members.length === 0 ? (
          <div className="mt-2">
            <EmptyState title="No members yet" body="Invite a partner or someone in the party." />
          </div>
        ) : (
          <ul className="panel mt-2 divide-y divide-line">
            {members.map((m) => (
              <li key={m.id} className="flex justify-between px-4 py-3 text-sm">
                <span>
                  {m.name}
                  <span className="text-xs text-muted">
                    {" "}
                    · {m.role}
                    {m.email ? ` · ${m.email}` : ""}
                  </span>
                </span>
                <span className="text-xs text-muted">{m.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="kicker">Invites</p>
        {invites.length === 0 ? (
          <div className="mt-2">
            <EmptyState title="No invites yet" body="Create a link. They join from their phone." />
          </div>
        ) : (
          <ul className="panel mt-2 divide-y divide-line">
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
                      <span className="text-xs text-muted">
                        {" "}
                        · {i.role} · {i.status}
                      </span>
                    </p>
                    {i.status === "PENDING" && (
                      <CopyButton value={link} label="Copy link" primary={!emailConnected} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

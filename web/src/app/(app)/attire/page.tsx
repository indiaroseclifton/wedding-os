"use client";

import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { EmptyState } from "@/components/ui/EmptyState";

type Member = {
  id: string;
  name: string;
  role: string;
  color?: string;
  size?: string;
  dressLink?: string;
  notes?: string;
  status: string;
};

export default function AttirePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [palette, setPalette] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Party");
  const [color, setColor] = useState("");
  const [link, setLink] = useState("");

  async function load() {
    const res = await fetch("/api/attire");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.attire?.members || []);
      setPalette(data.attire?.paletteNotes || "");
    }
  }

  useEffect(() => {
    load();
    fetch("/api/decisions/style-vibe")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const hex = d?.decision?.payload?.palette?.hex;
        if (Array.isArray(hex) && hex.length) {
          setPalette((cur) => cur || hex.join(" · "));
        }
      })
      .catch(() => {});
  }, []);

  async function savePalette() {
    const res = await fetch("/api/attire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "palette", paletteNotes: palette }),
    });
    if (res.ok) {
      const data = await res.json();
      setPalette(data.attire.paletteNotes || "");
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/attire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, color, dressLink: link }),
    });
    if (res.ok) {
      const data = await res.json();
      setMembers(data.attire.members);
      setName("");
      setColor("");
      setLink("");
    }
  }

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/attire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_member", id, patch: { status } }),
    });
    if (res.ok) {
      const data = await res.json();
      setMembers(data.attire.members);
    }
  }

  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <div>
        <p className="kicker kicker-moss">Planning</p>
        <h1 className="title mt-2">Attire</h1>
        <p className="deck mt-2">Colors, links, and who has theirs.</p>
      </div>

      <label className="block text-sm">
        <span className="kicker">Palette / dress notes</span>
        <textarea
          value={palette}
          onChange={(e) => setPalette(e.target.value)}
          rows={2}
          className="field mt-1"
          placeholder="Champagne satin, no strapless…"
        />
        <button type="button" onClick={savePalette} className="mt-2 text-xs font-medium underline">
          Save palette
        </button>
      </label>

      <form onSubmit={add} className="glass-panel space-y-2 rounded-2xl p-5">
        <p className="text-sm font-medium">Add party member</p>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Name" className="field" />
        <div className="grid grid-cols-2 gap-2">
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="field" />
          <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Color" className="field" />
        </div>
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Dress / suit link" className="field" />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      {members.length === 0 ? (
        <EmptyState
          title="No one on attire yet"
          body="Add the party. Color, link, and whether they have it."
        />
      ) : (
        <ul className="space-y-3">
          {members.map((m) => (
            <li key={m.id} className="glass-panel rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="text-xs text-muted">
                    {m.role}
                    {m.color ? ` · ${m.color}` : ""}
                  </p>
                  {m.dressLink && (
                    <a href={m.dressLink} target="_blank" rel="noreferrer" className="mt-1 block text-xs underline">
                      Open link
                    </a>
                  )}
                </div>
                <select
                  value={m.status}
                  onChange={(e) => setStatus(m.id, e.target.value)}
                  className="field w-auto"
                >
                  <option value="NOT_STARTED">Not started</option>
                  <option value="ORDERED">Ordered</option>
                  <option value="ALTERING">Altering</option>
                  <option value="READY">Ready</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

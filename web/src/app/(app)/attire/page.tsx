"use client";

import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

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
  const [role, setRole] = useState("Bridesmaid");
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
        <h1 className="text-2xl font-semibold tracking-tight">Attire</h1>
        <p className="mt-1 text-sm text-slate-600">
          Colors, links, and status for the wedding party — the bridesmaids tab idea.
        </p>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Palette / dress notes</span>
        <textarea
          value={palette}
          onChange={(e) => setPalette(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Champagne satin, no strapless…"
        />
        <button type="button" onClick={savePalette} className="mt-2 text-xs font-medium underline">
          Save palette
        </button>
      </label>

      <form onSubmit={add} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium">Add party member</p>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Color" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Dress / suit link" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Add
        </button>
      </form>

      <ul className="space-y-3">
        {members.map((m) => (
          <li key={m.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {m.role}
                  {m.color ? ` · ${m.color}` : ""}
                </p>
                {m.dressLink && (
                  <a href={m.dressLink} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-sky-700 underline">
                    Open link
                  </a>
                )}
              </div>
              <select
                value={m.status}
                onChange={(e) => setStatus(m.id, e.target.value)}
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
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
    </div>
  );
}

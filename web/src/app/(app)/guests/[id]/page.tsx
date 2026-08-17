"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

type Guest = {
  id: string;
  name: string;
  email?: string;
  side?: string;
  rsvp: string;
  plusOnes: number;
  plusOneNames?: string[];
  plusPolicy?: "ok" | "none" | "named";
  dietary?: string;
  tableLabel?: string;
  notes?: string;
  address?: string;
  city?: string;
  region?: string;
  postal?: string;
  phone?: string;
  partyName?: string;
  meal?: string;
  listTier?: "A" | "B";
  answers?: Record<string, string>;
};

type Question = { id: string; prompt: string };

export default function EditGuestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/guests/${id}`).then(async (res) => {
        if (!res.ok) throw new Error("Guest not found");
        return res.json();
      }),
      fetch("/api/site").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([data, site]) => {
        setGuest(data.guest);
        const qs: Question[] = site?.site?.rsvpQuestions || [];
        setQuestions(qs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!guest) return;
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email") || undefined,
          side: form.get("side"),
          rsvp: form.get("rsvp"),
          plusOnes: Number(form.get("plusOnes") || 0),
          plusOneText: form.get("plusOneText") || "",
          plusPolicy: form.get("plusPolicy") || "ok",
          dietary: form.get("dietary") || undefined,
          tableLabel: form.get("tableLabel") || undefined,
          address: form.get("address") || undefined,
          city: form.get("city") || undefined,
          region: form.get("region") || undefined,
          postal: form.get("postal") || undefined,
          phone: form.get("phone") || undefined,
          partyName: form.get("partyName") || undefined,
          meal: form.get("meal") || undefined,
          listTier: form.get("listTier") || "A",
          notes: form.get("notes") || undefined,
          answers: Object.fromEntries(
            [...form.entries()]
              .filter(([k]) => k.startsWith("answer:"))
              .map(([k, v]) => [k.slice(7), String(v || "")])
          ),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save");
      }
      router.push("/guests");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Remove this guest?")) return;
    const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/guests");
      router.refresh();
    } else {
      setError("Could not delete guest");
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (!guest) return <p className="text-sm text-clay">{error || "Not found"}</p>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <RoomSubnav room="guests" />
      <div>
        <p className="kicker kicker-moss">Guests</p>
        <h1 className="title mt-2">Edit guest</h1>
        <p className="deck mt-2">RSVP, meal, table, the notes that matter.</p>
      </div>
      <form onSubmit={onSubmit} className="glass-panel space-y-4 rounded-2xl p-5">
        <label className="block text-sm">
          <span className="kicker">Name</span>
          <input name="name" required defaultValue={guest.name} className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Email</span>
          <input name="email" type="email" defaultValue={guest.email || ""} className="field mt-1" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="kicker">Side</span>
            <select name="side" defaultValue={guest.side || "OTHER"} className="field mt-1">
              <option value="OTHER">Other</option>
              <option value="A">Partner A</option>
              <option value="B">Partner B</option>
              <option value="BOTH">Both</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="kicker">RSVP</span>
            <select name="rsvp" defaultValue={guest.rsvp} className="field mt-1">
              <option value="UNKNOWN">Unknown</option>
              <option value="INVITED">Invited</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
              <option value="MAYBE">Maybe</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="kicker">Plus-one</span>
          <select name="plusPolicy" defaultValue={guest.plusPolicy || "ok"} className="field mt-1">
            <option value="ok">Allowed</option>
            <option value="named">Named only</option>
            <option value="none">No plus-one</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="kicker">Plus-ones — names</span>
          <input name="plusOnes" type="number" min={0} defaultValue={guest.plusOnes || 0} className="field mt-1" />
          <textarea
            name="plusOneText"
            rows={2}
            defaultValue={(guest.plusOneNames || []).join("\n")}
            placeholder="One name per line"
            className="field mt-2"
          />
        </label>
        <label className="block text-sm">
          <span className="kicker">Table label</span>
          <input name="tableLabel" defaultValue={guest.tableLabel || ""} placeholder="e.g. Table 1" className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Street</span>
          <input name="address" defaultValue={guest.address || ""} className="field mt-1" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="kicker">City</span>
            <input name="city" defaultValue={guest.city || ""} className="field mt-1" />
          </label>
          <label className="block text-sm">
            <span className="kicker">State</span>
            <input name="region" defaultValue={guest.region || ""} className="field mt-1" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="kicker">ZIP</span>
            <input name="postal" defaultValue={guest.postal || ""} className="field mt-1" />
          </label>
          <label className="block text-sm">
            <span className="kicker">Phone</span>
            <input name="phone" defaultValue={guest.phone || ""} className="field mt-1" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="kicker">List</span>
          <select name="listTier" defaultValue={guest.listTier || "A"} className="field mt-1">
            <option value="A">A — invited first</option>
            <option value="B">B — if space opens. No save-the-date.</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="kicker">Household</span>
          <input name="partyName" defaultValue={guest.partyName || ""} className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Meal</span>
          <input name="meal" defaultValue={guest.meal || ""} placeholder="Chicken, fish, veg" className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="kicker">Dietary</span>
          <input name="dietary" defaultValue={guest.dietary || ""} className="field mt-1" />
        </label>
        {(questions.length > 0 || Object.keys(guest.answers || {}).length > 0) && (
          <div className="space-y-3 rounded-xl bg-moss-soft p-3">
            <p className="kicker">What they answered</p>
            {questions.map((q) => (
              <label key={q.id} className="block text-sm">
                <span className="font-medium">{q.prompt}</span>
                <input
                  name={`answer:${q.id}`}
                  defaultValue={guest.answers?.[q.id] || ""}
                  className="field mt-1"
                />
              </label>
            ))}
            {Object.entries(guest.answers || {})
              .filter(([id]) => !questions.some((q) => q.id === id))
              .map(([id, val]) => (
                <label key={id} className="block text-sm">
                  <span className="font-medium">{id}</span>
                  <input
                    name={`answer:${id}`}
                    defaultValue={val}
                    className="field mt-1"
                  />
                </label>
              ))}
          </div>
        )}
        <label className="block text-sm">
          <span className="kicker">Notes</span>
          <textarea name="notes" rows={3} defaultValue={guest.notes || ""} className="field mt-1" />
        </label>
        {error && <p className="text-xs text-clay">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={saving} className="btn btn-primary flex-1">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onDelete} className="btn btn-ghost text-clay">
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}

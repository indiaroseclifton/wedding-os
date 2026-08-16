"use client";

import Link from "next/link";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { PrintButton } from "@/components/ui/PrintButton";
import { CopyButton } from "@/components/ui/CopyButton";
import { ScheduleView } from "@/components/run-of-show/ScheduleView";
import {
  AUDIENCES,
  type Audience,
  type RunSlot,
  audienceLabel,
  audiencesOf,
  formatRange,
} from "@/lib/data/run-of-show";

type DayOf = {
  schedule: RunSlot[];
  rainSchedule?: RunSlot[];
  shareToken?: string;
  activePlan?: "main" | "rain";
};

const VIEWS: { id: Audience | "all"; label: string }[] = [
  { id: "all", label: "Full" },
  { id: "couple", label: "Couple" },
  { id: "party", label: "Party" },
  { id: "vendor", label: "Vendor" },
  { id: "guests", label: "Guests" },
];

const emptyDraft = {
  time: "12:00",
  endTime: "12:30",
  title: "",
  guestTitle: "",
  location: "",
  lead: "",
  assignee: "",
  notes: "",
  audiences: ["couple", "party", "vendor"] as Audience[],
};

export default function RunOfShowPage() {
  const [dayOf, setDayOf] = useState<DayOf | null>(null);
  const [view, setView] = useState<Audience | "all">("all");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/day-of");
    if (!res.ok) return;
    const data = await res.json();
    setDayOf(data.dayOf);
    if (data.dayOf.shareToken) {
      setShareUrl(`${window.location.origin}/ros/${data.dayOf.shareToken}`);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/day-of", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return;
    const data = await res.json();
    setDayOf(data.dayOf);
    if (data.sharePath) setShareUrl(`${window.location.origin}${data.sharePath}`);
    setEditing(null);
    return data;
  }

  function openEdit(slot: RunSlot) {
    setEditing(slot.id);
    setDraft({
      time: slot.time,
      endTime: slot.endTime || "",
      title: slot.title,
      guestTitle: slot.guestTitle || "",
      location: slot.location || "",
      lead: slot.lead || "",
      assignee: slot.assignee || "",
      notes: slot.notes || "",
      audiences: audiencesOf(slot),
    });
  }

  function toggleAud(a: Audience) {
    setDraft((d) => ({
      ...d,
      audiences: d.audiences.includes(a)
        ? d.audiences.filter((x) => x !== a)
        : [...d.audiences, a],
    }));
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    if (editing === "new") {
      await post({ action: "schedule_add", ...draft });
    } else if (editing) {
      await post({ action: "schedule_patch", id: editing, ...draft });
    }
  }

  if (!dayOf) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Run of show</h1>
          <p className="mt-1 text-sm text-slate-600">
            One timeline. Each beat has a time, a place, a lead, and who is allowed to see it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintButton label="Print" />
          <button
            type="button"
            onClick={async () => {
              await post({ action: "schedule_share" });
              setMsg("Share link ready");
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Share link
          </button>
          <Link href="/packet" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            Packet
          </Link>
          <Link href="/day-of" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            Live board
          </Link>
        </div>
      </div>

      {shareUrl && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm print:hidden">
          <span className="text-emerald-900">{shareUrl}</span>
          <CopyButton value={shareUrl} />
          <CopyButton value={`${shareUrl}?for=party`} label="Party link" />
          <CopyButton value={`${shareUrl}?for=vendor`} label="Vendor link" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => post({ action: "plan", plan: "main" })}
          className={`rounded-full px-3 py-1 text-xs ${
            (dayOf.activePlan || "main") === "main" ? "bg-slate-900 text-white" : "border border-slate-300"
          }`}
        >
          Fair weather
        </button>
        <button
          type="button"
          onClick={() => post({ action: "plan", plan: "rain" })}
          className={`rounded-full px-3 py-1 text-xs ${
            dayOf.activePlan === "rain" ? "bg-slate-900 text-white" : "border border-slate-300"
          }`}
        >
          Rain plan
        </button>
        <button
          type="button"
          onClick={() => post({ action: "rain_copy" })}
          className="text-xs underline"
        >
          Copy main → rain
        </button>
      </div>

      <div className="flex flex-wrap gap-1 print:hidden">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={`rounded-full px-3 py-1 text-xs ${
              view === v.id ? "bg-slate-900 text-white" : "border border-slate-300"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view !== "all" ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Preview · {view}
          </p>
          <ScheduleView
            slots={
              dayOf.activePlan === "rain" ? dayOf.rainSchedule || [] : dayOf.schedule
            }
            view={view}
            showNotes={view !== "guests"}
          />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {dayOf.schedule.map((s) => (
            <li key={s.id} className="px-4 py-3">
              {editing === s.id ? (
                <SlotForm
                  draft={draft}
                  setDraft={setDraft}
                  toggleAud={toggleAud}
                  onSave={saveEdit}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      <span className="tabular-nums text-slate-500">
                        {formatRange(s.time, s.endTime)}
                      </span>{" "}
                      {s.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {[s.location, s.lead, s.guestTitle ? `guests see “${s.guestTitle}”` : ""]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {s.notes && <p className="mt-1 text-xs text-slate-600">{s.notes}</p>}
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                      {audiencesOf(s).map(audienceLabel).join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <button type="button" onClick={() => openEdit(s)} className="text-xs underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => post({ action: "schedule_remove", id: s.id })}
                      className="text-xs text-slate-400 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing === "new" ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 print:hidden">
          <SlotForm
            draft={draft}
            setDraft={setDraft}
            toggleAud={toggleAud}
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : (
        view === "all" && (
          <button
            type="button"
            onClick={() => {
              setDraft(emptyDraft);
              setEditing("new");
            }}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white print:hidden"
          >
            Add beat
          </button>
        )
      )}

      {msg && <p className="text-xs text-slate-500 print:hidden">{msg}</p>}
    </div>
  );
}

function SlotForm({
  draft,
  setDraft,
  toggleAud,
  onSave,
  onCancel,
}: {
  draft: typeof emptyDraft;
  setDraft: Dispatch<SetStateAction<typeof emptyDraft>>;
  toggleAud: (a: Audience) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSave} className="grid gap-2 sm:grid-cols-2">
      <label className="text-xs">
        Start
        <input
          type="time"
          value={draft.time}
          onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs">
        End
        <input
          type="time"
          value={draft.endTime}
          onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs sm:col-span-2">
        Title (internal)
        <input
          required
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs sm:col-span-2">
        Guest title (optional)
        <input
          value={draft.guestTitle}
          onChange={(e) => setDraft((d) => ({ ...d, guestTitle: e.target.value }))}
          placeholder="What guests see — leave blank to hide the detail"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs">
        Where
        <input
          value={draft.location}
          onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs">
        Lead
        <input
          value={draft.lead}
          onChange={(e) => setDraft((d) => ({ ...d, lead: e.target.value }))}
          placeholder="DJ, MOH, catering…"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs">
        Assigned to (party)
        <input
          value={draft.assignee}
          onChange={(e) => setDraft((d) => ({ ...d, assignee: e.target.value }))}
          placeholder="Maya · guestbook"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs sm:col-span-2">
        Notes (not shown to guests)
        <textarea
          value={draft.notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          rows={2}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
      </label>
      <div className="sm:col-span-2">
        <p className="text-xs font-medium">Who sees this</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {AUDIENCES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAud(a)}
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                draft.audiences.includes(a)
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300"
              }`}
            >
              {audienceLabel(a)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
          Save
        </button>
        <button type="button" onClick={onCancel} className="text-xs underline">
          Cancel
        </button>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HowToButton } from "@/components/v2/HowToPop";
import {
  CONNECTION_CARDS,
  SEATS,
  SEAT_LABEL,
  emptyYou,
  looksLikeUrl,
  type ControlConnections,
  type ControlPerson,
  type ControlYou,
} from "@/lib/control";
import { kindTitle, type HouseEvent } from "@/lib/house";
import { DEFAULT_NAME_SET, NAME_SETS, PLANS, type PlanId } from "@/lib/plans";
import { saveFolders } from "@/lib/folders";

const PIN_KEY = "vowfolk-pinterest-board";
const names = NAME_SETS.find((s) => s.id === DEFAULT_NAME_SET) || NAME_SETS[0];

type Payload = {
  you: ControlYou;
  hasPassword: boolean;
  plan: PlanId;
  connections: ControlConnections;
  people: ControlPerson[];
  events: HouseEvent[];
  activeId: string | null;
};

export function ControlPanel() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [you, setYou] = useState<ControlYou>(emptyYou());
  const [hasPassword, setHasPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [againPw, setAgainPw] = useState("");
  const [plan, setPlan] = useState<PlanId>("good");
  const [connections, setConnections] = useState<ControlConnections>({});
  const [people, setPeople] = useState<ControlPerson[]>([]);
  const [events, setEvents] = useState<HouseEvent[]>([]);
  const [guest, setGuest] = useState({ name: "", email: "", seat: "family" });

  function apply(data: Partial<Payload>) {
    if (data.you) setYou({ ...emptyYou(), ...data.you });
    if (typeof data.hasPassword === "boolean") setHasPassword(data.hasPassword);
    if (data.plan) setPlan(data.plan);
    if (data.connections) setConnections(data.connections);
    if (data.people) setPeople(data.people);
    if (data.events) setEvents(data.events);
  }

  useEffect(() => {
    fetch("/api/control")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        apply(data);
      })
      .catch(() => {});
  }, []);

  function persistLocal(next: ControlConnections) {
    saveFolders({ drive: next.drive, onedrive: next.onedrive, icloud: next.icloud });
    try {
      if (next.pinterest) localStorage.setItem(PIN_KEY, next.pinterest);
      else localStorage.removeItem(PIN_KEY);
    } catch {
      /* ignore */
    }
  }

  async function post(body: Record<string, unknown>, label: string) {
    setBusy(label);
    setMsg(null);
    const res = await fetch("/api/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) {
      setMsg(data.error || "Could not save");
      return false;
    }
    apply(data);
    setMsg("Saved");
    router.refresh();
    return true;
  }

  async function saveYou(e: React.FormEvent) {
    e.preventDefault();
    await post({ action: "you", you }, "you");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (nextPw !== againPw) {
      setMsg("New passwords do not match.");
      return;
    }
    const ok = await post({ action: "password", current: currentPw, next: nextPw }, "password");
    if (ok) {
      setCurrentPw("");
      setNextPw("");
      setAgainPw("");
    }
  }

  async function saveConnections(e: React.FormEvent) {
    e.preventDefault();
    persistLocal(connections);
    await post({ action: "connections", connections }, "connections");
  }

  async function savePlan(id: PlanId) {
    setPlan(id);
    await post({ action: "plan", plan: id }, "plan");
  }

  async function addPerson(e: React.FormEvent) {
    e.preventDefault();
    const ok = await post({ action: "add-person", ...guest }, "people");
    if (ok) setGuest({ name: "", email: "", seat: "family" });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    document.cookie = "wedding_os_user=; Max-Age=0; path=/";
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-16">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Account</p>
        <h1 className="font-serif text-4xl">Control</h1>
        <p className="mt-1 text-sm text-muted">You, the pipes, the plan. The wedding itself stays in Settings.</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <HowToButton id="control" />
          <Link href="/settings" className="underline">
            Wedding settings
          </Link>
        </div>
      </div>

      {msg ? <p className="text-sm text-moss">{msg}</p> : null}

      <form onSubmit={saveYou} className="space-y-3 rounded-2xl border border-line bg-surface/60 p-5 text-sm">
        <p className="font-medium">You</p>
        <label className="block">
          <span className="text-xs text-muted">Name</span>
          <input
            value={you.name}
            onChange={(e) => setYou((y) => ({ ...y, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Email</span>
          <input
            type="email"
            value={you.email}
            onChange={(e) => setYou((y) => ({ ...y, email: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs text-muted">Phone</span>
            <input
              value={you.phone}
              onChange={(e) => setYou((y) => ({ ...y, phone: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
            />
          </label>
          <label>
            <span className="text-xs text-muted">Timezone</span>
            <input
              value={you.timezone}
              onChange={(e) => setYou((y) => ({ ...y, timezone: e.target.value }))}
              placeholder="America/New_York"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs text-muted">Photo URL</span>
          <input
            value={you.photoUrl}
            onChange={(e) => setYou((y) => ({ ...y, photoUrl: e.target.value }))}
            placeholder="https://…"
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-xs text-ivory">
          {busy === "you" ? "Saving…" : "Save you"}
        </button>
      </form>

      <form onSubmit={savePassword} className="space-y-3 rounded-2xl border border-line bg-surface/60 p-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium">{hasPassword ? "Change password" : "Set a password"}</p>
          <HowToButton id="password" />
        </div>
        <p className="text-xs text-muted">Stored as a hash on this desk. Google and Apple sign-in still live on Login.</p>
        {hasPassword ? (
          <label className="block">
            <span className="text-xs text-muted">Current</span>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-xs text-muted">New</span>
          <input
            type="password"
            value={nextPw}
            onChange={(e) => setNextPw(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Again</span>
          <input
            type="password"
            value={againPw}
            onChange={(e) => setAgainPw(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-xs text-ivory">
          {busy === "password" ? "Saving…" : "Save password"}
        </button>
      </form>

      <section className="space-y-3 rounded-2xl border border-line bg-surface/60 p-5 text-sm">
        <p className="font-medium">Plan</p>
        <p className="text-xs text-muted">Readout only. No card charged.</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {PLANS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => savePlan(p.id)}
              className={`rounded-2xl border px-3 py-3 text-left ${
                plan === p.id ? "border-moss bg-moss-soft" : "border-line"
              }`}
            >
              <span className="block font-serif text-lg">{names[p.id]}</span>
              <span className="block text-xs">
                {p.price}
                {p.cadence}
              </span>
              <span className="mt-1 block text-[11px] text-muted">{p.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={saveConnections} className="space-y-4 rounded-2xl border border-line bg-surface/60 p-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium">Connections</p>
          <span className="text-[11px] text-muted">Paste a URL. No OAuth yet.</span>
        </div>
        {CONNECTION_CARDS.map((card) => {
          const value = connections[card.id] || "";
          const ok = !value || looksLikeUrl(value);
          return (
            <div key={card.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p>
                  {card.title}
                  <span className="ml-2 text-[11px] text-muted">{card.line}</span>
                </p>
                <HowToButton id={card.how} />
              </div>
              <input
                value={value}
                onChange={(e) => setConnections((c) => ({ ...c, [card.id]: e.target.value }))}
                placeholder={card.placeholder}
                className={`w-full rounded-lg border bg-paper px-3 py-2 ${
                  ok ? "border-line" : "border-clay"
                }`}
              />
              <div className="flex flex-wrap gap-2 text-[11px]">
                {card.open ? (
                  <a href={card.open} target="_blank" rel="noreferrer" className="underline">
                    Open {card.title}
                  </a>
                ) : null}
                {value && looksLikeUrl(value) ? (
                  <a href={value} target="_blank" rel="noreferrer" className="underline">
                    Open saved link
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-xs text-ivory">
          {busy === "connections" ? "Saving…" : "Save connections"}
        </button>
      </form>

      <section className="space-y-3 rounded-2xl border border-line bg-surface/60 p-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium">People at the house</p>
          <HowToButton id="house-people" />
        </div>
        <p className="text-xs text-muted">Seats on this account. Email invite is later. Sit together until then.</p>
        <ul className="space-y-2">
          {people.length === 0 ? <li className="text-xs text-muted">No one added yet besides you.</li> : null}
          {people.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2">
              <span>
                <span className="block font-medium">{p.name}</span>
                <span className="text-[11px] text-muted">
                  {SEAT_LABEL[p.seat]} · {p.status}
                  {p.email ? ` · ${p.email}` : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={() => post({ action: "remove-person", id: p.id }, "people")}
                className="text-[11px] underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addPerson} className="grid gap-2 sm:grid-cols-2">
          <input
            value={guest.name}
            onChange={(e) => setGuest((g) => ({ ...g, name: e.target.value }))}
            placeholder="Name"
            className="rounded-lg border border-line bg-paper px-3 py-2"
          />
          <input
            type="email"
            value={guest.email}
            onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
            placeholder="Email"
            className="rounded-lg border border-line bg-paper px-3 py-2"
          />
          <select
            value={guest.seat}
            onChange={(e) => setGuest((g) => ({ ...g, seat: e.target.value }))}
            className="rounded-lg border border-line bg-paper px-3 py-2"
          >
            {SEATS.map((s) => (
              <option key={s} value={s}>
                {SEAT_LABEL[s]}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-xs text-ivory">
            {busy === "people" ? "Saving…" : "Add person"}
          </button>
        </form>
      </section>

      <section className="space-y-3 rounded-2xl border border-line bg-surface/60 p-5 text-sm">
        <p className="font-medium">Events in this house</p>
        <ul className="space-y-2">
          {events.map((ev) => (
            <li key={ev.id} className="rounded-xl border border-line px-3 py-2">
              <p className="font-medium">{ev.title}</p>
              <p className="text-[11px] text-muted">
                {kindTitle(ev.kind)}
                {ev.date ? ` · ${ev.date}` : ""}
                {ev.active ? " · active" : ""}
              </p>
            </li>
          ))}
        </ul>
        <Link href="/intake?new=1" className="inline-flex rounded-full bg-ink px-4 py-2 text-xs text-ivory">
          Add event
        </Link>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={logout} className="rounded-full border border-line px-4 py-2 text-xs">
          Sign out
        </button>
        <Link href="/login" className="rounded-full border border-line px-4 py-2 text-xs">
          Login (Google / Apple later)
        </Link>
      </div>
    </div>
  );
}

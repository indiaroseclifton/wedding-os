"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { COVER_PRESETS, FAITHS, PACK_OPTIONS, THEMES } from "@/lib/preferences";
import { applyTheme } from "@/components/theme/ThemeProvider";

export default function SettingsPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    coupleNames: "",
    weddingDate: "",
    location: "",
    coverUrl: "",
    theme: "linen",
    faith: "none",
    faithPacks: [] as string[],
    ceremonyStyle: "both",
    formality: "",
    weekend: "saturday",
    partnerA: "",
    partnerB: "",
    timezone: "",
    kidsWelcome: true,
    unplugged: false,
    guestSitePublic: true,
    defaultPlusOnes: 0,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.meta) return;
        setForm((f) => ({
          ...f,
          name: data.meta.name || "",
          coupleNames: data.meta.coupleNames || "",
          weddingDate: data.meta.weddingDate || "",
          location: data.meta.location || "",
          coverUrl: data.meta.coverUrl || "",
          theme: data.meta.theme || "linen",
          faith: data.meta.faith || "none",
          faithPacks: data.meta.faithPacks || [],
          ceremonyStyle: data.meta.ceremonyStyle || "both",
          formality: data.meta.formality || "",
          weekend: data.meta.weekend || "saturday",
          partnerA: data.meta.partnerA || "",
          partnerB: data.meta.partnerB || "",
          timezone: data.meta.timezone || "",
          kidsWelcome: data.meta.kidsWelcome !== false,
          unplugged: !!data.meta.unplugged,
          guestSitePublic: data.meta.guestSitePublic !== false,
          defaultPlusOnes: data.meta.defaultPlusOnes || 0,
        }));
        if (data.meta.theme) applyTheme(data.meta.theme);
      })
      .catch(() => {});
  }, []);

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setMsg("Could not save");
      return;
    }
    applyTheme(form.theme);
    setMsg(
      form.faith && form.faith !== "none"
        ? "Saved. Religious items are now on your Planning checklist."
        : "Saved"
    );
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    document.cookie = "wedding_os_user=; Max-Age=0; path=/";
    router.push("/login");
    router.refresh();
  }

  async function seed() {
    const res = await fetch("/api/dev/seed", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setMsg(data.seeded ? "Sample data added" : "Already seeded (or failed)");
  }

  async function resetSample() {
    if (!confirmReset) {
      setConfirmReset(true);
      setMsg("This wipes sample data and reseeds. Click again to confirm.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/dev/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json().catch(() => ({}));
      setMsg(data.seeded ? "Sample data reset" : "Reset failed");
      setConfirmReset(false);
      router.refresh();
    } catch {
      setMsg("Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-16">
      <div>
        <h1 className="font-serif text-4xl">Settings</h1>
        <p className="mt-1 text-sm text-muted">The wedding, how the desk looks, and what the checklist includes.</p>
      </div>

      <form onSubmit={save} className="space-y-3 glass-panel rounded-2xl p-5 text-sm">
        <p className="font-medium">Wedding</p>
        <label className="block">
          <span className="text-xs text-muted">Wedding name</span>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-xs text-muted">How you two are written</span>
          <input value={form.coupleNames} onChange={(e) => set("coupleNames", e.target.value)} placeholder="India & …" className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs text-muted">Partner A</span>
            <input value={form.partnerA} onChange={(e) => set("partnerA", e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
          </label>
          <label>
            <span className="text-xs text-muted">Partner B</span>
            <input value={form.partnerB} onChange={(e) => set("partnerB", e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs text-muted">Date</span>
            <input type="date" value={form.weddingDate} onChange={(e) => set("weddingDate", e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
          </label>
          <label>
            <span className="text-xs text-muted">City</span>
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Atlanta, GA" className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
          </label>
        </div>
        <label>
          <span className="text-xs text-muted">Timezone</span>
          <input value={form.timezone} onChange={(e) => set("timezone", e.target.value)} placeholder="America/New_York" className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
        </label>
      </form>

      <section className="space-y-3 glass-panel rounded-2xl p-5 text-sm">
        <p className="font-medium">Look & feel</p>
        <p className="text-xs text-muted">The whole desk changes — paper, type contrast, buttons.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                set("theme", t.id);
                applyTheme(t.id);
              }}
              className={`rounded-xl border p-3 text-left ${
                form.theme === t.id ? "border-moss ring-2 ring-moss/30" : "border-line"
              }`}
              style={{ background: t.paper, color: t.ink }}
            >
              <span className="mb-2 block h-2 w-8 rounded-full" style={{ background: t.moss }} />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">Cover photo</p>
        <div className="grid grid-cols-5 gap-2">
          {COVER_PRESETS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => set("coverUrl", c.url)}
              className={`overflow-hidden rounded-lg ${form.coverUrl === c.url ? "ring-2 ring-moss" : ""}`}
            >
              <img src={c.url} alt={c.label} className="h-12 w-full object-cover" />
            </button>
          ))}
        </div>
        <input
          value={form.coverUrl}
          onChange={(e) => set("coverUrl", e.target.value)}
          placeholder="Or paste your own photo URL"
          className="w-full rounded-lg border border-line bg-surface/70 px-3 py-2 text-xs"
        />
      </section>

      <section className="space-y-3 glass-panel rounded-2xl p-5 text-sm">
        <p className="font-medium">Ceremony & faith</p>
        <p className="text-xs text-muted">
          This is what changes the checklist. Pick Jewish, Hindu, Catholic… and those items appear under Planning → Checklist → Faith.
        </p>
        <label className="block">
          <span className="text-xs text-muted">Tradition</span>
          <select
            value={form.faith}
            onChange={(e) => set("faith", e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2"
          >
            {FAITHS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        {(form.faith === "interfaith" || form.faith === "none") && (
          <div>
            <p className="text-xs text-muted">Add extra packs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PACK_OPTIONS.map((p) => {
                const on = form.faithPacks.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      set(
                        "faithPacks",
                        on ? form.faithPacks.filter((x) => x !== p.id) : [...form.faithPacks, p.id]
                      )
                    }
                    className={`rounded-full px-3 py-1 text-xs ${on ? "bg-moss text-ivory" : "border border-line"}`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs text-muted">Ceremony style</span>
            <select value={form.ceremonyStyle} onChange={(e) => set("ceremonyStyle", e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2">
              <option value="religious">Religious</option>
              <option value="civil">Civil / courthouse</option>
              <option value="both">Both</option>
            </select>
          </label>
          <label>
            <span className="text-xs text-muted">Day</span>
            <select value={form.weekend} onChange={(e) => set("weekend", e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2">
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
              <option value="weekday">Weekday</option>
            </select>
          </label>
        </div>
        <label>
          <span className="text-xs text-muted">Formality</span>
          <select value={form.formality} onChange={(e) => set("formality", e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2">
            <option value="">Not set</option>
            <option>Black tie</option>
            <option>Cocktail</option>
            <option>Garden party</option>
            <option>Casual</option>
          </select>
        </label>
        <Link href="/traditions" className="inline-block text-xs underline">
          See the full tradition checklist
        </Link>
      </section>

      <section className="space-y-3 glass-panel rounded-2xl p-5 text-sm">
        <p className="font-medium">Guests</p>
        <label className="flex items-center justify-between gap-3">
          <span>Kids welcome</span>
          <input type="checkbox" checked={form.kidsWelcome} onChange={(e) => set("kidsWelcome", e.target.checked)} />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>Unplugged ceremony</span>
          <input type="checkbox" checked={form.unplugged} onChange={(e) => set("unplugged", e.target.checked)} />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span>Guest site is public</span>
          <input type="checkbox" checked={form.guestSitePublic} onChange={(e) => set("guestSitePublic", e.target.checked)} />
        </label>
        <label>
          <span className="text-xs text-muted">Default plus-ones</span>
          <input
            type="number"
            min={0}
            max={4}
            value={form.defaultPlusOnes}
            onChange={(e) => set("defaultPlusOnes", Number(e.target.value))}
            className="mt-1 w-24 rounded-lg border border-line bg-surface/70 px-3 py-2"
          />
        </label>
        <Link href="/guests" className="inline-block text-xs underline">
          Import contacts from your phone
        </Link>
      </section>

      <button
        type="button"
        onClick={() => save()}
        disabled={saving}
        className="rounded-full bg-moss px-5 py-2.5 text-sm font-medium text-ivory disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
      {msg && <p className="text-xs text-moss">{msg}</p>}

      <section className="space-y-3 glass-panel rounded-2xl p-5 text-sm">
        <p className="font-medium">Phone</p>
        <p className="text-muted">
          Put the desk on a home screen now. The App Store is a later step — listed in order.
        </p>
        <Link href="/mobile" className="inline-block rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          Mobile steps
        </Link>
      </section>

      <section className="space-y-3 glass-panel rounded-2xl p-5 text-sm">
        <p className="font-medium">Session</p>
        <button type="button" onClick={logout} className="rounded-full border border-line px-4 py-2 text-sm">
          Log out
        </button>
      </section>

      <section className="space-y-3 glass-panel rounded-2xl p-5 text-sm">
        <p className="font-medium">Sample data</p>
        <button type="button" onClick={seed} className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">
          Load sample data
        </button>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={resetSample} className="rounded-full border border-clay px-4 py-2 text-sm text-clay">
            {confirmReset ? "Confirm reset" : "Reset sample data"}
          </button>
          {confirmReset && (
            <button type="button" onClick={() => setConfirmReset(false)} className="text-xs underline">
              Cancel
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

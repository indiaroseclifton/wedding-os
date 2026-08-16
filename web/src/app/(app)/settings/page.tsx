"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { COVER_PRESETS, DENSITY, FAITHS, GLASS_LEVELS, MOTION, PACK_OPTIONS, THEMES, TYPE_SCALES } from "@/lib/preferences";
import { applyLook, applyTheme } from "@/components/theme/ThemeProvider";
import { ENTER_CARDS, SHAPE_CARDS, type EnterHow, type WeddingShape } from "@/lib/shape";

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
    glass: "mid" as "low" | "mid" | "high",
    density: "regular" as "roomy" | "regular" | "compact",
    typeScale: "regular" as "small" | "regular" | "large",
    motion: "calm" as "off" | "calm" | "lively",
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
    shape: "weekend" as WeddingShape,
    enterHow: "one-then" as EnterHow,
    gatheringDate: "",
    applyShapeDefaults: false,
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
          glass: data.meta.glass || "mid",
          density: data.meta.density || "regular",
          typeScale: data.meta.typeScale || "regular",
          motion: data.meta.motion || "calm",
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
          shape: data.meta.shape || "weekend",
          enterHow: data.meta.enterHow || "one-then",
          gatheringDate: data.meta.gatheringDate || "",
          applyShapeDefaults: false,
        }));
        if (data.meta.theme || data.meta.glass) {
          applyLook({
            theme: data.meta.theme,
            glass: data.meta.glass,
            density: data.meta.density,
            typeScale: data.meta.typeScale,
            motion: data.meta.motion,
          });
        }
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
    applyLook({ theme: form.theme, glass: form.glass, density: form.density, typeScale: form.typeScale });
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
            <span className="text-xs text-muted">{form.shape === "two" ? "Marrying date" : "Date"}</span>
            <input type="date" value={form.weddingDate} onChange={(e) => set("weddingDate", e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
          </label>
          <label>
            <span className="text-xs text-muted">City</span>
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Atlanta, GA" className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
          </label>
        </div>
        {form.shape === "two" && (
          <label>
            <span className="text-xs text-muted">Gathering date</span>
            <input type="date" value={form.gatheringDate} onChange={(e) => set("gatheringDate", e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
          </label>
        )}
        <div>
          <p className="text-xs text-muted">The shape of the day</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SHAPE_CARDS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set("shape", c.id)}
                className={`overflow-hidden rounded-2xl border text-left ${
                  form.shape === c.id ? "border-moss ring-2 ring-moss/30" : "border-line"
                }`}
              >
                <img src={c.cover} alt="" className="h-20 w-full object-cover" />
                <span className="block px-3 py-2">
                  <span className="block font-serif text-lg">{c.title}</span>
                  <span className="text-[11px] text-muted">{c.line}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted">How you enter</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {ENTER_CARDS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set("enterHow", c.id)}
                className={`rounded-xl border px-3 py-3 text-left ${
                  form.enterHow === c.id ? "border-moss bg-moss-soft" : "border-line"
                }`}
              >
                <span className="block text-sm font-medium">{c.title}</span>
                <span className="text-[11px] text-muted">{c.line}</span>
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.applyShapeDefaults}
            onChange={(e) => set("applyShapeDefaults", e.target.checked)}
            className="mt-1"
          />
          <span>
            Reset checklist and day plan to this shape.
            <span className="block text-xs text-muted">Keeps anything you’ve already checked off. Money stays.</span>
          </span>
        </label>
        <label>
          <span className="text-xs text-muted">Timezone</span>
          <input value={form.timezone} onChange={(e) => set("timezone", e.target.value)} placeholder="America/New_York" className="mt-1 w-full rounded-lg border border-line bg-surface/70 px-3 py-2" />
        </label>
      </form>

      <section className="space-y-4 glass-panel rounded-2xl p-5 text-sm">
        <p className="font-medium">Look & feel</p>
        <p className="text-xs text-muted">Twelve themes. Glass, spacing, and type — the whole desk changes.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                set("theme", t.id);
                applyLook({ theme: t.id, glass: form.glass, density: form.density, typeScale: form.typeScale, motion: form.motion });
              }}
              className={`rounded-xl border p-3 text-left ${
                form.theme === t.id ? "border-moss ring-2 ring-moss/30" : "border-line"
              }`}
              style={{ background: t.paper, color: t.ink }}
            >
              <span className="mb-2 flex gap-1">
                <i className="block h-2 w-6 rounded-full" style={{ background: t.moss }} />
                <i className="block h-2 w-3 rounded-full opacity-50" style={{ background: t.ink }} />
              </span>
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
        <div>
          <p className="mb-1 text-xs text-muted">Glass</p>
          <div className="flex flex-wrap gap-2">
            {GLASS_LEVELS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  set("glass", g.id);
                  applyLook({ glass: g.id });
                }}
                className={`min-h-11 rounded-full px-3 py-1.5 text-xs ${
                  form.glass === g.id ? "bg-moss text-ivory" : "border border-line"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          {form.glass === "high" && (
            <p className="mt-2 text-xs text-clay">
              Frost looks beautiful and can fail contrast on busy photos. Use Matte if anyone is reading this in bright sun.
            </p>
          )}
        </div>
        <div>
          <p className="mb-1 text-xs text-muted">Spacing</p>
          <div className="flex flex-wrap gap-2">
            {DENSITY.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  set("density", d.id);
                  applyLook({ density: d.id });
                }}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  form.density === d.id ? "bg-moss text-ivory" : "border border-line"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs text-muted">Type size</p>
          <div className="flex flex-wrap gap-2">
            {TYPE_SCALES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  set("typeScale", d.id);
                  applyLook({ typeScale: d.id });
                }}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  form.typeScale === d.id ? "bg-moss text-ivory" : "border border-line"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs text-muted">Motion</p>
          <div className="flex flex-wrap gap-2">
            {MOTION.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  set("motion", d.id);
                  applyLook({ motion: d.id });
                }}
                className={`min-h-11 rounded-full px-3 py-1.5 text-xs ${
                  form.motion === d.id ? "bg-moss text-ivory" : "border border-line"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Still stops the home photo and all motion. Calm is the desk. Lively is a little more.</p>
        </div>
        <p className="text-xs text-muted">Cover photo</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
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
        <button
          type="button"
          onClick={() => save()}
          className="rounded-full bg-moss px-4 py-2 text-xs font-medium text-ivory"
        >
          {saving ? "Saving…" : "Save look"}
        </button>
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
      {msg && (
        <p role="status" aria-live="polite" className="text-xs text-moss">
          {msg}
        </p>
      )}

      <section className="space-y-3 glass-panel rounded-2xl p-5 text-sm">
        <p className="font-medium">Phone</p>
        <p className="text-muted">
          Put the desk on a home screen now. The App Store is a later step — listed in order.
        </p>
        <Link href="/mobile" className="inline-block rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          Mobile steps
        </Link>
        <Link href="/improvements" className="ml-2 inline-block text-xs underline">
          All improvements
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

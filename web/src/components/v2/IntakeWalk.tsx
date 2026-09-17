"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HowToButton } from "@/components/v2/HowToPop";
import { driveEmbed, saveFolders } from "@/lib/folders";
import { ENTER_CARDS, SHAPE_CARDS, type EnterHow, type WeddingShape } from "@/lib/shape";

const KEY = "vowfolk-intake";
const PIC_KEY = "vowfolk-intake-pics";

type Draft = {
  partnerA: string;
  partnerB: string;
  weddingDate: string;
  location: string;
  shape: WeddingShape | "";
  enterHow: EnterHow | "";
  have: string[];
  diyBias: "hire" | "diy" | "mix" | "";
  guests: string;
  cap: string;
  thoughts: string;
  pinterest: string;
  drive: string;
  onedrive: string;
  icloud: string;
  imageLinks: string;
};

const EMPTY: Draft = {
  partnerA: "",
  partnerB: "",
  weddingDate: "",
  location: "",
  shape: "",
  enterHow: "",
  have: [],
  diyBias: "",
  guests: "",
  cap: "",
  thoughts: "",
  pinterest: "",
  drive: "",
  onedrive: "",
  icloud: "",
  imageLinks: "",
};

const HAVE = [
  { id: "date", label: "A date" },
  { id: "place", label: "A place" },
  { id: "list", label: "A guest list, even messy" },
  { id: "food", label: "Food spoken for" },
  { id: "photo", label: "Someone to take pictures" },
  { id: "clothes", label: "Clothes in motion" },
  { id: "paper", label: "Paper started" },
  { id: "drive", label: "A Drive or photo folder" },
  { id: "nothing", label: "Almost nothing yet" },
];

function load(): Draft {
  try {
    return { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY) || "{}") as Draft) };
  } catch {
    return EMPTY;
  }
}

export function IntakeWalk() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDraft(load());
    try {
      const saved = JSON.parse(localStorage.getItem(PIC_KEY) || "[]") as string[];
      if (Array.isArray(saved)) setPhotos(saved.filter((x) => typeof x === "string").slice(0, 8));
    } catch {
      /* ignore */
    }
  }, []);

  function patch(next: Partial<Draft>) {
    const merged = { ...draft, ...next };
    setDraft(merged);
    try {
      localStorage.setItem(KEY, JSON.stringify(merged));
    } catch {
      /* ignore */
    }
  }

  function toggleHave(id: string) {
    const have = draft.have.includes(id) ? draft.have.filter((x) => x !== id) : [...draft.have.filter((x) => x !== "nothing"), id];
    patch({ have: id === "nothing" ? ["nothing"] : have.filter((x) => x !== "nothing") });
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const next = [...photos];
    for (const file of Array.from(files).slice(0, 8 - next.length)) {
      if (!file.type.startsWith("image/")) continue;
      next.push(URL.createObjectURL(file));
    }
    setPhotos(next);
    try {
      localStorage.setItem(PIC_KEY, JSON.stringify(next.filter((u) => u.startsWith("http"))));
    } catch {
      /* ignore */
    }
  }

  async function finish() {
    setSaving(true);
    const names = [draft.partnerA, draft.partnerB].filter(Boolean).join(" & ");
    const cover = draft.imageLinks.split(/\s+/).find((u) => /^https?:\/\//i.test(u));
    await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerA: draft.partnerA || undefined,
        partnerB: draft.partnerB || undefined,
        coupleNames: names || undefined,
        name: names ? `${names}'s wedding` : undefined,
        weddingDate: draft.weddingDate || undefined,
        location: draft.location || undefined,
        shape: draft.shape || undefined,
        enterHow: draft.enterHow || undefined,
        diyBias: draft.diyBias || undefined,
        coverUrl: cover,
        applyShapeDefaults: !!draft.shape,
        onboarded: true,
        firstWalkDone: true,
      }),
    });
    try {
      if (draft.pinterest.trim()) localStorage.setItem("vowfolk-pinterest-board", draft.pinterest.trim());
      saveFolders({
        drive: draft.drive.trim() || undefined,
        onedrive: draft.onedrive.trim() || undefined,
        icloud: draft.icloud.trim() || undefined,
      });
    } catch {
      /* ignore */
    }
    setSaving(false);
    setDone(true);
    router.refresh();
  }

  const screens = [
    { kicker: "Begin", title: "Who is this for?", body: "Two names. Nicknames are fine." },
    { kicker: "When", title: "Do you have a date?", body: "If you do not, leave it blank." },
    { kicker: "Where", title: "What city is this in?", body: "A city is enough. A venue name if you have one." },
    { kicker: "Already true", title: "What is already in motion?", body: "So we do not ask you to start things you finished." },
    { kicker: "Shape", title: "What kind of day is it?", body: "This hides work you will not need." },
    { kicker: "Enter", title: "How do you come into the room?", body: "Skip if you have not thought about it." },
    { kicker: "Make or hire", title: "What is the leaning?", body: "Most people mix." },
    { kicker: "Size", title: "How many people, roughly?", body: "A guess. Not the list." },
    { kicker: "Money", title: "Is there a number you are trying not to pass?", body: "Skip if you cannot say it yet." },
    { kicker: "Images", title: "Pictures you already have", body: "From your camera roll, or links. A few is enough." },
    { kicker: "Pinterest", title: "A board, if you have one", body: "Public boards only. Secret will not show." },
    { kicker: "Folders", title: "A folder you already use", body: "Paste a share link. Anyone with the link, viewer. No API." },
    { kicker: "On your mind", title: "What is loud right now?", body: "One sentence." },
  ];

  const last = screens.length - 1;
  const screen = screens[step];
  const embed = driveEmbed(draft.drive);

  if (done) {
    return (
      <div className="mx-auto max-w-xl space-y-6 pb-16">
        <p className="kicker kicker-moss">The desk is open</p>
        <h1 className="font-serif text-4xl">We started from what you already know.</h1>
        <p className="text-sm leading-6 text-muted">Pictures and folders stay with the desk. Open them when you need them.</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard" className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">Open Home</Link>
          <Link href="/planning/vision" className="rounded-full border border-line px-4 py-2 text-sm">Vision</Link>
          {draft.drive ? (
            <a href={draft.drive} target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-2 text-sm">
              Open Drive
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-16">
      <div className="flex items-center justify-between gap-3">
        <p className="kicker kicker-moss">{screen.kicker}</p>
        <HowToButton id="intake" />
      </div>
      <p className="text-xs tabular-nums text-muted">
        {step + 1} / {screens.length}
      </p>
      <h1 className="font-serif text-4xl">{screen.title}</h1>
      <p className="text-sm leading-6 text-muted">{screen.body}</p>

      {step === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">One of you<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={draft.partnerA} onChange={(e) => patch({ partnerA: e.target.value })} /></label>
          <label className="text-sm">The other<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={draft.partnerB} onChange={(e) => patch({ partnerB: e.target.value })} /></label>
        </div>
      ) : null}

      {step === 1 ? (
        <label className="block text-sm">Date<input type="date" className="mt-1 w-full rounded-lg border border-line px-3 py-2" value={draft.weddingDate} onChange={(e) => patch({ weddingDate: e.target.value })} /></label>
      ) : null}

      {step === 2 ? (
        <label className="block text-sm">City or venue<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" placeholder="Atlanta, or the garden name" value={draft.location} onChange={(e) => patch({ location: e.target.value })} /></label>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-wrap gap-2">
          {HAVE.map((item) => (
            <button key={item.id} type="button" onClick={() => toggleHave(item.id)} className={`rounded-full px-3 py-2 text-sm ${draft.have.includes(item.id) ? "bg-ink text-ivory" : "border border-line"}`}>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {SHAPE_CARDS.map((card) => (
            <button key={card.id} type="button" onClick={() => patch({ shape: card.id })} className={`rounded-2xl border px-4 py-4 text-left ${draft.shape === card.id ? "border-ink bg-ink text-ivory" : "border-line"}`}>
              <p className="font-serif text-xl">{card.title}</p>
              <p className={`mt-1 text-xs ${draft.shape === card.id ? "text-ivory/70" : "text-muted"}`}>{card.line}</p>
            </button>
          ))}
        </div>
      ) : null}

      {step === 5 ? (
        <div className="grid gap-2">
          {ENTER_CARDS.map((card) => (
            <button key={card.id} type="button" onClick={() => patch({ enterHow: card.id })} className={`rounded-2xl border px-4 py-3 text-left ${draft.enterHow === card.id ? "border-ink bg-ink text-ivory" : "border-line"}`}>
              <p className="font-medium">{card.title}</p>
              <p className={`text-xs ${draft.enterHow === card.id ? "text-ivory/70" : "text-muted"}`}>{card.line}</p>
            </button>
          ))}
        </div>
      ) : null}

      {step === 6 ? (
        <div className="grid gap-2">
          {([["hire", "Mostly hire", "People we pay do the making."], ["mix", "A mix", "We make some things. We hire the rest."], ["diy", "Mostly make", "Studio is the point."]] as const).map(([id, title, line]) => (
            <button key={id} type="button" onClick={() => patch({ diyBias: id })} className={`rounded-2xl border px-4 py-3 text-left ${draft.diyBias === id ? "border-ink bg-ink text-ivory" : "border-line"}`}>
              <p className="font-medium">{title}</p>
              <p className={`text-xs ${draft.diyBias === id ? "text-ivory/70" : "text-muted"}`}>{line}</p>
            </button>
          ))}
        </div>
      ) : null}

      {step === 7 ? (
        <label className="block text-sm">About how many guests<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" inputMode="numeric" placeholder="40, 120" value={draft.guests} onChange={(e) => patch({ guests: e.target.value })} /></label>
      ) : null}

      {step === 8 ? (
        <label className="block text-sm">Cap in dollars<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" inputMode="numeric" placeholder="25000" value={draft.cap} onChange={(e) => patch({ cap: e.target.value })} /></label>
      ) : null}

      {step === 9 ? (
        <div className="space-y-3">
          <label className="block text-sm">
            From this computer
            <input type="file" accept="image/*" multiple className="mt-1 block w-full text-sm" onChange={(e) => addFiles(e.target.files)} />
          </label>
          <label className="block text-sm">
            Or paste image links, one per line
            <textarea className="mt-1 w-full rounded-lg border border-line px-3 py-2" rows={3} value={draft.imageLinks} onChange={(e) => patch({ imageLinks: e.target.value })} />
          </label>
          {photos.length || draft.imageLinks.trim() ? (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((src) => (
                <img key={src} src={src} alt="" className="aspect-square rounded-lg object-cover" />
              ))}
              {draft.imageLinks.split(/\s+/).filter((u) => /^https?:\/\//i.test(u)).slice(0, 4).map((src) => (
                <img key={src} src={src} alt="" className="aspect-square rounded-lg object-cover" />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 10 ? (
        <label className="block text-sm">Pinterest board URL<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" placeholder="https://www.pinterest.com/you/wedding/" value={draft.pinterest} onChange={(e) => patch({ pinterest: e.target.value })} /></label>
      ) : null}

      {step === 11 ? (
        <div className="space-y-3">
          <label className="block text-sm">Google Drive folder<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" placeholder="https://drive.google.com/drive/folders/…" value={draft.drive} onChange={(e) => patch({ drive: e.target.value })} /></label>
          <label className="block text-sm">OneDrive / Microsoft<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" placeholder="https://onedrive.live.com/…" value={draft.onedrive} onChange={(e) => patch({ onedrive: e.target.value })} /></label>
          <label className="block text-sm">iCloud<input className="mt-1 w-full rounded-lg border border-line px-3 py-2" placeholder="https://www.icloud.com/…" value={draft.icloud} onChange={(e) => patch({ icloud: e.target.value })} /></label>
          <p className="text-xs text-muted">Share as anyone with the link, viewer. Contracts stay out of a public folder.</p>
          {embed ? <iframe title="Drive folder" src={embed} className="h-56 w-full rounded-xl border border-line bg-paper" /> : null}
        </div>
      ) : null}

      {step === 12 ? (
        <label className="block text-sm">What is loud<textarea className="mt-1 w-full rounded-lg border border-line px-3 py-2" rows={4} value={draft.thoughts} onChange={(e) => patch({ thoughts: e.target.value })} /></label>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pt-2">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-full border border-line px-4 py-2 text-sm">Back</button>
        ) : null}
        {step < last ? (
          <>
            <button type="button" onClick={() => setStep((s) => s + 1)} className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">Continue</button>
            <button type="button" onClick={() => setStep((s) => s + 1)} className="text-sm underline">Skip this</button>
          </>
        ) : (
          <button type="button" disabled={saving} onClick={finish} className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">{saving ? "Saving" : "Open the desk"}</button>
        )}
      </div>
    </div>
  );
}

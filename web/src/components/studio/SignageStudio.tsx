"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PALETTES,
  SIGN_KINDS,
  buildSignSvg,
  cricutPrep,
  defaultSign,
  fileName,
  materialsFor,
  type SignDesign,
  type SignKind,
  type SignPalette,
} from "@/lib/signage";

function downloadSvg(sign: SignDesign) {
  const svg = buildSignSvg(sign);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName(sign);
  a.click();
  URL.revokeObjectURL(url);
}

export function SignageStudio({ names, date }: { names: string; date: string }) {
  const prettyDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "";
  const [signs, setSigns] = useState<SignDesign[]>([]);
  const [sign, setSign] = useState<SignDesign>(() => ({
    ...defaultSign("welcome", names, prettyDate),
    id: "",
    token: "",
    updatedAt: "",
  }));
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"design" | "cricut" | "send">("design");

  async function load() {
    const res = await fetch("/api/signage");
    if (!res.ok) return;
    const data = await res.json();
    const list: SignDesign[] = data.signage?.signs || [];
    setSigns(list);
    if (list[0] && !sign.id) setSign(list[0]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const svg = useMemo(() => buildSignSvg(sign), [sign]);
  const prep = cricutPrep(sign);
  const mats = materialsFor(sign);

  function patch(p: Partial<SignDesign>) {
    setSign((s) => ({ ...s, ...p }));
  }

  function newKind(kind: SignKind) {
    setSign({
      ...defaultSign(kind, names, prettyDate),
      id: "",
      token: "",
      updatedAt: "",
    });
    setTab("design");
  }

  async function save() {
    const res = await fetch("/api/signage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", sign }),
    });
    if (!res.ok) {
      setMsg("Could not save");
      return;
    }
    const data = await res.json();
    setSign(data.sign);
    setSigns(data.signage.signs);
    setMsg("Saved");
  }

  async function packBox() {
    await save();
    const add = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", name: `${SIGN_KINDS.find((k) => k.id === sign.kind)?.label} signs`, zone: "Signage", takeTo: "Venue" }),
    });
    if (!add.ok) return;
    const data = await add.json();
    const box = data.inventory?.boxes?.at(-1);
    if (box) {
      for (const row of mats) {
        await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add_item", id: box.id, label: `${row.qty} ${row.item}` }),
        });
      }
    }
    setMsg("Packed into Boxes");
  }

  async function copyLink() {
    const res = await fetch("/api/signage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", sign }),
    });
    if (!res.ok) {
      setMsg("Save the sign first");
      return;
    }
    const data = await res.json();
    setSign(data.sign);
    setSigns(data.signage.signs);
    const url = `${window.location.origin}/s/${data.sign.token}`;
    await navigator.clipboard.writeText(url);
    setMsg("Link copied — they can download the SVG from there");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Studio</p>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,6vw,3.6rem)] leading-none tracking-tight">
            Signage & Cricut
          </h1>
          <p className="home-script mt-2">Design it here. Cut it yourself.</p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Cricut does not let apps send a file straight to the machine. You design here, download a cut-ready SVG, then Upload in Design Space. Same file you can send to whoever has the Cricut.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={save} className="btn btn-ghost">
            Save
          </button>
          <button type="button" onClick={() => downloadSvg(sign)} className="btn btn-primary">
            Download SVG
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {SIGN_KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => newKind(k.id)}
            className={`min-h-11 rounded-full px-4 text-sm ${
              sign.kind === k.id ? "bg-ink text-ivory" : "border border-line"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {signs.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {signs.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSign(s)}
              className={`min-h-9 rounded-full px-3 text-xs ${
                sign.id === s.id ? "bg-paper" : "text-muted underline"
              }`}
            >
              {SIGN_KINDS.find((k) => k.id === s.kind)?.label}
              {s.kind === "table" ? ` ${s.tableNo}` : ""}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_20rem]">
        <div
          className="flex min-h-[22rem] items-center justify-center rounded-2xl border border-line bg-surface p-4 [&_svg]:h-auto [&_svg]:max-h-[32rem] [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <aside className="space-y-4">
          <div className="flex gap-1 rounded-lg bg-paper p-1">
            {(["design", "cricut", "send"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`min-h-10 flex-1 rounded-md text-xs uppercase tracking-wide ${
                  tab === t ? "bg-surface font-medium" : "text-muted"
                }`}
              >
                {t === "cricut" ? "Cricut" : t}
              </button>
            ))}
          </div>

          {tab === "design" ? (
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="kicker">Heading</span>
                <input className="field mt-1" value={sign.heading} onChange={(e) => patch({ heading: e.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="kicker">Line under</span>
                <input className="field mt-1" value={sign.sub} onChange={(e) => patch({ sub: e.target.value })} />
              </label>
              {sign.kind === "welcome" ? (
                <>
                  <label className="block text-sm">
                    <span className="kicker">Names</span>
                    <input className="field mt-1" value={sign.names} onChange={(e) => patch({ names: e.target.value })} />
                  </label>
                  <label className="block text-sm">
                    <span className="kicker">Date</span>
                    <input className="field mt-1" value={sign.date} onChange={(e) => patch({ date: e.target.value })} />
                  </label>
                </>
              ) : null}
              {sign.kind === "table" ? (
                <label className="block text-sm">
                  <span className="kicker">Table number</span>
                  <input className="field mt-1" value={sign.tableNo} onChange={(e) => patch({ tableNo: e.target.value })} />
                </label>
              ) : null}
              {sign.kind === "bar" ? (
                <label className="block text-sm">
                  <span className="kicker">Drinks, one per line</span>
                  <textarea className="field mt-1 min-h-28" value={sign.extra} onChange={(e) => patch({ extra: e.target.value })} />
                </label>
              ) : null}
              <div>
                <p className="kicker">Color</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Object.keys(PALETTES) as SignPalette[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => patch({ palette: id })}
                      className={`h-9 w-9 rounded-full border ${sign.palette === id ? "border-ink" : "border-line"}`}
                      style={{ background: PALETTES[id].accent }}
                      aria-label={PALETTES[id].label}
                    />
                  ))}
                </div>
              </div>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={sign.vine} onChange={(e) => patch({ vine: e.target.checked })} />
                Vine flourish
              </label>
            </div>
          ) : null}

          {tab === "cricut" ? (
            <div className="space-y-3 text-sm">
              <dl className="space-y-2">
                <div className="flex justify-between gap-3"><dt className="text-muted">File</dt><dd>{prep.file}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Cut size</dt><dd>{prep.cut}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Mat</dt><dd>{prep.mat}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Machine</dt><dd className="text-right">{prep.machine}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Material</dt><dd className="text-right">{prep.material}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Layers</dt><dd className="text-right">{prep.layers}</dd></div>
              </dl>
              <ol className="list-decimal space-y-1 pl-4 text-muted">
                {prep.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <a href="https://design.cricut.com/" target="_blank" rel="noreferrer" className="btn btn-primary w-full">
                Open Design Space
              </a>
              <button type="button" onClick={() => downloadSvg(sign)} className="btn btn-ghost w-full">
                Download SVG first
              </button>
            </div>
          ) : null}

          {tab === "send" ? (
            <div className="space-y-3 text-sm">
              <p className="text-muted">
                Send the file, not a screenshot. Anyone with the link can download the same SVG and upload it in Design Space.
              </p>
              <button type="button" onClick={copyLink} className="btn btn-primary w-full">
                Copy share link
              </button>
              <button type="button" onClick={() => downloadSvg(sign)} className="btn btn-ghost w-full">
                Download SVG to attach
              </button>
              <button type="button" onClick={packBox} className="btn btn-ghost w-full">
                Pack materials into a box
              </button>
              <ul className="divide-y divide-line">
                {mats.map((m) => (
                  <li key={m.item} className="flex justify-between py-2">
                    <span>{m.item}</span>
                    <span className="text-muted">{m.qty}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {msg ? <p className="text-xs text-sage">{msg}</p> : null}
        </aside>
      </div>
    </div>
  );
}

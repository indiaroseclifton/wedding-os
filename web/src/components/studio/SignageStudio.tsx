"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GROUPS,
  PALETTES,
  SIGN_KINDS,
  STYLES,
  buildSignSvg,
  cricutPrep,
  defaultSign,
  fileName,
  materialsFor,
  specOf,
  type SignDesign,
  type SignGroup,
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
  const [group, setGroup] = useState<SignGroup>("signs");
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"design" | "cricut" | "send">("design");

  async function load() {
    const res = await fetch("/api/signage");
    if (!res.ok) return;
    const data = await res.json();
    const list: SignDesign[] = data.signage?.signs || [];
    setSigns(list);
    if (list[0] && !sign.id) setSign({ ...list[0], copies: list[0].copies || 1, style: list[0].style || "arch" });
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
    const next = {
      ...defaultSign(kind, names, prettyDate),
      id: "",
      token: "",
      updatedAt: "",
    };
    setSign(next);
    setGroup(specOf(kind).group);
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
      body: JSON.stringify({ action: "add", name: specOf(sign.kind).label, zone: "Cricut", takeTo: "Venue" }),
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
            Cricut
          </h1>
          <p className="home-script mt-2">Every cut for the day.</p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Signs, place cards, menus, toppers, napkin monograms, favor tags. Design here. Download the SVG. Upload in Design Space. Send the same file to whoever has the machine.
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
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroup(g.id)}
            className={`min-h-11 rounded-full px-4 text-sm ${
              group === g.id ? "bg-ink text-ivory" : "border border-line"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">{GROUPS.find((g) => g.id === group)?.line}</p>
      <div className="flex flex-wrap gap-2">
        {SIGN_KINDS.filter((k) => k.group === group).map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => newKind(k.id)}
            className={`min-h-11 rounded-full border px-4 text-sm ${
              sign.kind === k.id ? "border-ink bg-paper" : "border-line"
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
              onClick={() => {
                setSign({ ...s, copies: s.copies || 1, style: s.style || "arch" });
                setGroup(specOf(s.kind).group);
              }}
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
              {sign.kind === "welcome" || sign.kind === "topper" || sign.kind === "napkin" || sign.kind === "flute" || sign.kind === "favor" || sign.kind === "bag" ? (
                <>
                  <label className="block text-sm">
                    <span className="kicker">Names</span>
                    <input className="field mt-1" value={sign.names} onChange={(e) => patch({ names: e.target.value })} />
                  </label>
                  {sign.kind === "welcome" || sign.kind === "flute" ? (
                    <label className="block text-sm">
                      <span className="kicker">Date</span>
                      <input className="field mt-1" value={sign.date} onChange={(e) => patch({ date: e.target.value })} />
                    </label>
                  ) : null}
                </>
              ) : null}
              {sign.kind === "table" || sign.kind === "place" ? (
                <label className="block text-sm">
                  <span className="kicker">{sign.kind === "place" ? "Guest name" : "Table number"}</span>
                  <input
                    className="field mt-1"
                    value={sign.kind === "place" ? sign.heading : sign.tableNo}
                    onChange={(e) =>
                      sign.kind === "place" ? patch({ heading: e.target.value }) : patch({ tableNo: e.target.value })
                    }
                  />
                </label>
              ) : null}
              {sign.kind === "place" ? (
                <label className="block text-sm">
                  <span className="kicker">Table</span>
                  <input className="field mt-1" value={sign.tableNo} onChange={(e) => patch({ tableNo: e.target.value })} />
                </label>
              ) : null}
              {sign.kind === "bar" || sign.kind === "menu" || sign.kind === "program" ? (
                <label className="block text-sm">
                  <span className="kicker">{sign.kind === "bar" ? "Drinks, one per line" : "Lines"}</span>
                  <textarea className="field mt-1 min-h-28" value={sign.extra} onChange={(e) => patch({ extra: e.target.value })} />
                </label>
              ) : null}
              <label className="block text-sm">
                <span className="kicker">Copies</span>
                <input
                  type="number"
                  min={1}
                  className="field mt-1"
                  value={sign.copies || 1}
                  onChange={(e) => patch({ copies: Number(e.target.value) || 1 })}
                />
                <span className="mt-1 block text-xs text-muted">{specOf(sign.kind).copiesHint}</span>
              </label>
              <div>
                <p className="kicker">Style</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {STYLES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => patch({ style: st.id, vine: st.id !== "minimal" })}
                      className={`min-h-14 rounded-xl border px-3 py-2 text-left ${
                        (sign.style || "arch") === st.id ? "border-ink bg-paper" : "border-line"
                      }`}
                    >
                      <span className="block text-sm">{st.label}</span>
                      <span className="block text-[11px] text-muted">{st.line}</span>
                    </button>
                  ))}
                </div>
              </div>
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
              <div className="rounded-xl border border-line bg-paper p-3">
                <p className="kicker">Design Space</p>
                <p className="mt-1 font-medium">{prep.space.official}</p>
                <p className="mt-1 text-muted">Search: “{prep.space.search}”</p>
                <p className="mt-1 text-xs text-muted">{prep.space.op} · {prep.space.access}</p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost w-full"
                    onClick={async () => {
                      await navigator.clipboard.writeText(prep.space.search);
                      setMsg("Search copied — paste it in Design Space");
                    }}
                  >
                    Copy search
                  </button>
                  <a href="https://design.cricut.com/" target="_blank" rel="noreferrer" className="btn btn-primary w-full">
                    Open Design Space
                  </a>
                </div>
              </div>
              <dl className="space-y-2">
                <div className="flex justify-between gap-3"><dt className="text-muted">File</dt><dd>{prep.file}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Cut size</dt><dd>{prep.cut}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Vinyl</dt><dd className="text-right">{prep.vinyl.sqFt} sq ft · {prep.vinyl.linear12}" of 12" roll</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Mat</dt><dd>{prep.mat}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Machine</dt><dd className="text-right">{prep.machine}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Material</dt><dd className="text-right">{prep.material}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Layers</dt><dd className="text-right">{prep.layers}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">How many</dt><dd className="text-right">{prep.copiesHint}</dd></div>
              </dl>
              <ol className="list-decimal space-y-1 pl-4 text-muted">
                {prep.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <button type="button" onClick={() => downloadSvg(sign)} className="btn btn-ghost w-full">
                Download our SVG instead
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

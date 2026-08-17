"use client";

import { buildSignSvg, cricutPrep, fileName, type SignDesign } from "@/lib/signage";

export function PublicSignDownload({ sign }: { sign: SignDesign }) {
  const svg = buildSignSvg(sign);
  const prep = cricutPrep(sign);

  function download() {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName(sign);
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-8 space-y-6">
      <div
        className="rounded-2xl border border-line bg-surface p-4 [&_svg]:h-auto [&_svg]:max-h-[28rem] [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={download} className="btn btn-primary">
          Download SVG
        </button>
        <a href="https://design.cricut.com/" target="_blank" rel="noreferrer" className="btn btn-ghost">
          Open Design Space
        </a>
      </div>
      <p className="text-sm text-muted">
        {prep.cut} · {prep.mat} · {prep.material}
      </p>
    </div>
  );
}

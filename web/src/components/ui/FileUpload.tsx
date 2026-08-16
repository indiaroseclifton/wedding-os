"use client";

import { useState } from "react";

export function FileUpload({
  onUploaded,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  label = "Upload",
}: {
  onUploaded: (url: string, name: string) => void;
  accept?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setErr(data.error || "Could not upload");
      return;
    }
    onUploaded(data.upload.url, data.upload.name);
  }

  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line px-3 text-xs">
      <input type="file" accept={accept} className="sr-only" onChange={onChange} disabled={busy} />
      {busy ? "Uploading…" : label}
      {err && <span className="ml-2 text-clay">{err}</span>}
    </label>
  );
}

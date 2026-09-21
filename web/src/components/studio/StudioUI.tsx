"use client";
import type { StudioProject } from "@/lib/studio-project";
import type { StudioDesign } from "@/lib/studio/design";
export async function studioRequest(body: unknown) {
  const r = await fetch("/api/studio/workbench", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok)
    throw new Error(d.error || "Studio could not save. Please try again.");
  return d as { project: StudioProject; url?: string };
}
export async function uploadStudioFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch("/api/uploads", { method: "POST", body: form });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Upload failed");
  return d.upload as { id: string; url: string; name: string; type: string };
}
export function saveBody(
  p: StudioProject,
  design: StudioDesign,
  checkpoint?: string,
) {
  return {
    action: "save",
    id: p.id,
    expectedVersion: p.version || 0,
    title: p.title,
    qty: p.qty,
    budget: p.budget,
    note: p.note,
    owner: p.owner,
    zone: p.zone,
    design,
    materials: p.materials,
    steps: p.steps,
    checkpoint,
  };
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="st-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const n = e.target.valueAsNumber;
          if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
        }}
      />
    </Field>
  );
}
export function FileButton({
  children,
  onFile,
  accept = "image/png,image/jpeg,image/webp,application/pdf",
  disabled = false,
}: {
  children: React.ReactNode;
  onFile: (f: File) => void;
  accept?: string;
  disabled?: boolean;
}) {
  return (
    <label className="st-button st-file">
      {children}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );
}

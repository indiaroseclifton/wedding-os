"use client";
import { useState } from "react";
import type { StudioProject } from "@/lib/studio-project";
import { newObject, uid, type StudioDesign } from "@/lib/studio/design";
import { catalogItem } from "@/lib/studio/catalog";
import { Field } from "./StudioUI";
type Advice = {
  summary: string;
  suggestions: {
    catalogId: string;
    count: number;
    reason: string;
    confidence: string;
  }[];
  steps: string[];
  warnings: string[];
};
export function StudioAssistant({
  project: p,
  enabled,
  onDesign,
  onClose,
  capture,
}: {
  project: StudioProject;
  enabled: boolean;
  onDesign: (d: StudioDesign) => void;
  onClose: () => void;
  capture: () => string;
}) {
  const d = p.design!,
    [mode, setMode] = useState("reference"),
    [prompt, setPrompt] = useState(""),
    [ref, setRef] = useState(
      d.references.find((r) => r.source === "upload")?.imageUrl || "",
    ),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [advice, setAdvice] = useState<Advice | null>(null),
    [concept, setConcept] = useState<{ url: string; note: string } | null>(
      null,
    ),
    [chosen, setChosen] = useState<number[]>([]);
  async function run() {
    setBusy(true);
    setError("");
    setAdvice(null);
    setConcept(null);
    try {
      const r = await fetch("/api/studio/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: p.id,
          mode,
          prompt,
          design: d,
          image:
            mode === "render"
              ? capture()
              : mode === "reference"
                ? ref
                : undefined,
          consent,
        }),
      });
      const data = await r.json();
      if (!r.ok)
        throw new Error(data.error || "The assistant could not respond.");
      if (data.advice) {
        setAdvice(data.advice);
        setChosen([]);
      }
      if (data.concept) setConcept(data.concept);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="studio-assistant" aria-label="Studio AI assistant">
      <div className="st-section-heading">
        <div>
          <p className="st-eyebrow">A second pair of eyes</p>
          <h2>Studio assistant</h2>
        </div>
        <button className="st-button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="st-assistant-grid">
        <div>
          <Field label="What would help?">
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="reference">Interpret a reference photo</option>
              <option value="substitute">Suggest material substitutions</option>
              <option value="review">Review feasibility & build plan</option>
              <option value="render">Create a photographic concept</option>
            </select>
          </Field>
          {mode === "reference" && (
            <Field label="Uploaded reference">
              <select value={ref} onChange={(e) => setRef(e.target.value)}>
                <option value="">Choose a reference photo</option>
                {d.references
                  .filter((r) => r.source === "upload" && r.imageUrl)
                  .map((r) => (
                    <option key={r.id} value={r.imageUrl}>
                      {r.title}
                    </option>
                  ))}
              </select>
            </Field>
          )}
          <Field label="Your direction">
            <textarea
              value={prompt}
              maxLength={2000}
              placeholder="What should we keep, simplify or solve?"
              onChange={(e) => setPrompt(e.target.value)}
            />
          </Field>
          <label className="st-check">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            Send this project’s design and selected image to OpenAI for this
            request.
          </label>
          <p className="st-help">
            Suggestions need your review. Concept images can vary from the
            measured design. Requests use the workspace’s AI allowance.
          </p>
          {!enabled && (
            <p className="st-notice">
              AI is awaiting activation by the app owner. Manual design and
              production tools are available now.
            </p>
          )}
          <button
            className="st-button st-primary"
            disabled={
              !enabled || !consent || busy || (mode === "reference" && !ref)
            }
            onClick={() => void run()}
          >
            {busy
              ? mode === "render"
                ? "Rendering your concept…"
                : "Considering your design…"
              : mode === "render"
                ? "Generate concept"
                : "Get suggestions"}
          </button>
          {error && (
            <p role="alert" className="st-error">
              {error}
            </p>
          )}
        </div>
        <div className="st-advice" aria-live="polite">
          {advice ? (
            <>
              <h3>{advice.summary}</h3>
              {advice.suggestions.map((s, i) => (
                <label className="st-advice-option" key={i}>
                  <input
                    type="checkbox"
                    checked={chosen.includes(i)}
                    onChange={(e) =>
                      setChosen(
                        e.target.checked
                          ? [...chosen, i]
                          : chosen.filter((n) => n !== i),
                      )
                    }
                  />
                  <span>
                    <strong>
                      {catalogItem(s.catalogId)?.name || s.catalogId} ×{" "}
                      {s.count}
                    </strong>
                    <small>
                      {s.reason} · {s.confidence} confidence
                    </small>
                  </span>
                </label>
              ))}
              {!!advice.suggestions.length && (
                <button
                  className="st-button"
                  disabled={!chosen.length}
                  onClick={() => {
                    onDesign({
                      ...d,
                      objects: [
                        ...d.objects,
                        ...chosen.map((i) =>
                          newObject(advice.suggestions[i].catalogId, {
                            count: advice.suggestions[i].count,
                          }),
                        ),
                      ].slice(0, 250),
                    });
                    setChosen([]);
                    setAdvice({
                      ...advice,
                      suggestions: [],
                      summary:
                        "Selected materials added. Arrange them, confirm quantities, and save the project.",
                    });
                  }}
                >
                  Add selected materials
                </button>
              )}
              {!!advice.steps.length && (
                <ol>
                  {advice.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              )}
              {advice.warnings.map((w) => (
                <p className="st-help" key={w}>
                  {w}
                </p>
              ))}
            </>
          ) : concept ? (
            <>
              <img
                src={concept.url}
                alt="AI-generated wedding styling concept"
              />
              <p className="st-notice">{concept.note}</p>
              <button
                className="st-button"
                onClick={() => {
                  onDesign({
                    ...d,
                    references: [
                      ...d.references,
                      {
                        id: uid(),
                        title: "AI styling concept — approximate",
                        url: concept.url,
                        imageUrl: concept.url,
                        note: concept.note,
                        source: "upload",
                      },
                    ],
                  });
                  setConcept(null);
                }}
              >
                Keep as a reference
              </button>
            </>
          ) : (
            <p>
              {mode === "render"
                ? "Start from the 3D canvas. A concept image helps explore atmosphere; use the measured plan and calculated materials for making."
                : "The assistant can identify likely materials, suggest alternatives and help plan a practical trial. You choose which suggestions become part of the design."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

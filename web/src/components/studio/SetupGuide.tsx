"use client";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { MeasuredPlan } from "./MeasuredPlan";
import type { PublicHandoff } from "@/lib/studio/handoff";
import "./studio.css";
const ScenePreview = dynamic(
  () => import("./ScenePreview").then((m) => m.ScenePreview),
  { ssr: false },
);
export function SetupGuide({ guide: g }: { guide: PublicHandoff }) {
  const [fallback, setFallback] = useState(false);
  const showPlan = useCallback(() => setFallback(true), []);
  return (
    <main className="studio-guide">
      <header>
        <p className="st-eyebrow">Vowfolk Studio · helper guide</p>
        <h1>{g.title}</h1>
        <p>
          {g.qty} to make · {g.zone || "Setup location to be confirmed"}
          {g.owner ? ` · Lead: ${g.owner}` : ""}
        </p>
        <p>
          {g.design.approval.status === "approved"
            ? "Approved design"
            : "Working plan — confirm with the project lead before setup."}
        </p>
        <button
          className="st-button st-no-print"
          onClick={() => window.print()}
        >
          Print guide
        </button>
      </header>
      {fallback ? (
        <MeasuredPlan
          design={g.design}
          readOnly
          onSelect={() => {}}
          onMove={() => {}}
        />
      ) : (
        <ScenePreview
          design={g.design}
          view="perspective"
          quantity={g.qty}
          onUnavailable={showPlan}
        />
      )}
      <p className="st-help">
        Dimension-based preview. Follow the measured materials and setup
        instructions below.
      </p>
      <h2>The making & setup plan</h2>
      {g.tasks.map((t) => (
        <section className="st-build-task" key={t.id}>
          <p className="st-eyebrow">
            {t.date || "Date to be confirmed"} ·{" "}
            {t.assignee || "Owner to be assigned"}
            {t.done ? " · Complete" : ""}
          </p>
          <h3>{t.what}</h3>
          <ol>
            {t.instructions.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </section>
      ))}
      <h2>Boxes & locations</h2>
      {g.design.boxes.length ? (
        g.design.boxes.map((b) => (
          <section className="st-box" key={b.id}>
            <h3>{b.name}</h3>
            <p>
              {b.destination || "Location to be confirmed"} ·{" "}
              {b.owner || "Owner to be assigned"}
            </p>
            <p>
              Transport:{" "}
              {b.transport || "Handle according to the material instructions"}
              <br />
              After: {b.after}
            </p>
            <table className="st-table" style={{ minWidth: 0 }}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Allocated</th>
                  <th>Packed</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {b.items.map((i) => (
                  <tr key={i.materialId}>
                    <td>
                      {g.materials.find((m) => m.id === i.materialId)?.label ||
                        "Material"}
                    </td>
                    <td>{i.qty}</td>
                    <td>{i.packed}</td>
                    <td>{i.placed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      ) : (
        <p>Boxes have not been assigned yet. Check with the project lead.</p>
      )}
      <h2>Materials needed</h2>
      <table className="st-table" style={{ minWidth: 0 }}>
        <thead>
          <tr>
            <th>Material</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {g.materials.map((m) => (
            <tr key={m.id}>
              <td>{m.label}</td>
              <td>
                {m.qty} {m.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="st-help">
        Read-only guide · Updated{" "}
        {new Date(g.updatedAt).toISOString().slice(0, 10)}. Refresh this page
        for the latest saved plan. Anyone with this link can view this guide
        until the owner revokes it.
      </p>
    </main>
  );
}

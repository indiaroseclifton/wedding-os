"use client";
import { useRef } from "react";
import { expandedObjects, type StudioDesign } from "@/lib/studio/design";
export function MeasuredPlan({
  design,
  selected,
  onSelect,
  onMove,
  readOnly = false,
}: {
  design: StudioDesign;
  readOnly?: boolean;
  selected?: string;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, z: number) => void;
}) {
  const svg = useRef<SVGSVGElement>(null),
    drag = useRef<string | null>(null);
  const s = design.surface,
    w = s.shape === "none" ? 600 : Math.max(s.width, s.depth) + 90;
  return (
    <div className="studio-plan">
      <svg
        ref={svg}
        viewBox={`${-w / 2} ${-w / 2} ${w} ${w}`}
        aria-label="Measured top-down plan in centimeters"
        onPointerMove={(e) => {
          if (readOnly || !drag.current || !svg.current) return;
          const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(
            svg.current.getScreenCTM()?.inverse(),
          );
          onMove(drag.current, Math.round(pt.x), Math.round(pt.y));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <defs>
          <pattern
            id="st-grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="#d2dac8"
              strokeWidth=".3"
            />
          </pattern>
        </defs>
        <rect x={-w / 2} y={-w / 2} width={w} height={w} fill="url(#st-grid)" />
        {s.shape === "round" ? (
          <ellipse
            rx={s.width / 2}
            ry={s.depth / 2}
            fill={s.linen}
            stroke="#718469"
            strokeWidth=".6"
          />
        ) : s.shape === "rectangle" ? (
          <rect
            x={-s.width / 2}
            y={-s.depth / 2}
            width={s.width}
            height={s.depth}
            fill={s.linen}
            stroke="#718469"
            strokeWidth=".6"
          />
        ) : null}
        {s.shape !== "none" && (
          <text
            x="0"
            y={-s.depth / 2 - 12}
            textAnchor="middle"
            fontSize={w * 0.028}
            fill="#43543b"
          >
            {s.width} × {s.depth} cm
          </text>
        )}
        {expandedObjects(design).map((o, i) => (
          <g
            key={o.id + i}
            transform={`translate(${o.x} ${o.z}) rotate(${o.rotation})`}
            role={readOnly ? "img" : "button"}
            tabIndex={readOnly ? -1 : 0}
            aria-label={`${o.name}, ${o.x} by ${o.z} centimeters${o.locked ? ", locked" : ""}`}
            onPointerDown={(e) => {
              if (readOnly) return;
              onSelect(o.id);
              if (!o.locked) {
                drag.current = o.id;
                svg.current?.setPointerCapture(e.pointerId);
              }
            }}
            onKeyDown={(e) => {
              if (readOnly) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(o.id);
              }
              if (
                !o.locked &&
                ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  e.key,
                )
              ) {
                e.preventDefault();
                const n = e.shiftKey ? 10 : 1;
                onMove(
                  o.id,
                  o.x +
                    (e.key === "ArrowRight"
                      ? n
                      : e.key === "ArrowLeft"
                        ? -n
                        : 0),
                  o.z +
                    (e.key === "ArrowDown" ? n : e.key === "ArrowUp" ? -n : 0),
                );
              }
            }}
          >
            {[
              "flower",
              "foliage",
              "plate",
              "vessel",
              "glass",
              "candle",
            ].includes(o.kind) ? (
              <ellipse
                rx={o.width / 2}
                ry={o.depth / 2}
                fill={o.color}
                stroke={selected === o.id ? "#284b2e" : "#8b977b"}
                strokeWidth={selected === o.id ? 1.8 : 0.5}
              />
            ) : (
              <rect
                x={-o.width / 2}
                y={-o.depth / 2}
                width={o.width}
                height={o.depth}
                fill={o.color}
                stroke={selected === o.id ? "#284b2e" : "#8b977b"}
                strokeWidth={selected === o.id ? 1.8 : 0.5}
              />
            )}{" "}
            {o.imageUrl && (
              <image
                href={o.imageUrl}
                x={-o.width / 2}
                y={-o.depth / 2}
                width={o.width}
                height={o.depth}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
            {o.count > 1 && (
              <text
                y="2"
                textAnchor="middle"
                fontSize={w * 0.022}
                fill="#2d422a"
              >
                {o.count}
              </text>
            )}
          </g>
        ))}
      </svg>
      <span className="studio-scene-caption">
        {readOnly
          ? "Measured top view · centimeters"
          : "Centimeters · drag to place · arrows move 1 cm · Shift moves 10 cm"}
      </span>
    </div>
  );
}

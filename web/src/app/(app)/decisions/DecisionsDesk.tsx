"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DECISION_GROUPS, type CatalogDecision } from "@/lib/planner-decisions";
import { decisionHints, skipDecisions } from "@/lib/shape";
import { PromoteButtons } from "./PromoteButtons";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

type Saved = {
  id: string;
  type: string;
  title: string;
  status: string;
  summary: string;
  payload: { catalogId?: string; answer?: string; group?: string };
};

export function DecisionsDesk() {
  const [saved, setSaved] = useState<Saved[]>([]);
  const [catalog, setCatalog] = useState<CatalogDecision[]>([]);
  const [shape, setShape] = useState<string>("weekend");
  const [enterHow, setEnterHow] = useState<string>("one-then");
  const [filter, setFilter] = useState<"open" | "decided" | "all">("open");
  const [group, setGroup] = useState("All");
  const [custom, setCustom] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/decisions");
    if (!res.ok) return;
    const data = await res.json();
    setSaved(data.decisions || []);
    setCatalog(data.catalog || []);
  }

  useEffect(() => {
    load();
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.meta?.shape) setShape(d.meta.shape);
        if (d?.meta?.enterHow) setEnterHow(d.meta.enterHow);
      })
      .catch(() => {});
  }, []);

  const byCatalog = useMemo(() => {
    const map = new Map<string, Saved>();
    for (const d of saved) {
      if (d.payload?.catalogId) map.set(d.payload.catalogId, d);
    }
    return map;
  }, [saved]);

  const customRows = saved.filter((d) => d.type === "CUSTOM" || !d.payload?.catalogId && d.type !== "CATALOG");

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await load();
      return res.json();
    }
    return null;
  }

  async function openPrompt(item: CatalogDecision) {
    const existing = byCatalog.get(item.id);
    if (existing) {
      setOpenId(existing.id);
      setAnswer(String(existing.payload?.answer || existing.summary || ""));
      return;
    }
    const data = await post({ action: "from_catalog", catalogId: item.id });
    if (data?.decision) {
      setOpenId(data.decision.id);
      setAnswer("");
    }
  }

  const skip = skipDecisions(shape);
  const visibleCatalog = catalog.filter((c) => {
    if (skip.has(c.id)) return false;
    if (group !== "All" && c.group !== group) return false;
    const row = byCatalog.get(c.id);
    if (filter === "decided") return row?.status === "DECIDED";
    if (filter === "open") return !row || row.status !== "DECIDED";
    return true;
  });

  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <div>
        <h1 className="font-serif text-4xl">Decisions</h1>
        <p className="mt-1 text-sm text-muted">
          What a coordinator will ask you — plus anything you two need to call. Mark it, then turn it into a task.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["open", "decided", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs ${filter === f ? "bg-moss text-ivory" : "border border-line"}`}
          >
            {f === "open" ? "Still open" : f === "decided" ? "Called" : "All"}
          </button>
        ))}
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs"
        >
          <option>All</option>
          {DECISION_GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <Link href="/decisions/priorities" className="rounded-full border border-line px-3 py-1.5 text-xs">
          Priorities
        </Link>
        <Link href="/planning/vision" className="rounded-full border border-line px-3 py-1.5 text-xs">
          Vision
        </Link>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const data = await post({ action: "create", title: custom });
          setCustom("");
          if (data?.decision) setOpenId(data.decision.id);
        }}
        className="flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-4"
      >
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          required
          placeholder="A decision only you two have — “Aunt May gives a toast?”"
          className="min-w-[16rem] flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
          Add ours
        </button>
      </form>

      {customRows.length > 0 && (
        <section>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-moss">Yours</p>
          <ul className="space-y-2">
            {customRows
              .filter((d) => (filter === "decided" ? d.status === "DECIDED" : filter === "open" ? d.status !== "DECIDED" : true))
              .map((d) => (
                <DecisionCard
                  key={d.id}
                  title={d.title}
                  ask={d.summary}
                  status={d.status}
                  open={openId === d.id}
                  answer={openId === d.id ? answer : String(d.payload?.answer || "")}
                  onOpen={() => {
                    setOpenId(d.id);
                    setAnswer(String(d.payload?.answer || d.summary || ""));
                  }}
                  onAnswer={setAnswer}
                  onSave={async (status, promote) => {
                    const data = await post({ action: "save", id: d.id, answer, status, promote });
                    setMsg(data?.task ? "Saved and made a task." : "Saved");
                  }}
                  decisionId={d.id}
                />
              ))}
          </ul>
        </section>
      )}

      {DECISION_GROUPS.filter((g) => group === "All" || group === g).map((g) => {
        const rows = visibleCatalog.filter((c) => c.group === g);
        if (!rows.length) return null;
        return (
          <section key={g}>
            <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-moss">{g}</p>
            <ul className="space-y-2">
              {rows.map((item) => {
                const row = byCatalog.get(item.id);
                const id = row?.id;
                return (
                  <DecisionCard
                    key={item.id}
                    title={item.title}
                    ask={item.ask}
                    when={item.when}
                    hints={decisionHints(item.id, shape, enterHow) || item.hints}
                    status={row?.status || "OPEN"}
                    open={!!id && openId === id}
                    answer={id && openId === id ? answer : String(row?.payload?.answer || "")}
                    onOpen={() => openPrompt(item)}
                    onAnswer={setAnswer}
                    onSave={async (status, promote) => {
                      if (!id) return;
                      const data = await post({ action: "save", id, answer, status, promote });
                      setMsg(data?.task ? "Called — and a task is on the list." : "Saved");
                    }}
                    decisionId={id}
                  />
                );
              })}
            </ul>
          </section>
        );
      })}
      {msg && <p className="text-xs text-moss">{msg}</p>}
    </div>
  );
}

function DecisionCard({
  title,
  ask,
  when,
  hints,
  status,
  open,
  answer,
  onOpen,
  onAnswer,
  onSave,
  decisionId,
}: {
  title: string;
  ask: string;
  when?: string;
  hints?: string[];
  status: string;
  open: boolean;
  answer: string;
  onOpen: () => void;
  onAnswer: (v: string) => void;
  onSave: (status: string, promote: boolean) => void;
  decisionId?: string;
}) {
  return (
    <li className={`rounded-2xl border px-4 py-3 ${status === "DECIDED" ? "border-line bg-surface" : "border-dashed border-line"}`}>
      <button type="button" onClick={onOpen} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs text-muted">{ask}</p>
        </div>
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted">
          {status === "DECIDED" ? "Called" : status === "EXPLORING" ? "Talking" : "Open"}
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          {when && <p className="text-xs text-muted">When: {when}</p>}
          {hints && hints.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hints.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onAnswer(h)}
                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                    answer === h ? "bg-moss text-ivory" : "border border-line"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
          <textarea
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            rows={2}
            placeholder="Your call, in a sentence."
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSave("EXPLORING", false)}
              className="rounded-full border border-line px-3 py-1.5 text-xs"
            >
              Still talking
            </button>
            <button
              type="button"
              onClick={() => onSave("DECIDED", false)}
              className="rounded-full border border-line px-3 py-1.5 text-xs"
            >
              Call it
            </button>
            <button
              type="button"
              onClick={() => onSave("DECIDED", true)}
              className="rounded-full bg-moss px-3 py-1.5 text-xs font-medium text-ivory"
            >
              Call it + make a task
            </button>
            {decisionId && <PromoteButtons decisionId={decisionId} />}
          </div>
        </div>
      )}
    </li>
  );
}

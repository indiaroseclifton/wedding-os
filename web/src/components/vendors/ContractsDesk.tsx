"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CONTRACT_CLAUSES } from "@/lib/data/contract-review";
import { FileUpload } from "@/components/ui/FileUpload";

export type ContractRow = {
  id: string;
  name: string;
  category: string;
  status: string;
  contractUrl: string;
  signedAt: string;
  reviewedAt: string;
  flags: number;
  namedLead: string;
  depositDue: string;
  depositPaid: boolean;
  depositAmt: number;
};

type Filter = "all" | "missing" | "flagged" | "reviewed";

export function ContractsDesk({ rows }: { rows: ContractRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [urls, setUrls] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, r.contractUrl]))
  );
  const [msg, setMsg] = useState<string | null>(null);

  const list = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "missing") return !r.contractUrl;
      if (filter === "flagged") return r.flags > 0;
      if (filter === "reviewed") return Boolean(r.reviewedAt);
      return true;
    });
  }, [rows, filter]);

  const missing = rows.filter((r) => !r.contractUrl).length;
  const flagged = rows.filter((r) => r.flags > 0).length;

  async function saveUrl(id: string) {
    setMsg(null);
    const res = await fetch(`/api/vendors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractUrl: urls[id] || "" }),
    });
    setMsg(res.ok ? "Link saved" : "Could not save");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <p className="glass-panel rounded-2xl p-4">
          <span className="block kicker">Agreements</span>
          <span className="font-serif text-3xl">{rows.length}</span>
        </p>
        <p className="glass-panel rounded-2xl p-4">
          <span className="block kicker">Still a handshake</span>
          <span className="font-serif text-3xl">{missing}</span>
        </p>
        <p className="glass-panel rounded-2xl p-4">
          <span className="block kicker">Flags to ask</span>
          <span className="font-serif text-3xl">{flagged}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["missing", "No file"],
            ["flagged", "Flagged"],
            ["reviewed", "Reviewed"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`min-h-11 rounded-full px-3 text-xs ${
              filter === id ? "bg-moss text-moss-fg" : "border border-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted">Nothing in this filter. Add a vendor first, or attach a link.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => (
            <li key={r.id} className="glass-panel space-y-3 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-serif text-2xl">{r.name}</p>
                  <p className="text-xs text-muted">
                    {r.category}
                    {r.signedAt ? ` · signed ${r.signedAt}` : " · not signed in here"}
                    {r.namedLead ? ` · ${r.namedLead}` : ""}
                  </p>
                </div>
                <span className="kicker kicker-moss">
                  {r.flags > 0 ? `${r.flags} flag${r.flags === 1 ? "" : "s"}` : r.reviewedAt ? "reviewed" : r.contractUrl ? "linked" : "missing"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  value={urls[r.id] ?? ""}
                  onChange={(e) => setUrls((u) => ({ ...u, [r.id]: e.target.value }))}
                  placeholder="Paste Drive / Dropbox / PDF link"
                  className="min-h-11 min-w-[12rem] flex-1 rounded-xl border border-line bg-surface/70 px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => saveUrl(r.id)}
                  className="min-h-11 rounded-full border border-line px-3 text-xs"
                >
                  Save link
                </button>
                <FileUpload
                  label="Upload PDF"
                  accept="application/pdf,image/jpeg,image/png"
                  onUploaded={(href) => {
                    setUrls((u) => ({ ...u, [r.id]: href }));
                    fetch(`/api/vendors/${r.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ contractUrl: href }),
                    }).then((res) => setMsg(res.ok ? "File attached" : "Could not save"));
                  }}
                />
                {urls[r.id] && (
                  <a
                    href={urls[r.id]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full border border-line px-3 text-xs"
                  >
                    Open file
                  </a>
                )}
                <Link
                  href={`/vendors/contracts/${r.id}`}
                  scroll={false}
                  className="inline-flex min-h-11 items-center rounded-full bg-moss px-3 text-xs text-ivory"
                >
                  {r.flags > 0 ? `Ask about ${r.flags} flags` : "Review clauses"}
                </Link>
              </div>
              {r.depositAmt > 0 && (
                <p className="text-xs text-muted">
                  Deposit ${r.depositAmt}
                  {r.depositDue ? ` due ${r.depositDue}` : ""}
                  {r.depositPaid ? " · paid" : ""}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {msg && (
        <p role="status" aria-live="polite" className="text-xs text-moss">
          {msg}
        </p>
      )}

      <section className="glass-panel rounded-2xl p-5">
        <p className="font-medium">What to mark before you sign</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {CONTRACT_CLAUSES.map((c) => (
            <li key={c.id} className="text-sm">
              <p className="font-medium">{c.label}</p>
              <p className="text-xs text-muted">Good: {c.good}</p>
              <p className="text-xs text-clay">Flag: {c.flag}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

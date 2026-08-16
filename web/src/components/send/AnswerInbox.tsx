"use client";

import { useState } from "react";
import type { VendorNeed, VendorQuestion } from "@/lib/send/needs";

export function AnswerInbox({
  sendId,
  questions,
  needs,
}: {
  sendId: string;
  questions: VendorQuestion[];
  needs: VendorNeed[];
}) {
  const [rows, setRows] = useState(questions);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  if (!rows.length && !needs.length) return null;

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 print:hidden">
      <p className="text-[11px] uppercase tracking-[0.16em] text-moss">From them</p>
      {needs.filter((n) => n.done || n.fileUrl).length > 0 && (
        <ul className="mt-2 space-y-1 text-sm">
          {needs
            .filter((n) => n.done || n.fileUrl)
            .map((n) => (
              <li key={n.id}>
                {n.label}
                {n.fileUrl ? (
                  <>
                    {" "}
                    ·{" "}
                    <a href={n.fileUrl} className="underline" target="_blank" rel="noreferrer">
                      {n.fileName || "file"}
                    </a>
                  </>
                ) : (
                  " · done"
                )}
              </li>
            ))}
        </ul>
      )}
      <ul className="mt-3 space-y-3">
        {rows.map((q) => (
          <li key={q.id} className="text-sm">
            <p className="font-medium">{q.body}</p>
            <p className="text-xs text-muted">{q.from}</p>
            {q.answer ? (
              <p className="mt-1 text-moss">{q.answer}</p>
            ) : (
              <form
                className="mt-2 flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    const res = await fetch("/api/send", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "answer",
                        sendId,
                        questionId: q.id,
                        answer: draft[q.id] || "",
                      }),
                    });
                    const data = await res.json();
                    if (res.ok && data.send?.questions) setRows(data.send.questions);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <input
                  value={draft[q.id] || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [q.id]: e.target.value }))}
                  className="min-h-11 flex-1 rounded-full border border-line px-4 text-sm"
                  placeholder="Answer"
                />
                <button
                  type="submit"
                  disabled={busy || !(draft[q.id] || "").trim()}
                  className="text-sm underline disabled:opacity-50"
                >
                  Reply
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

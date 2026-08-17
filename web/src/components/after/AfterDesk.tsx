"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cardPrompt, type AfterCard } from "@/lib/after-desk";

export function AfterDesk({
  names,
  nextWrite,
  seedable,
  missing,
}: {
  names: string;
  nextWrite: AfterCard[];
  seedable: number;
  missing: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(nextWrite[0]?.id || null);
  const [copied, setCopied] = useState<string | null>(null);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    await fetch("/api/thanks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    router.refresh();
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 print:hidden">
        {seedable > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => post({ action: "seed_guests" })}
            className="rounded-full bg-moss px-4 py-2 text-sm text-ivory disabled:opacity-50"
          >
            Add {seedable} who came
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => post({ action: "import_gifts" })}
          className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-50"
        >
          Pull registry gifts
        </button>
        {missing > 0 && (
          <Link href="/guests/chase" className="rounded-full border border-line px-4 py-2 text-sm">
            {missing} need an address
          </Link>
        )}
      </div>

      {nextWrite.length === 0 ? (
        <p className="text-sm text-muted">
          No cards in the stack. Add the people who came, or pull gifts from Registry.
        </p>
      ) : (
        <ul className="space-y-3">
          {nextWrite.map((card) => {
            const prompt = cardPrompt(card, names);
            const open = openId === card.id;
            return (
              <li key={card.id} className="rounded-[1.3rem] border border-line bg-surface px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button type="button" onClick={() => setOpenId(open ? null : card.id)} className="text-left">
                    <p className="font-serif text-2xl leading-tight">{card.guestName}</p>
                    <p className="mt-1 text-sm text-muted">
                      {card.gift || "Presence"}
                      {card.addressLine ? ` · ${card.addressLine}` : " · no address yet"}
                    </p>
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => post({ action: "toggle", id: card.id, status: "SENT" })}
                    className="min-h-11 rounded-full bg-moss px-4 text-sm text-ivory disabled:opacity-50"
                  >
                    Mark sent
                  </button>
                </div>
                {open && (
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-ink-soft">{prompt}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => copy(prompt, card.id)}
                        className="text-xs underline"
                      >
                        {copied === card.id ? "Copied" : "Copy the note"}
                      </button>
                      {card.addressLine && (
                        <button
                          type="button"
                          onClick={() => copy(card.addressLine || "", `${card.id}-addr`)}
                          className="text-xs underline"
                        >
                          {copied === `${card.id}-addr` ? "Copied" : "Copy address"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cardPrompt } from "@/lib/after-copy";
import { motion, fadeUp } from "@/components/motion";

type AfterCard = {
  id: string;
  guestName: string;
  gift?: string | null;
  addressLine?: string;
  missingAddress?: boolean;
};

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

  const card = nextWrite.find((c) => c.id === openId) || nextWrite[0] || null;
  const prompt = card ? cardPrompt(card, names) : "";
  const queue = nextWrite.filter((c) => c.id !== card?.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 print:hidden">
        {seedable > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => post({ action: "seed_guests" })}
            className="btn btn-primary disabled:opacity-50"
          >
            Add {seedable} who came
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => post({ action: "import_gifts" })}
          className="btn btn-ghost disabled:opacity-50"
        >
          Pull registry gifts
        </button>
        {missing > 0 && (
          <Link href="/guests/chase" className="btn btn-ghost">
            {missing} need an address
          </Link>
        )}
      </div>

      {!card ? (
        <p className="text-pretty text-sm text-muted">
          No cards in the stack. Add the people who came, or pull gifts from Registry.
        </p>
      ) : (
        <motion.article
          key={card.id}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="glass-hero rounded-[1.8rem] p-5 sm:p-7"
        >
          <p className="kicker kicker-moss">Tonight</p>
          <h2 className="mt-2 font-serif text-[clamp(2rem,6vw,3rem)] leading-none tracking-tight text-balance">
            {card.guestName}
          </h2>
          <p className="mt-3 text-sm text-muted">
            {card.gift || "They were there"}
            {card.addressLine ? ` · ${card.addressLine}` : " · no address yet"}
          </p>

          <div className="mt-6 rounded-2xl bg-paper px-5 py-5">
            <p className="whitespace-pre-wrap font-serif text-lg leading-8 text-ink text-pretty">{prompt}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => post({ action: "toggle", id: card.id, status: "SENT" })}
              className="btn btn-primary disabled:opacity-50"
            >
              Mark sent
            </button>
            <button type="button" onClick={() => copy(prompt, card.id)} className="btn btn-ghost">
              {copied === card.id ? "Copied" : "Copy the note"}
            </button>
            {card.addressLine ? (
              <button
                type="button"
                onClick={() => copy(card.addressLine || "", `${card.id}-addr`)}
                className="btn btn-ghost"
              >
                {copied === `${card.id}-addr` ? "Copied" : "Copy address"}
              </button>
            ) : (
              <Link href="/guests/chase" className="btn btn-ghost">
                Find their address
              </Link>
            )}
          </div>
        </motion.article>
      )}

      {queue.length > 0 && (
        <div>
          <p className="kicker">Next</p>
          <ul className="mt-3 divide-y divide-line">
            {queue.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(row.id)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left"
                >
                  <span className="font-serif text-xl tracking-tight">{row.guestName}</span>
                  <span className="truncate text-xs text-muted">{row.gift || "Presence"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

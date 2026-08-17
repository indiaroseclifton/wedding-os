"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VendorGut } from "@/components/vendors/VendorGut";
import { googleReviewUrl, type GutMark } from "@/lib/vendor-gut";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { EmptyState } from "@/components/ui/EmptyState";
import { cardPrompt } from "@/lib/after-copy";
import { motion, fadeUp } from "@/components/motion";

type Item = {
  id: string;
  guestName: string;
  gift?: string;
  status: "TODO" | "SENT";
  sentDate?: string;
};

type Team = {
  id: string;
  name: string;
  category: string;
  gutMark?: GutMark;
  gutNote?: string;
};

export default function ThanksPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [team, setTeam] = useState<Team[]>([]);
  const [city, setCity] = useState("");
  const [names, setNames] = useState("us");
  const [guestName, setGuestName] = useState("");
  const [gift, setGift] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/thanks");
    if (res.ok) {
      const data = await res.json();
      const next: Item[] = data.thanks?.items || [];
      setItems(next);
      setOpenId((id) => id || next.find((i) => i.status !== "SENT")?.id || next[0]?.id || null);
    }
  }

  useEffect(() => {
    load();
    fetch("/api/vendors")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setTeam(d?.vendors || []))
      .catch(() => {});
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setCity(d?.meta?.location || "");
        setNames(d?.meta?.coupleNames || d?.meta?.name || "us");
      })
      .catch(() => {});
  }, []);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/thanks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.thanks?.items) {
        const next: Item[] = data.thanks.items;
        setItems(next);
        if (body.action === "toggle") {
          const leftover = next.find((i) => i.status !== "SENT");
          setOpenId(leftover?.id || next[0]?.id || null);
        }
      }
      return data;
    }
    return null;
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

  const todo = items.filter((i) => i.status !== "SENT");
  const sent = items.filter((i) => i.status === "SENT");
  const card = items.find((i) => i.id === openId) || todo[0] || items[0] || null;
  const prompt = card ? cardPrompt(card, names) : "";
  const queue = todo.filter((i) => i.id !== card?.id);

  return (
    <div className="space-y-10">
      <RoomSubnav room="planning" />

      <header className="max-w-2xl">
        <p className="kicker kicker-moss">After</p>
        <h1 className="mt-3 font-serif text-[clamp(2.4rem,7vw,4rem)] leading-none tracking-tight text-balance">
          Thank-yous
        </h1>
        <p className="deck mt-4 max-w-xl text-pretty">
          {todo.length
            ? `${todo.length} left. Write one. Mark sent. Three months is the rule.`
            : items.length
              ? "The stack is gone."
              : "Add who came, or pull gifts from Registry."}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            await post({ action: "import_gifts" });
            setNote("Pulled gifts from Registry");
          }}
          className="btn btn-ghost"
        >
          Pull registry gifts
        </button>
        <Link href="/after" className="btn btn-ghost">
          After
        </Link>
      </div>
      {note ? <p className="text-xs text-moss">{note}</p> : null}

      {card ? (
        <motion.article
          key={card.id}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="glass-hero rounded-[1.8rem] p-5 sm:p-7"
        >
          <p className="kicker kicker-moss">{card.status === "SENT" ? "Sent" : "Tonight"}</p>
          <h2 className="mt-2 font-serif text-[clamp(2rem,6vw,3rem)] leading-none tracking-tight text-balance">
            {card.guestName}
          </h2>
          <p className="mt-3 text-sm text-muted">
            {card.gift || "They were there"}
            {card.sentDate ? ` · sent ${card.sentDate}` : ""}
          </p>
          <div className="mt-6 rounded-2xl bg-paper px-5 py-5">
            <p className="whitespace-pre-wrap font-serif text-lg leading-8 text-ink text-pretty">{prompt}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                post({
                  action: "toggle",
                  id: card.id,
                  status: card.status === "SENT" ? "TODO" : "SENT",
                })
              }
              className="btn btn-primary"
            >
              {card.status === "SENT" ? "Undo" : "Mark sent"}
            </button>
            <button type="button" onClick={() => copy(prompt, card.id)} className="btn btn-ghost">
              {copied === card.id ? "Copied" : "Copy the note"}
            </button>
            <button type="button" onClick={() => post({ action: "delete", id: card.id })} className="btn btn-ghost">
              Remove
            </button>
          </div>
        </motion.article>
      ) : (
        <EmptyState title="No thank-yous yet" body="Add a name, or pull gifts from Registry." />
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

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await post({ action: "add", guestName, gift });
          setGuestName("");
          setGift("");
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="text-sm">
          <span className="kicker">Someone we missed</span>
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} required className="field mt-1" />
        </label>
        <label className="text-sm">
          <span className="kicker">Gift</span>
          <input value={gift} onChange={(e) => setGift(e.target.value)} className="field mt-1" />
        </label>
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      {sent.length > 0 && (
        <p className="text-xs tabular-nums text-muted">{sent.length} sent</p>
      )}

      {team.length ? (
        <section id="team" className="border-t border-line pt-10">
          <p className="kicker kicker-moss">The people who made the day</p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight text-balance">Mark them. Tell Google if you want.</h2>
          <p className="mt-2 max-w-xl text-sm text-muted text-pretty">
            Yes / Maybe / No stays on your desk. Public praise lives on their page.
          </p>
          <ul className="mt-6 divide-y divide-line">
            {team.map((v) => (
              <li key={v.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-xl leading-tight">{v.name}</p>
                    <p className="text-xs text-muted">{v.category}</p>
                  </div>
                  <a
                    href={googleReviewUrl(v.name, city)}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-11 text-xs underline"
                  >
                    Tell Google
                  </a>
                </div>
                <div className="mt-2">
                  <VendorGut vendorId={v.id} mark={v.gutMark} note={v.gutNote} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

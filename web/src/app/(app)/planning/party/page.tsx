import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

const TILES = [
  {
    href: "/people",
    title: "Invite them in",
    line: "Bridesmaids, groomsmen, MOH — they get the party view, not the whole desk.",
  },
  {
    href: "/attire",
    title: "What they wear",
    line: "Palette, dress links, sizes, who’s ordered. The old bridesmaid tab.",
  },
  {
    href: "/vendors/browse?category=Hair / Makeup",
    title: "Beauty",
    line: "Hair and makeup for the party, plus a trial.",
  },
  {
    href: "/events",
    title: "Their events",
    line: "Shower, bach, welcome drinks — not the wedding itself.",
  },
  {
    href: "/day-of",
    title: "Day-of jobs",
    line: "Who has the rings, who wrangles uncles, who holds the bouquet.",
  },
  {
    href: "/checklist?lane=party",
    title: "Party checklist",
    line: "Just the items that belong to the wedding party.",
  },
];

export default function PartyHubPage() {
  return (
    <div>
      <RoomSubnav room="planning" />
      <h1 className="font-serif text-4xl">Wedding party</h1>
      <p className="mt-1 max-w-xl text-sm text-muted">
        Bridesmaids, groomsmen, and anyone standing with you. Invite them, dress them, give them a job.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-2xl border border-line bg-surface p-5 hover:border-moss/30">
            <p className="font-serif text-xl">{t.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{t.line}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

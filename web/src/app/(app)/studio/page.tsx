import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { APP_TAGLINE } from "@/lib/vowfolk";

const DOORS = [
  {
    href: "/diy/studio/floral",
    kicker: "Flowers",
    title: "Let’s make the centerpiece",
    line: "One bowl. Then the math for every table, plus 15% extra, plus where to buy.",
    photo: "/brand/flowers.jpg",
  },
  {
    href: "/diy/studio/table",
    kicker: "Tables",
    title: "Set one. Scale all of them.",
    line: "Plates, glass, napkins, candles. Rent, buy, or make — with the count.",
    photo: "/brand/tablescape.jpg",
  },
  {
    href: "/studio/decor",
    kicker: "Décor",
    title: "The backdrop is a materials list",
    line: "Time, hands, and what goes in the box. Not another moodboard.",
    photo: "/brand/candles.jpg",
  },
  {
    href: "/diy/signage",
    kicker: "Signage",
    title: "Welcome, numbers, the bar",
    line: "What to cut, print, or buy. Then pack it.",
    photo: "/brand/paper.jpg",
  },
];

export default function StudioPage() {
  return (
    <div className="space-y-10">
      <RoomSubnav room="studio" />
      <header className="max-w-2xl">
        <p className="kicker kicker-moss">Studio</p>
        <h1 className="mt-3 font-serif text-[clamp(2.4rem,7vw,4rem)] leading-none tracking-tight text-balance">
          Make the day
        </h1>
        <p className="deck mt-4 max-w-xl text-pretty">{APP_TAGLINE} Not a picture of a centerpiece — the stems, the cost, the hour you build it.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {DOORS.map((d) => (
          <Link key={d.href} href={d.href} className="group overflow-hidden rounded-[1.6rem] bg-surface">
            <div className="aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.photo}
                alt=""
                className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-200 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-5">
              <p className="kicker kicker-moss">{d.kicker}</p>
              <h2 className="mt-2 font-serif text-2xl leading-tight tracking-tight text-balance">{d.title}</h2>
              <p className="mt-2 text-sm text-muted text-pretty">{d.line}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/studio/inventory" className="btn btn-primary">
          The boxes
        </Link>
        <Link href="/diy/calendar" className="btn btn-ghost">
          When to make
        </Link>
        <Link href="/diy" className="btn btn-ghost">
          All projects
        </Link>
      </div>
    </div>
  );
}

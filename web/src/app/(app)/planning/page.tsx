import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

const TILES = [
  { href: "/planning/vision", title: "My vision", line: "Vibe, colors, formality — decide live, not in a doc.", photo: "/brand/candles.jpg" },
  { href: "/checklist", title: "Checklist", line: "What still has to happen, by month.", photo: "/brand/setting.jpg" },
  { href: "/timeline", title: "Timeline", line: "The long arc from now to the day.", photo: "/brand/garden.jpg" },
  { href: "/decisions/path", title: "Hire or make", line: "Flowers, tables, cake — pick a lane.", photo: "/brand/flowers.jpg" },
  { href: "/diy", title: "DIY studio", line: "Playbooks so you don’t vanish into YouTube.", photo: "/brand/flowers.jpg" },
  { href: "/traditions", title: "Traditions", line: "Faith and culture — these change the checklist.", photo: "/brand/candles.jpg" },
];

export default function PlanningPage() {
  return (
    <div>
      <RoomSubnav room="planning" />
      <h1 className="font-serif text-4xl">Planning</h1>
      <p className="mt-1 text-sm text-muted">Vision first. Then the list. Then the week.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="group overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="aspect-[16/9] overflow-hidden">
              <img src={t.photo} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-4">
              <p className="font-serif text-xl">{t.title}</p>
              <p className="mt-1 text-sm text-muted">{t.line}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

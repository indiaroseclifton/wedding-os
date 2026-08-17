import Link from "next/link";
import { MORE_ROOMS, VISUAL_ROOMS } from "@/lib/visual-rooms";
import { RoomTile } from "@/components/layout/RoomTile";

export default function RoomsPage() {
  const lead = VISUAL_ROOMS.filter((r) => r.rank === "lead");
  const support = VISUAL_ROOMS.filter((r) => r.rank !== "lead");
  return (
    <div className="space-y-8">
      <div>
        <p className="kicker">The house</p>
        <h1 className="mt-1 font-serif text-4xl">Rooms</h1>
        <p className="mt-2 max-w-lg text-sm text-muted">Three you live in. Three you visit.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {lead.map((room) => (
          <RoomTile key={room.href} {...room} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {support.map((room) => (
          <Link key={room.href} href={room.href} className="group relative overflow-hidden rounded-2xl">
            <img src={room.photo} alt="" className="aspect-[5/4] w-full object-cover opacity-45 saturate-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-paper/95 via-paper/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="font-serif text-xl text-ink">{room.label}</p>
              <p className="text-[11px] text-ink-soft">{room.line}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {MORE_ROOMS.map((r) => (
          <Link key={r.href} href={r.href} className="min-h-11 rounded-full border border-line bg-surface/60 px-3 py-1.5 text-xs backdrop-blur">
            {r.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

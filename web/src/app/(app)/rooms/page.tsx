import Link from "next/link";
import { MORE_ROOMS, VISUAL_ROOMS } from "@/lib/visual-rooms";

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Rooms</h1>
        <p className="mt-1 text-sm text-muted">Everything for this wedding, in one house.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {VISUAL_ROOMS.map((room) => (
          <Link key={room.href} href={room.href} className="group relative aspect-[5/4] overflow-hidden rounded-2xl">
            <img src={room.photo} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-ivory">
              <p className="font-serif text-2xl">{room.label}</p>
              <p className="mt-1 text-xs text-white/70">{room.line}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {MORE_ROOMS.map((r) => (
          <Link key={r.href} href={r.href} className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs">
            {r.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

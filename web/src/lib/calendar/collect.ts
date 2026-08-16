import { getWorkspaceMeta } from "@/lib/data/store";
import { listEvents } from "@/lib/data/events-store";
import { getDayOf } from "@/lib/data/dayof-store";
import { listTimeline } from "@/lib/data/timeline-store";
import { getTravel } from "@/lib/data/travel-store";
import { getSpeeches } from "@/lib/data/speech-store";
import { type CalEvent, nextDay, timed, ymd } from "./ics";

export async function collectCalendar(workspaceId: string, fallbackName: string): Promise<{ name: string; events: CalEvent[] }> {
  const [meta, events, dayOf, timeline, travel, speeches] = await Promise.all([
    getWorkspaceMeta(workspaceId, fallbackName),
    listEvents(workspaceId),
    getDayOf(workspaceId),
    listTimeline(workspaceId),
    getTravel(workspaceId),
    getSpeeches(workspaceId),
  ]);
  const name = `${meta.coupleNames || meta.name || "Wedding"}`;
  const day = meta.weddingDate || "";
  const out: CalEvent[] = [];

  if (day && /^\d{4}-\d{2}-\d{2}/.test(day)) {
    out.push({
      uid: `wedding-${workspaceId}`,
      title: name,
      start: ymd(day),
      end: nextDay(ymd(day)),
      allDay: true,
      location: meta.location,
      description: "The day.",
    });
    for (const slot of dayOf.schedule || []) {
      if (!slot.time) continue;
      out.push({
        uid: `ros-${slot.id}`,
        title: slot.title,
        start: timed(day, slot.time),
        end: slot.endTime ? timed(day, slot.endTime) : undefined,
        location: slot.location,
        description: [slot.lead, slot.notes].filter(Boolean).join(" · "),
      });
    }
  }

  for (const ev of events) {
    if (!ev.date || !/^\d{4}-\d{2}-\d{2}/.test(ev.date)) continue;
    if (ev.type === "Wedding day") continue;
    out.push({
      uid: `event-${ev.id}`,
      title: ev.name,
      start: ymd(ev.date),
      end: nextDay(ymd(ev.date)),
      allDay: true,
      location: ev.location,
      description: ev.notes,
    });
  }

  for (const item of timeline) {
    if (item.done) continue;
    if (!/^\d{4}-\d{2}-\d{2}/.test(item.when)) continue;
    out.push({
      uid: `tl-${item.id}`,
      title: item.title,
      start: ymd(item.when),
      end: nextDay(ymd(item.when)),
      allDay: true,
      description: item.notes || item.category,
    });
  }

  for (const hotel of travel.hotels || []) {
    if (!hotel.cutoff || !/^\d{4}-\d{2}-\d{2}/.test(hotel.cutoff)) continue;
    out.push({
      uid: `hotel-${hotel.id}`,
      title: `Book ${hotel.name}`,
      start: ymd(hotel.cutoff),
      end: nextDay(ymd(hotel.cutoff)),
      allDay: true,
      location: hotel.address,
      description: hotel.blockCode ? `Code ${hotel.blockCode}` : "Hotel block cutoff",
    });
  }

  for (const row of speeches.rows || []) {
    if (!row.due || !/^\d{4}-\d{2}-\d{2}/.test(row.due) || row.status === "ready") continue;
    out.push({
      uid: `speech-${row.memberKey}`,
      title: `${row.name} speech due`,
      start: ymd(row.due),
      end: nextDay(ymd(row.due)),
      allDay: true,
    });
  }

  return { name, events: out };
}

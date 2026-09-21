import type { StudioProject } from "@/lib/studio-project";
import { dueDate } from "./design";
export function calendarText(projects: StudioProject[], date: string) {
  const escape = (s: string) =>
    s
      .replaceAll("\\", "\\\\")
      .replaceAll("\n", "\\n")
      .replaceAll(",", "\\,")
      .replaceAll(";", "\\;")
      .replaceAll("\r", "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vowfolk//DIY Studio//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const p of projects)
    for (const s of p.steps) {
      const day = dueDate(s, date);
      if (!day) continue;
      const end = new Date(day + "T12:00:00Z");
      end.setUTCDate(end.getUTCDate() + 1);
      lines.push(
        "BEGIN:VEVENT",
        `UID:${s.id}@vowfolk.studio`,
        `DTSTAMP:${new Date(p.updatedAt)
          .toISOString()
          .replaceAll(/[-:]/g, "")
          .replace(/\.\d{3}/, "")}`,
        `DTSTART;VALUE=DATE:${day.replaceAll("-", "")}`,
        `DTEND;VALUE=DATE:${end.toISOString().slice(0, 10).replaceAll("-", "")}`,
        `SUMMARY:${escape(p.title + ": " + s.what)}`,
        `DESCRIPTION:${escape([s.assignee || "Unassigned", s.hours + " person-hours", ...(s.instructions || [])].join("\n"))}`,
        "END:VEVENT",
      );
    }
  lines.push("END:VCALENDAR");
  return lines
    .map((s) => s.match(/.{1,70}/gu)?.join("\r\n ") || "")
    .join("\r\n");
}
export function calendarDownload(projects: StudioProject[], date: string) {
  const u = URL.createObjectURL(
      new Blob([calendarText(projects, date)], {
        type: "text/calendar;charset=utf-8",
      }),
    ),
    a = document.createElement("a");
  a.href = u;
  a.download = "vowfolk-build-calendar.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}

export type CalEvent = {
  uid: string;
  title: string;
  start: string; // YYYYMMDD or YYYYMMDDTHHMMSS
  end?: string;
  allDay?: boolean;
  location?: string;
  description?: string;
};

function fold(line: string) {
  if (line.length <= 74) return line;
  const parts = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length) {
    parts.push(` ${rest.slice(0, 73)}`);
    rest = rest.slice(73);
  }
  return parts.join("\r\n");
}

function esc(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function toIcs(name: string, events: CalEvent[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vowfolk//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`,
  ];
  for (const ev of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}@wedding-os`);
    lines.push(`DTSTAMP:${stamp}`);
    if (ev.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${ev.start}`);
      if (ev.end) lines.push(`DTEND;VALUE=DATE:${ev.end}`);
    } else {
      lines.push(`DTSTART:${ev.start}`);
      if (ev.end) lines.push(`DTEND:${ev.end}`);
    }
    lines.push(`SUMMARY:${esc(ev.title)}`);
    if (ev.location) lines.push(`LOCATION:${esc(ev.location)}`);
    if (ev.description) lines.push(`DESCRIPTION:${esc(ev.description)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function ymd(iso: string) {
  return iso.replace(/-/g, "").slice(0, 8);
}

export function nextDay(ymdStr: string) {
  const y = Number(ymdStr.slice(0, 4));
  const m = Number(ymdStr.slice(4, 6));
  const d = Number(ymdStr.slice(6, 8));
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, "0")}${String(dt.getUTCDate()).padStart(2, "0")}`;
}

export function timed(dateIso: string, hhmm: string) {
  const t = hhmm.replace(":", "").padEnd(4, "0").slice(0, 4);
  return `${ymd(dateIso)}T${t}00`;
}

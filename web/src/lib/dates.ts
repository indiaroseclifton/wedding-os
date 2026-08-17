export function daysUntil(date?: string, today = new Date()) {
  if (!date) return null;
  const due = new Date(`${date}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - start.getTime()) / 86400000);
}

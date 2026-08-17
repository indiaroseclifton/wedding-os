import type { VendorSend } from "@/lib/data/sends-store";

export const BOOKED_STATUSES = ["HIRED", "BOOKED", "PAID_DEPOSIT", "DONE"] as const;

export function isBooked(status?: string) {
  return BOOKED_STATUSES.includes(status as (typeof BOOKED_STATUSES)[number]);
}

export function sendStrip(send?: VendorSend | null) {
  if (!send || send.status !== "SENT") {
    return {
      sent: false,
      received: false,
      openNeeds: 0,
      needTotal: 0,
      openQuestions: 0,
      lastCue: "",
      line: send ? "Draft" : "Not sent",
      attention: false,
    };
  }
  const needs = send.needs || [];
  const openNeeds = needs.filter((n) => !n.done).length;
  const openQuestions = (send.questions || []).filter((q) => !q.answer).length;
  const lastCue = send.lastConfirmed?.title || "";
  const parts: string[] = [];
  parts.push(send.receivedAt ? "Received" : "Sent");
  if (needs.length) parts.push(`${needs.length - openNeeds} of ${needs.length} needs`);
  if (openQuestions) parts.push(`${openQuestions} question${openQuestions === 1 ? "" : "s"}`);
  if (lastCue) parts.push(`Last cue: ${lastCue}`);
  return {
    sent: true,
    received: Boolean(send.receivedAt),
    openNeeds,
    needTotal: needs.length,
    openQuestions,
    lastCue,
    line: parts.join(" · "),
    attention: !send.receivedAt || openNeeds > 0 || openQuestions > 0,
  };
}

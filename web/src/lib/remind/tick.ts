import { DEMO_WORKSPACE, DEMO_WORKSPACE_ID, ensureRsvpTokens, getWorkspaceMembers } from "@/lib/data/workspace";
import { getRemind, saveRemind } from "@/lib/data/remind-store";
import { getSite } from "@/lib/data/site-store";
import { getWorkspaceMeta, updateGuest } from "@/lib/data/store";
import { listPayments } from "@/lib/data/payments-store";
import { getThanks } from "@/lib/data/thanks-store";
import { canAddressNudge, canNudge } from "@/lib/data/guest-mail";
import { loadThisWeek } from "@/lib/this-week";
import { afterPhase } from "@/lib/after-arc";
import { sendAppEmail } from "@/lib/email/send";
import { isFollowUp, nudgeCopy } from "@/lib/email/nudge";

function realEmail(email?: string) {
  if (!email || !email.includes("@")) return false;
  if (email.endsWith("@example.com") || email.endsWith(".example")) return false;
  return true;
}

function sameDay(a?: string, now = new Date()) {
  if (!a) return false;
  const d = new Date(a);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export async function runTick(origin: string) {
  const workspaceId = DEMO_WORKSPACE_ID;
  const meta = await getWorkspaceMeta(workspaceId, DEMO_WORKSPACE.name);
  const [arms, guests, site, members, payments, thanks, week] = await Promise.all([
    getRemind(workspaceId),
    ensureRsvpTokens(workspaceId),
    getSite(workspaceId),
    getWorkspaceMembers(workspaceId),
    listPayments(workspaceId),
    getThanks(workspaceId),
    loadThisWeek(workspaceId, meta.weddingDate),
  ]);

  const names = meta.coupleNames || meta.name || "the wedding";
  const now = new Date();
  const result = {
    digest: "skipped" as string,
    rsvp: 0,
    address: 0,
    failed: 0,
  };

  const coupleTo = [
    ...(arms.digestTo && realEmail(arms.digestTo) ? [arms.digestTo] : []),
    ...members.filter((m) => m.role === "COUPLE" && realEmail(m.email)).map((m) => m.email),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const overdue = payments.filter((p) => p.status === "OVERDUE" || (p.status !== "PAID" && p.dueDate && new Date(`${p.dueDate}T00:00:00`) < now));
  const cardsOpen = (thanks.items || []).filter((i) => i.status !== "SENT").length;
  const after = afterPhase(meta.weddingDate, now);
  const weekItems = week.items;

  const lines: string[] = [];
  if (Array.isArray(weekItems)) {
    for (const item of weekItems.slice(0, 6)) {
      lines.push(`• ${item.title}${item.detail ? ` — ${item.detail}` : ""}`);
    }
  }
  if (overdue.length) {
    const total = overdue.reduce((s, p) => s + (p.amount || 0), 0);
    lines.push(
      `• ${overdue.length} payment${overdue.length === 1 ? "" : "s"} overdue ($${total.toLocaleString()}) — ${overdue
        .map((p) => p.label || p.vendorName)
        .slice(0, 3)
        .join(", ")}`
    );
  }
  if (after.daysAgo != null && after.daysAgo >= 0) {
    lines.push(
      `• Day ${after.daysAgo} after. ${after.current ? after.current.title : "The three months."}${
        cardsOpen ? ` ${cardsOpen} thank-you${cardsOpen === 1 ? "" : "s"} still to write.` : ""
      }`
    );
  }

  if (arms.digest && coupleTo.length && lines.length && !sameDay(arms.lastDigestAt, now)) {
    const text = `What next for ${names}\n\n${lines.join("\n")}\n\n${origin}/dashboard\n`;
    const html = `<p>What next for <strong>${names}</strong></p><ul>${lines
      .map((l) => `<li>${l.replace(/^• /, "")}</li>`)
      .join("")}</ul><p><a href="${origin}/dashboard">Open the desk</a></p>`;
    let ok = false;
    for (const to of coupleTo) {
      const sent = await sendAppEmail({
        to,
        subject: `${names} — what next`,
        text,
        html,
      });
      if (sent.ok) ok = true;
      else result.failed += 1;
    }
    result.digest = ok ? `sent to ${coupleTo.join(", ")}` : "email failed";
    if (ok) await saveRemind(workspaceId, { lastDigestAt: now.toISOString() });
  } else if (!arms.digest) {
    result.digest = "off";
  } else if (!coupleTo.length) {
    result.digest = "no couple email — add one on The chase";
  } else if (sameDay(arms.lastDigestAt, now)) {
    result.digest = "already sent today";
  } else {
    result.digest = "nothing to say";
  }

  if (arms.autoRsvp && site.published) {
    const ready = guests.filter((g) => canNudge(g) && isFollowUp(g));
    for (const g of ready) {
      const link = `${origin}/w/${site.siteToken}/rsvp?guest=${g.rsvpToken}`;
      const copy = nudgeCopy("rsvp", names, g, link);
      const sent = await sendAppEmail({ to: g.email as string, ...copy });
      if (sent.ok) {
        result.rsvp += 1;
        await updateGuest(g.id, { lastNudgedAt: now.toISOString(), nudgeCount: (g.nudgeCount || 0) + 1 });
      } else result.failed += 1;
    }
    if (result.rsvp) await saveRemind(workspaceId, { lastAutoRsvpAt: now.toISOString() });
  }

  if (arms.autoAddress && site.published) {
    const ready = guests.filter((g) => canAddressNudge(g));
    for (const g of ready) {
      const link = `${origin}/w/${site.siteToken}/rsvp?guest=${g.rsvpToken}`;
      const copy = nudgeCopy("address", names, g, link);
      const sent = await sendAppEmail({ to: g.email as string, ...copy });
      if (sent.ok) {
        result.address += 1;
        await updateGuest(g.id, { lastAddressNudgedAt: now.toISOString() });
      } else result.failed += 1;
    }
    if (result.address) await saveRemind(workspaceId, { lastAutoAddressAt: now.toISOString() });
  }

  await saveRemind(workspaceId, { lastTickAt: now.toISOString() });
  return result;
}

import { DEMO_WORKSPACE, getWorkspaceDecisions, getWorkspaceTables } from "@/lib/data/workspace";
import { getWorkspaceMeta, listGuests } from "@/lib/data/store";
import { getDayOf } from "@/lib/data/dayof-store";
import { listVendors, getVendor, updateVendor, type StoredVendor } from "@/lib/data/vendors-store";
import {
  listPayments,
  paymentsForVendor,
  effectiveStatus,
  paymentRollup,
} from "@/lib/data/payments-store";
import { getMusic } from "@/lib/data/music-store";
import { DJ_CUES, mergeCues } from "@/lib/dj-cues";
import { getDietary } from "@/lib/data/dietary-store";
import { getFloorPlan } from "@/lib/data/floorplan-store";
import { CONTRACT_CLAUSES, type ClauseId } from "@/lib/data/contract-review";
import { slotVisible } from "@/lib/data/run-of-show";
import { prettyWeddingDate } from "@/lib/visual-rooms";
import {
  type AttachmentId,
  ATTACHMENTS,
  defaultAttachments,
  categoryKey,
} from "./attachments";
import { getSendForVendor, type VendorSend } from "@/lib/data/sends-store";
import { findHandoffNote } from "./handoff-notes";
import { faceLine } from "@/lib/vendor-face";
import { normalizeVision, visionCover } from "@/lib/vision";

import { kitchenRollup } from "@/lib/data/dietary";

export type PacketSlot = {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  location?: string;
  lead?: string;
  notes?: string;
  confirmedBy?: string[];
};

export type AssembledPacket = {
  couple: string;
  date?: string;
  datePretty?: string;
  location?: string;
  emergency?: string;
  vendor: {
    id: string;
    name: string;
    category: string;
    email?: string;
    phone?: string;
    status: string;
  };
  note?: string;
  whenWhere: { couple: string; date?: string; location?: string; emergency?: string };
  callSheet: PacketSlot[];
  floor: { tables: { name: string; capacity: number; seated: number }[]; fixtures: string[]; room?: string };
  seating: { name: string; people: { name: string; meal?: string; dietary?: string }[] }[];
  cues: {
    acts: { act: string; rows: { label: string; when: string; song: string; extra?: string }[] }[];
    mustPlay: string[];
    doNotPlay: string[];
    announce?: string;
    feel?: string;
    noLineDances?: boolean;
    spotify?: string;
    apple?: string;
  };
  kitchen: {
    heads: number;
    holding?: number;
    meals: { label: string; n: number }[];
    cards: { name: string; note: string; table?: string; meal?: string }[];
    leftover?: { packOut?: string; leftoverTo?: string; donate?: string; fridge?: string; notes?: string };
  };
  money: {
    rows: { label: string; kind: string; amount: number; due?: string; status: string }[];
    paid: number;
    open: number;
  };
  clauses: { label: string; mark: string; ask?: string }[];
  clauseMeta: { namedLead?: string; hours?: string; overtimeRate?: string; coiReceived?: boolean };
  contacts: { role: string; name: string; phone?: string; email?: string }[];
  floral: { notes?: string; fixtures: string[] };
  vision?: {
    vibe?: string;
    formal?: string;
    story?: string;
    avoid?: string;
    hex: string[];
    cover?: string;
    nos: string[];
  };
  handoffNote?: string;
  readiness: { id: AttachmentId; label: string; ready: boolean; hint: string }[];
  gaps: string[];
};

function moneyFmt(n: number) {
  return n;
}

export async function assemblePacket(
  workspaceId: string,
  vendor: StoredVendor,
  attachments?: AttachmentId[]
): Promise<AssembledPacket> {
  const [meta, dayOf, guests, tables, vendors, payments, music, diet, floor, decisions] = await Promise.all([
    getWorkspaceMeta(workspaceId, DEMO_WORKSPACE.name),
    getDayOf(workspaceId),
    listGuests(workspaceId),
    getWorkspaceTables(workspaceId),
    listVendors(workspaceId),
    listPayments(workspaceId),
    getMusic(workspaceId),
    getDietary(workspaceId),
    getFloorPlan(workspaceId),
    getWorkspaceDecisions(workspaceId),
  ]);
  const vision = normalizeVision(decisions.find((d) => d.type === "STYLE_VIBE")?.payload);

  const couple = meta.coupleNames || meta.name;
  const key = categoryKey(vendor.category);
  const kitchen = kitchenRollup(guests, "plates");
  const meals = kitchen.meals;
  const cards = kitchen.cards.map((g) => ({
    name: g.name,
    note: g.dietary || g.meal || "",
    table: g.tableLabel,
    meal: g.meal,
  }));

  const cues = mergeCues(music.cues || music.moments);
  const acts = (["ceremony", "cocktail", "reception"] as const).map((act) => ({
    act,
    rows: DJ_CUES.filter((c) => c.act === act).map((def) => {
      const row = cues.find((c) => c.id === def.id);
      return {
        label: def.label,
        when: def.when,
        song: row?.skip ? "— skip" : row?.song?.trim() || "(not set)",
        extra: [row?.who, row?.notes].filter(Boolean).join(" · ") || undefined,
      };
    }),
  }));

  const needle = vendor.name.toLowerCase().split(/\s+/)[0];
  const cat = vendor.category.toLowerCase();
  const mine = (dayOf.schedule || []).filter((s) => {
    if (!slotVisible(s, "vendor")) return false;
    const hay = `${s.lead || ""} ${s.title} ${s.assignee || ""}`.toLowerCase();
    return hay.includes(needle) || hay.includes(cat.split(" ")[0]) || hay.includes(key);
  });
  const callSheet = (mine.length ? mine : (dayOf.schedule || []).filter((s) => slotVisible(s, "vendor"))).map(
    (s) => ({
      id: s.id,
      time: s.time,
      endTime: s.endTime,
      title: s.title,
      location: s.location,
      lead: s.lead,
      notes: s.notes,
      confirmedBy: s.confirmedBy,
    })
  );

  const seating = tables.map((t) => ({
    name: t.name,
    people: guests
      .filter((g) => g.tableLabel === t.name)
      .map((g) => ({ name: g.name, meal: g.meal, dietary: g.dietary })),
  }));

  const fixtures = (floor.objects || []).map((o) => o.label || o.kind.replaceAll("_", " ").toLowerCase());
  const tableRows = tables.map((t) => ({
    name: t.name,
    capacity: t.capacity,
    seated: guests.filter((g) => g.tableLabel === t.name).length,
  }));

  const minePay = paymentsForVendor(payments, vendor);
  const roll = paymentRollup(minePay);

  const flags = Object.entries(vendor.contractReview?.clauses || {})
    .filter(([, mark]) => mark === "flag" || mark === "good")
    .map(([id, mark]) => {
      const def = CONTRACT_CLAUSES.find((c) => c.id === (id as ClauseId));
      return {
        label: def?.label || id,
        mark: mark as string,
        ask: mark === "flag" ? def?.ask : undefined,
      };
    });

  const booked = vendors.filter((v) => ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(v.status));
  const contacts: AssembledPacket["contacts"] = [
    { role: "Couple", name: couple, phone: dayOf.emergencyContact, email: undefined },
  ];
  for (const v of booked) {
    if (v.id === vendor.id) continue;
    if (key === "dj" && !/venue|planner|coord/.test(v.category.toLowerCase())) continue;
    contacts.push({
      role: v.category,
      name: v.name,
      phone: v.phone,
      email: v.email,
    });
  }

  const floralFixtures = fixtures.filter((f) => /aisle|altar|ceremony|head|cake|escort/i.test(f));

  const packet: AssembledPacket = {
    couple,
    date: meta.weddingDate,
    datePretty: prettyWeddingDate(meta.weddingDate),
    location: meta.location,
    emergency: dayOf.emergencyContact,
    vendor: {
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      email: vendor.email,
      phone: vendor.phone,
      status: vendor.status,
    },
    whenWhere: {
      couple,
      date: prettyWeddingDate(meta.weddingDate),
      location: meta.location,
      emergency: dayOf.emergencyContact,
    },
    callSheet,
    floor: {
      tables: tableRows,
      fixtures,
      room: floor.room ? `${floor.room.widthFt} × ${floor.room.depthFt} ft` : undefined,
    },
    seating,
    cues: {
      acts,
      mustPlay: music.mustPlay || [],
      doNotPlay: music.doNotPlay || [],
      announce: music.announceNames,
      feel: [music.genres, music.energy].filter(Boolean).join(" · ") || undefined,
      noLineDances: music.noLineDances,
      spotify: music.spotify?.playlistUrl,
      apple: music.appleMusic?.playlistUrl,
    },
    kitchen: {
      heads: kitchen.heads,
      holding: kitchen.holding !== kitchen.plates ? kitchen.holding : undefined,
      meals: Array.from(meals.entries()).map(([label, n]) => ({ label, n })),
      cards,
      leftover: {
        packOut: diet.packOut,
        leftoverTo: diet.leftoverTo,
        donate: diet.donate,
        fridge: diet.fridge,
        notes: diet.notes,
      },
    },
    money: {
      rows: minePay.map((p) => ({
        label: p.label,
        kind: p.kind,
        amount: moneyFmt(p.amount),
        due: p.dueDate,
        status: effectiveStatus(p),
      })),
      paid: roll.paid,
      open: roll.open,
    },
    clauses: flags,
    clauseMeta: {
      namedLead: vendor.contractReview?.namedLead,
      hours: vendor.contractReview?.hours,
      overtimeRate: vendor.contractReview?.overtimeRate,
      coiReceived: vendor.contractReview?.coiReceived,
    },
    contacts,
    floral: {
      notes: [vendor.notes, faceLine(vendor.face, vendor.category)].filter(Boolean).join(" · ") || undefined,
      fixtures: floralFixtures.length ? floralFixtures : fixtures,
    },
    vision: {
      vibe: vision.vibe,
      formal: vision.formal,
      story: vision.story,
      avoid: vision.avoid,
      hex: vision.palette?.hex || [],
      cover: visionCover(vision),
      nos: vision.reject.map((p) => p.url),
    },
    handoffNote: (await findHandoffNote(workspaceId, vendor)) || undefined,
    readiness: [],
    gaps: [],
  };

  const chosen = attachments || defaultAttachments(vendor.category);
  packet.readiness = chosen.map((id) => readinessOf(id, packet, vendor));
  packet.gaps = buildGaps(vendor, packet, chosen);
  return packet;
}

function readinessOf(id: AttachmentId, p: AssembledPacket, vendor: StoredVendor) {
  const label = ATTACHMENTS[id].label;
  if (id === "when_where") {
    const ready = Boolean(p.datePretty && p.location);
    return { id, label, ready, hint: ready ? [p.datePretty, p.location].filter(Boolean).join(" · ") : "Set date and city in Settings" };
  }
  if (id === "call_sheet") {
    const ready = p.callSheet.length > 0;
    return { id, label, ready, hint: ready ? `${p.callSheet.length} cues` : "No run of show yet" };
  }
  if (id === "floor") {
    const n = p.floor.tables.length + p.floor.fixtures.length;
    return { id, label, ready: n > 0, hint: n ? `${p.floor.tables.length} tables` : "Room planner is empty" };
  }
  if (id === "seating") {
    const seated = p.seating.reduce((s, t) => s + t.people.length, 0);
    return { id, label, ready: seated > 0, hint: seated ? `${seated} seated` : "No one assigned to a table" };
  }
  if (id === "cues") {
    const set = p.cues.acts.flatMap((a) => a.rows).filter((r) => r.song && r.song !== "(not set)" && r.song !== "— skip").length;
    return { id, label, ready: set > 0 || p.cues.mustPlay.length > 0, hint: set ? `${set} cues set` : "Cue book is empty" };
  }
  if (id === "kitchen") {
    return {
      id,
      label,
      ready: p.kitchen.heads > 0,
      hint: p.kitchen.heads ? `${p.kitchen.heads} heads · ${p.kitchen.cards.length} allergy cards` : "No guests yet",
    };
  }
  if (id === "money") {
    return {
      id,
      label,
      ready: p.money.rows.length > 0,
      hint: p.money.rows.length ? `${p.money.rows.length} line${p.money.rows.length === 1 ? "" : "s"}` : "No deposits on the ledger",
    };
  }
  if (id === "clauses") {
    const n = p.clauses.length;
    return { id, label, ready: n > 0 || Boolean(p.clauseMeta.namedLead || p.clauseMeta.hours), hint: n ? `${n} marked` : "Nothing marked on the contract" };
  }
  if (id === "contacts") {
    return { id, label, ready: true, hint: `${p.contacts.length} people` };
  }
  if (id === "floral") {
    const ready = Boolean(vendor.notes || p.floral.fixtures.length);
    return { id, label, ready, hint: ready ? "Notes + floor" : "Add notes on the vendor" };
  }
  return { id, label, ready: true, hint: "" };
}

function buildGaps(vendor: StoredVendor, p: AssembledPacket, chosen: AttachmentId[]) {
  const gaps: string[] = [];
  if (!vendor.email) gaps.push("No email on this vendor — you’ll copy the link");
  for (const row of p.readiness) {
    if (chosen.includes(row.id) && !row.ready) gaps.push(row.hint);
  }
  return gaps;
}

export async function loadSendPreview(workspaceId: string, vendorId: string) {
  const vendor = await getVendor(vendorId);
  if (!vendor || vendor.workspaceId !== workspaceId) return null;
  const existing = await getSendForVendor(workspaceId, vendorId);
  const attachments = existing?.attachments?.length ? existing.attachments : defaultAttachments(vendor.category);
  const packet = await assemblePacket(workspaceId, vendor, attachments);
  return { vendor, existing, attachments, packet };
}

export async function tickHandoffChecklist(vendor: StoredVendor) {
  const items = (vendor.checklist || []).map((item) =>
    /handoff|packet sent/i.test(item.title) ? { ...item, done: true } : item
  );
  if (items === vendor.checklist) return vendor;
  const changed = items.some((item, i) => item.done !== vendor.checklist?.[i]?.done);
  if (!changed) return vendor;
  return (await updateVendor(vendor.id, { checklist: items })) || vendor;
}

export function sendHref(send: VendorSend) {
  return `/v/${send.token}`;
}

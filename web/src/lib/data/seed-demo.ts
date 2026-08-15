import { promises as fs } from "fs";
import path from "path";
import {
  addGuest,
  addTable,
  addTask,
  DEMO_USERS,
  ensureDemoWorkspace,
  savePrioritiesDecision,
  saveStyleVibeDecision,
} from "./workspace";
import { createVendor } from "./vendors-store";
import { saveMusic } from "./music-store";
import { addPayment } from "./payments-store";
import { createPackage } from "./handoffs-store";

const flagFile = path.join(process.cwd(), ".data", ".seeded");

export async function seedDemoIfEmpty(options?: { force?: boolean }) {
  if (!options?.force) {
    try {
      await fs.access(flagFile);
      return { seeded: false, reason: "already_seeded" as const };
    } catch {
      // continue
    }
  }

  const { workspace } = await ensureDemoWorkspace();
  const ws = workspace.id;

  // Decisions (guided start)
  await savePrioritiesDecision({
    workspaceId: ws,
    status: "DECIDED",
    summary: "Guest experience and photos first; budget as a hard boundary.",
    payload: {
      top: ["Guest experience", "Photography", "Food"],
      tradeoffs: "Willing to simplify florals to protect photo and food quality.",
    },
    participantIds: [DEMO_USERS.alex.id, DEMO_USERS.jordan.id],
  });
  await saveStyleVibeDecision({
    workspaceId: ws,
    status: "EXPLORING",
    summary: "Warm modern · outdoor-friendly · not formal black-tie.",
    payload: { vibe: "Warm modern", formality: "Semi-formal" },
    participantIds: [DEMO_USERS.alex.id, DEMO_USERS.jordan.id],
  });

  // Guests (dietary for catering handoff)
  await addGuest({
    workspaceId: ws,
    name: "Sam Chen",
    side: "A",
    rsvp: "YES",
    plusOnes: 1,
    dietary: "Vegetarian",
    tableLabel: "Table 1",
  });
  await addGuest({
    workspaceId: ws,
    name: "Riley Brooks",
    side: "B",
    rsvp: "YES",
    plusOnes: 0,
    dietary: "Nut allergy",
    tableLabel: "Table 1",
  });
  await addGuest({
    workspaceId: ws,
    name: "Morgan Diaz",
    side: "A",
    rsvp: "YES",
    plusOnes: 0,
    dietary: "Gluten-free",
    tableLabel: "Table 2",
  });
  await addGuest({
    workspaceId: ws,
    name: "Jordan's parents",
    side: "B",
    rsvp: "INVITED",
    plusOnes: 0,
  });
  await addGuest({
    workspaceId: ws,
    name: "Alex's sister",
    side: "A",
    rsvp: "MAYBE",
    plusOnes: 1,
  });

  // Tables for seating / bulk assign
  await addTable({ workspaceId: ws, name: "Table 1", capacity: 8, shape: "ROUND" });
  await addTable({ workspaceId: ws, name: "Table 2", capacity: 8, shape: "ROUND" });
  await addTable({ workspaceId: ws, name: "Head table", capacity: 6, shape: "HEAD" });

  // Vendors + payment
  await createVendor({
    workspaceId: ws,
    name: "Northside Venue",
    category: "Venue",
    status: "BOOKED",
    email: "events@northside.example",
  });
  await createVendor({
    workspaceId: ws,
    name: "Lens & Light Studio",
    category: "Photographer",
    status: "CONTACTED",
  });
  await createVendor({
    workspaceId: ws,
    name: "Spin City DJ",
    category: "DJ",
    status: "PROPOSAL",
  });
  await createVendor({
    workspaceId: ws,
    name: "Harvest Catering",
    category: "Catering",
    status: "BOOKED",
  });

  await addPayment({
    workspaceId: ws,
    vendorName: "Northside Venue",
    label: "Venue deposit",
    amount: 2500,
    dueDate: "2026-09-01",
    notes: "Sample payment",
  });

  // Music for DJ handoff prefill
  await saveMusic(ws, {
    mustPlay: ["First dance — pick final song", "Last song of the night"],
    doNotPlay: ["Chicken Dance", "Anything explicitly on the no-list"],
    moments: [
      { label: "Processional", song: "TBD" },
      { label: "First dance", song: "TBD" },
      { label: "Last song", song: "TBD" },
    ],
    notes: "Keep energy high after dinner; soft during dinner service.",
  });

  // Tasks across owners
  await addTask({
    workspaceId: ws,
    title: "Send draft timeline to day-of coordinator",
    ownerId: DEMO_USERS.alex.id,
    ownerName: DEMO_USERS.alex.name,
    dueDate: "2026-08-20",
  });
  await addTask({
    workspaceId: ws,
    title: "Collect final song list",
    ownerId: DEMO_USERS.jordan.id,
    ownerName: DEMO_USERS.jordan.name,
    dueDate: "2026-08-25",
  });
  await addTask({
    workspaceId: ws,
    title: "Confirm catering headcount",
    ownerId: DEMO_USERS.alex.id,
    ownerName: DEMO_USERS.alex.name,
  });

  // Draft handoff packages (optional starting points)
  await createPackage({
    workspaceId: ws,
    template: "DJ",
    title: "DJ package (draft)",
    recipientName: "Spin City DJ",
  });

  await fs.mkdir(path.dirname(flagFile), { recursive: true });
  await fs.writeFile(flagFile, new Date().toISOString(), "utf8");
  return { seeded: true, reason: "ok" as const };
}

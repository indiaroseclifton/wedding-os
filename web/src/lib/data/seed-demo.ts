import { promises as fs } from "fs";
import path from "path";
import {
  addGuest,
  addTask,
  DEMO_USERS,
  ensureDemoWorkspace,
} from "./workspace";
import { createVendor } from "./vendors-store";

const flagFile = path.join(process.cwd(), ".data", ".seeded");

export async function seedDemoIfEmpty() {
  try {
    await fs.access(flagFile);
    return { seeded: false };
  } catch {
    // not seeded yet
  }

  const { workspace } = await ensureDemoWorkspace();

  await addGuest({
    workspaceId: workspace.id,
    name: "Sam Chen",
    side: "A",
    rsvp: "YES",
    plusOnes: 1,
    dietary: "Vegetarian",
  });
  await addGuest({
    workspaceId: workspace.id,
    name: "Riley Brooks",
    side: "B",
    rsvp: "YES",
    plusOnes: 0,
    dietary: "Nut allergy",
  });
  await addGuest({
    workspaceId: workspace.id,
    name: "Jordan's parents",
    side: "B",
    rsvp: "INVITED",
    plusOnes: 0,
  });

  await createVendor({
    workspaceId: workspace.id,
    name: "Northside Venue",
    category: "Venue",
    status: "BOOKED",
    email: "events@northside.example",
  });
  await createVendor({
    workspaceId: workspace.id,
    name: "Lens & Light Studio",
    category: "Photographer",
    status: "CONTACTED",
  });

  await addTask({
    workspaceId: workspace.id,
    title: "Send draft timeline to day-of coordinator",
    ownerId: DEMO_USERS.alex.id,
    ownerName: DEMO_USERS.alex.name,
  });
  await addTask({
    workspaceId: workspace.id,
    title: "Collect final song list",
    ownerId: DEMO_USERS.jordan.id,
    ownerName: DEMO_USERS.jordan.name,
  });

  await fs.mkdir(path.dirname(flagFile), { recursive: true });
  await fs.writeFile(flagFile, new Date().toISOString(), "utf8");
  return { seeded: true };
}

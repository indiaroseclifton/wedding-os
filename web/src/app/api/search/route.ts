import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/access";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  getWorkspaceTasks,
} from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";

export async function GET(request: Request) {
  const access = await requireSession();
  if (!access.ok) return access.response;

  const q = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const { workspace } = await ensureDemoWorkspace();
  const [guests, tasks, vendors] = await Promise.all([
    getWorkspaceGuests(workspace.id),
    getWorkspaceTasks(workspace.id),
    listVendors(workspace.id),
  ]);

  const results: { type: string; title: string; href: string; meta?: string }[] = [];

  for (const g of guests) {
    if (g.name.toLowerCase().includes(q) || g.email?.toLowerCase().includes(q)) {
      results.push({
        type: "Guest",
        title: g.name,
        href: `/guests/${g.id}`,
        meta: g.rsvp,
      });
    }
  }
  for (const t of tasks) {
    if (t.title.toLowerCase().includes(q)) {
      results.push({
        type: "Task",
        title: t.title,
        href: "/tasks",
        meta: t.status,
      });
    }
  }
  for (const v of vendors) {
    if (v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)) {
      results.push({
        type: "Vendor",
        title: v.name,
        href: `/vendors/${v.id}`,
        meta: v.category,
      });
    }
  }

  return NextResponse.json({ results: results.slice(0, 20) });
}

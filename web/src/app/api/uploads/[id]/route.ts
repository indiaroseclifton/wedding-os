import { NextResponse } from "next/server";
import { getUpload, readLocalFile } from "@/lib/data/uploads";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: raw } = await context.params;
  const id = raw.replace(/\.[a-z0-9]+$/i, "");
  const row = await getUpload(id);
  if (!row) return new NextResponse("Not found", { status: 404 });
  if (row.url.startsWith("http")) {
    return NextResponse.redirect(row.url);
  }
  const file = await readLocalFile(id);
  if (!file) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `inline; filename="${file.name.replace(/"/g, "")}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

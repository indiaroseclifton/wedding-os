import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { putUpload } from "@/lib/data/uploads";

const MAX = 8 * 1024 * 1024;
const OK = /^(image\/(jpeg|png|webp|gif)|application\/pdf)$/;

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file" }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "Under 8 MB" }, { status: 400 });
  }
  if (!OK.test(file.type)) {
    return NextResponse.json({ error: "PDF or image only" }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const upload = await putUpload(workspace.id, {
    name: file.name,
    type: file.type,
    bytes,
  });
  return NextResponse.json({ upload, blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
}

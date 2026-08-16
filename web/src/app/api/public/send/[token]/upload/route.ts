import { NextResponse } from "next/server";
import { getSendByToken } from "@/lib/data/sends-store";
import { putUpload } from "@/lib/data/uploads";

const MAX = 8 * 1024 * 1024;
const OK = /^(image\/(jpeg|png|webp|gif)|application\/pdf)$/;

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const send = await getSendByToken(token);
  if (!send || send.status !== "SENT") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file" }, { status: 400 });
  }
  if (file.size > MAX) return NextResponse.json({ error: "Under 8 MB" }, { status: 400 });
  if (!OK.test(file.type)) return NextResponse.json({ error: "PDF or image only" }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const upload = await putUpload(send.workspaceId, {
    name: file.name,
    type: file.type,
    bytes,
  });
  return NextResponse.json({ upload });
}

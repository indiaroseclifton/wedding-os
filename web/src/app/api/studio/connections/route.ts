import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { putUpload } from "@/lib/data/uploads";
import {
  connectionStatuses,
  disconnect,
  providerRequest,
} from "@/lib/studio/connections";
import { sameOrigin } from "@/lib/studio/validation";
type Design = {
  id: string;
  title?: string;
  thumbnail?: { url: string };
  urls?: { edit_url?: string; view_url?: string };
};
type Pin = {
  id: string;
  title?: string;
  description?: string;
  link?: string;
  media?: { images?: Record<string, { url?: string }> };
};
type Export = {
  job: {
    id: string;
    status: string;
    urls?: string[];
    error?: { message?: string };
  };
};
export async function GET(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace(),
    user = access.session.userId,
    url = new URL(request.url),
    p = url.searchParams.get("provider");
  try {
    if (!p)
      return NextResponse.json(
        { connections: await connectionStatuses(workspace.id, user) },
        { headers: { "Cache-Control": "no-store" } },
      );
    if (p === "canva") {
      const query = new URLSearchParams({ limit: "30" });
      if (url.searchParams.get("query"))
        query.set("query", url.searchParams.get("query")!.slice(0, 150));
      if (url.searchParams.get("cursor"))
        query.set("continuation", url.searchParams.get("cursor")!);
      const data = await providerRequest<{
        items: Design[];
        continuation?: string;
      }>(workspace.id, user, p, `/designs?${query}`);
      return NextResponse.json({
        items: (data.items || []).map((d) => ({
          id: d.id,
          name: d.title || "Untitled Canva design",
          image: d.thumbnail?.url || "",
          url: d.urls?.edit_url || d.urls?.view_url || "",
        })),
        cursor: data.continuation || "",
      });
    }
    if (p === "pinterest") {
      const board = url.searchParams.get("board"),
        query = new URLSearchParams({ page_size: "25" });
      if (url.searchParams.get("cursor"))
        query.set("bookmark", url.searchParams.get("cursor")!);
      if (board) {
        const data = await providerRequest<{ items: Pin[]; bookmark?: string }>(
          workspace.id,
          user,
          p,
          `/boards/${encodeURIComponent(board)}/pins?${query}`,
        );
        return NextResponse.json({
          items: (data.items || []).map((pin) => ({
            id: pin.id,
            name: pin.title || "Saved inspiration",
            image:
              pin.media?.images?.["600x"]?.url ||
              Object.values(pin.media?.images || {}).find((i) => i.url)?.url ||
              "",
            url: `https://www.pinterest.com/pin/${pin.id}/`,
            note: pin.description || "",
          })),
          cursor: data.bookmark || "",
        });
      }
      const data = await providerRequest<{
        items: { id: string; name: string; privacy?: string }[];
        bookmark?: string;
      }>(workspace.id, user, p, `/boards?${query}`);
      return NextResponse.json({
        items: (data.items || [])
          .filter((b) => b.privacy === "PUBLIC")
          .map((b) => ({ id: b.id, name: b.name, image: "", url: "" })),
        cursor: data.bookmark || "",
      });
    }
    return NextResponse.json(
      { error: "Unsupported provider" },
      { status: 400 },
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request origin does not match" },
      { status: 403 },
    );
  const { workspace } = await ensureDemoWorkspace(),
    user = access.session.userId;
  try {
    const body = await request.json();
    if (body.action === "disconnect") {
      const p = z.enum(["canva", "pinterest"]).parse(body.provider);
      await disconnect(workspace.id, user, p);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "export") {
      const id = z.string().min(1).max(100).parse(body.designId),
        format = z.enum(["png", "pdf"]).parse(body.format || "png");
      const result = await providerRequest<Export>(
        workspace.id,
        user,
        "canva",
        "/exports",
        {
          design_id: id,
          format:
            format === "png"
              ? { type: "png", pages: [1], width: 1800 }
              : { type: "pdf" },
        },
      );
      return NextResponse.json({
        id: result.job.id,
        status: result.job.status,
      });
    }
    if (body.action === "export-status") {
      const id = z.string().min(1).max(120).parse(body.id),
        result = await providerRequest<Export>(
          workspace.id,
          user,
          "canva",
          `/exports/${encodeURIComponent(id)}`,
        );
      if (result.job.status !== "success")
        return NextResponse.json({
          status: result.job.status,
          error: result.job.error?.message,
        });
      const raw = result.job.urls?.[0];
      if (!raw)
        throw new Error(
          "Canva returned no export file. Export it manually and upload it in your project.",
        );
      const remote = new URL(raw);
      if (
        remote.protocol !== "https:" ||
        !/(^|\.)canva\.(com|cn)$/.test(remote.hostname)
      )
        throw new Error(
          "This export uses an unsupported download host. Download from Canva and upload the file to Studio.",
        );
      const response = await fetch(remote, {
        redirect: "error",
        signal: AbortSignal.timeout(20000),
      });
      if (
        !response.ok ||
        Number(response.headers.get("content-length")) > 8000000
      )
        throw new Error("Export could not be downloaded or exceeds 8 MB.");
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 8000000)
        throw new Error("Export exceeds the 8 MB file limit.");
      const type =
        bytes.subarray(0, 4).toString() === "%PDF"
          ? "application/pdf"
          : bytes
                .subarray(0, 8)
                .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            ? "image/png"
            : "";
      if (!type) throw new Error("Expected a PNG or PDF export.");
      const upload = await putUpload(workspace.id, {
        name: `canva-${id}.${type === "image/png" ? "png" : "pdf"}`,
        type,
        bytes,
      });
      return NextResponse.json({ status: "success", upload });
    }
    return NextResponse.json(
      { error: "Unsupported connection action" },
      { status: 400 },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof z.ZodError
            ? "Check the connection request."
            : (e as Error).message,
      },
      { status: 400 },
    );
  }
}

import { notFound, redirect } from "next/navigation";
import { resolvePortalToken } from "@/lib/send/resolve-portal";

export default async function LegacyVendorPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const live = await resolvePortalToken(token);
  if (!live) notFound();
  redirect(`/v/${live}`);
}

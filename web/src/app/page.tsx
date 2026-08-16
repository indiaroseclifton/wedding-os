import { getSessionUser } from "@/lib/auth/session";
import { LandingView } from "@/components/landing/LandingView";

export default async function HomePage() {
  const session = await getSessionUser();
  return <LandingView signedIn={Boolean(session)} />;
}

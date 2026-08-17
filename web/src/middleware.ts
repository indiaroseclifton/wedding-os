import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/" ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/discover") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/w/") ||
    pathname.startsWith("/ros/") ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/integrations/spotify/callback") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const demo = request.cookies.get("wedding_os_user");
  const authjs =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  if (!demo && !authjs && process.env.DEMO_AUTH === "0") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

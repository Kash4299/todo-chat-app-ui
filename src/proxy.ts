import { LOCAL_ACCESS_COOKIE, LOCAL_REFRESH_COOKIE } from "@/lib/backend-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/home",
  "/todos",
  "/kanban",
  "/list",
  "/calendar",
  "/chat",
  "/notifications",
  "/people",
  "/search",
  "/settings",
  "/onboarding",
  "/workspace",
];

// Next.js 16 edge guard (the "proxy" convention, formerly "middleware").
// Pure self-hosted-session check via cookies — no Auth0.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession = Boolean(
    request.cookies.get(LOCAL_ACCESS_COOKIE)?.value ||
      request.cookies.get(LOCAL_REFRESH_COOKIE)?.value,
  );

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (hasSession && pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (!hasSession && isProtected) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Pages only — skip the BFF API routes, Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

import { auth0 } from "./lib/auth0";
import { LOCAL_ACCESS_COOKIE, LOCAL_REFRESH_COOKIE } from "./lib/backend-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasLocalSession = Boolean(
    request.cookies.get(LOCAL_ACCESS_COOKIE)?.value ||
      request.cookies.get(LOCAL_REFRESH_COOKIE)?.value,
  );
  const isDashboardRoute = pathname === "/todos" || pathname === "/chat";

  if (pathname.startsWith("/auth/")) {
    return auth0.middleware(request);
  }

  if (hasLocalSession && pathname === "/") {
    return NextResponse.redirect(new URL("/todos", request.url));
  }

  if (hasLocalSession && isDashboardRoute) {
    return NextResponse.next();
  }

  const authResponse = await auth0.middleware(request);
  const session = await auth0.getSession(request);

  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/todos", request.url));
  }

  if (!session && isDashboardRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Always return the auth response.
  //
  // Note: The auth response forwards requests to your app routes by default.
  // If you need to block requests, do it before calling auth0.middleware() or
  // copy the authResponse headers except for x-middleware-next to your blocking response.
  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

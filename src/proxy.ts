import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  AFTER_SIGN_IN_PATH,
  AUTH_COOKIE_PREFIX,
  GUEST_ONLY_PATHS,
  PROTECTED_PREFIXES,
  SIGN_IN_PATH,
} from "@/lib/auth-config";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(
    getSessionCookie(request, { cookiePrefix: AUTH_COOKIE_PREFIX }),
  );

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    const signInUrl = new URL(SIGN_IN_PATH, request.url);
    signInUrl.searchParams.set("callbackURL", `${pathname}${search}`);

    return NextResponse.redirect(signInUrl);
  }

  if (hasSession && GUEST_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(AFTER_SIGN_IN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/dashboard/:path*", "/projects/:path*", "/settings/:path*"],
};

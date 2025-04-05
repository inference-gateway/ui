import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ROUTES = {
  HOME: "/home",
  ROOT: "/",
  AUTH: {
    SIGNIN: "/auth/signin",
    ERROR: "/auth/error",
    VERIFY: "/auth/verify",
    ROOT: "/auth/",
  },
  API: {
    AUTH: "/api/auth",
  },
};

const STATIC_PATHS = ["/_next", "/favicon.ico", "/images"];

const PUBLIC_API_PATHS = [ROUTES.API.AUTH];

const PUBLIC_PATHS = [
  ROUTES.AUTH.SIGNIN,
  ROUTES.AUTH.ERROR,
  ROUTES.AUTH.VERIFY,
  ROUTES.AUTH.ROOT,
  ...PUBLIC_API_PATHS,
  ...STATIC_PATHS,
];

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path));

const log = (message: string): void => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Middleware] ${message}`);
  }
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authEnabled = process.env.AUTH_ENABLED === "true";

  log(`Path: ${pathname} | Auth Enabled: ${authEnabled}`);

  if (pathname === ROUTES.ROOT) {
    log("Redirecting root path to home page");
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  if (!authEnabled || isPublicPath(pathname)) {
    log(`Skipping auth check: ${pathname}`);
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  log(`Token exists: ${!!token}`);

  if (
    token &&
    (pathname === ROUTES.AUTH.SIGNIN || pathname === ROUTES.AUTH.ROOT)
  ) {
    log("Redirecting authenticated user from auth page");
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  if (!token) {
    log("Redirecting unauthenticated user to signin");
    return NextResponse.redirect(new URL(ROUTES.AUTH.SIGNIN, request.url));
  }

  log(`Access granted to protected route: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    ROUTES.ROOT,
    "/((?!_next/static|_next/image|images|favicon.ico|api/v1).*)",
  ],
};

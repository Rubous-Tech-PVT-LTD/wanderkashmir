import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin/auth";

/**
 * Editorial path prefixes accessible to users with the EDITOR role.
 * (Normalized against internal /admin/... paths).
 */
const EDITOR_ALLOWED_PREFIXES = [
  "/admin/destinations",
  "/admin/places",
  "/admin/experiences",
  "/admin/seo",
  "/admin/seo-comments",
  "/admin/tours",
  "/admin/tour-categories",
  "/admin/travel-styles",
  "/admin/popups",
];

/**
 * Validates whether a specific internal /admin path is accessible to an EDITOR.
 */
function isRouteAllowedForEditor(adminPath: string): boolean {
  if (adminPath === "/admin" || adminPath === "/admin/") {
    return true;
  }
  return EDITOR_ALLOWED_PREFIXES.some(
    (prefix) => adminPath === prefix || adminPath.startsWith(`${prefix}/`)
  );
}

/**
 * Validates role-based permissions:
 * - ADMIN: full access across all admin routes.
 * - EDITOR: restricted strictly to CMS and editorial content routes.
 * - VENDOR, CUSTOMER, or invalid: zero access to admin portal.
 */
function checkAdminRoleAccess(
  role: string | undefined,
  adminInternalPath: string
): { allowed: boolean } {
  if (role === "ADMIN") {
    return { allowed: true };
  }
  if (role === "EDITOR") {
    return { allowed: isRouteAllowedForEditor(adminInternalPath) };
  }
  return { allowed: false };
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || request.nextUrl.host || "";
  const hostname = host.split(":")[0].toLowerCase();

  // 1. ABSOLUTE VENDOR ISOLATION:
  // vendor.wanderkashmir.com (and any vendor.* subdomains) must completely bypass Admin routing logic.
  if (hostname === "vendor.wanderkashmir.com" || hostname.startsWith("vendor.")) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isAdminDomain = hostname === "admin.wanderkashmir.com" || hostname.startsWith("admin.");

  // Helper for rewrite to admin with header tracking
  const rewriteToAdmin = (targetPath: string) => {
    const internalUrl = request.nextUrl.clone();
    internalUrl.pathname = targetPath;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-alias", pathname.startsWith("/wander-admin") ? "wander-admin" : "admin-domain");
    return NextResponse.rewrite(internalUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  };

  // 2. ADMIN DOMAIN ROUTING (admin.wanderkashmir.com / admin.*)
  if (isAdminDomain) {
    // Unauthenticated public admin pages
    if (pathname === "/admin/login" || pathname === "/wander-admin/login" || pathname === "/login") {
      if (pathname === "/admin/login") return NextResponse.next();
      return rewriteToAdmin("/admin/login");
    }
    if (pathname === "/admin/unauthorized" || pathname === "/wander-admin/unauthorized" || pathname === "/unauthorized") {
      if (pathname === "/admin/unauthorized") return NextResponse.next();
      return rewriteToAdmin("/admin/unauthorized");
    }

    // Auth API endpoints bypass middleware check
    if (pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAdminToken(sessionCookie);
    if (!session) {
      const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Resolve internal target path for permission validation
    const targetAdminPath =
      pathname === "/" || pathname === "/admin" || pathname === "/wander-admin"
        ? "/admin"
        : pathname.startsWith("/wander-admin/")
        ? `/admin${pathname.slice("/wander-admin".length)}`
        : pathname.startsWith("/admin/")
        ? pathname
        : `/admin${pathname}`;

    const access = checkAdminRoleAccess(session.role, targetAdminPath);
    if (!access.allowed) {
      const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Authenticated allowed navigation on admin domain:
    if (pathname === "/" || pathname === "/admin" || pathname === "/wander-admin") {
      return rewriteToAdmin("/admin");
    }

    if (pathname.startsWith("/wander-admin/")) {
      const subpath = pathname.slice("/wander-admin".length);
      return rewriteToAdmin(`/admin${subpath}`);
    }

    if (pathname.startsWith("/admin/")) {
      return NextResponse.next();
    }

    // Direct admin module navigation (e.g. /tours -> /admin/tours)
    return rewriteToAdmin(`/admin${pathname}`);
  }

  // 3. EXTERNAL ADMIN ALIAS ON NON-ADMIN DOMAINS: /wander-admin and /wander-admin/*
  if (pathname === "/wander-admin" || pathname.startsWith("/wander-admin/")) {
    // Public / unauthenticated admin pages under the /wander-admin alias
    if (pathname === "/wander-admin/login") {
      return rewriteToAdmin("/admin/login");
    }
    if (pathname === "/wander-admin/unauthorized") {
      return rewriteToAdmin("/admin/unauthorized");
    }

    // Authentication check for protected /wander-admin routes
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/wander-admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAdminToken(sessionCookie);
    if (!session) {
      const unauthorizedUrl = new URL("/wander-admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Map to internal /admin path for permission evaluation
    const internalSubpath = pathname === "/wander-admin"
      ? ""
      : pathname.slice("/wander-admin".length);
    const internalPath = `/admin${internalSubpath}`;

    const access = checkAdminRoleAccess(session.role, internalPath);
    if (!access.allowed) {
      const unauthorizedUrl = new URL("/wander-admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    return rewriteToAdmin(internalPath);
  }

  // 4. DIRECT /admin and /admin/* ROUTES ON NON-ADMIN DOMAINS
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Allow login and unauthorized feedback pages without credentials
    if (pathname === "/admin/login" || pathname === "/admin/unauthorized") {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyAdminToken(sessionCookie);
    if (!session) {
      const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    const access = checkAdminRoleAccess(session.role, pathname);
    if (!access.allowed) {
      const unauthorizedUrl = new URL("/admin/unauthorized", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  }

  // 5. PUBLIC CONSUMER WEBSITE (wanderkashmir.com, www.wanderkashmir.com, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

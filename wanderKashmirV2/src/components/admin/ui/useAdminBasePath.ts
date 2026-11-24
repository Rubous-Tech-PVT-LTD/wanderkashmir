"use client";

import { usePathname } from "next/navigation";

/**
 * Preserves whether the current admin session is accessed via `/wander-admin` or `/admin`.
 */
export function useAdminBasePath() {
  const pathname = usePathname() || "";
  const isWanderAdmin = pathname.startsWith("/wander-admin");
  const basePath = isWanderAdmin ? "/wander-admin" : "/admin";

  const adminHref = (path: string): string => {
    if (!path) return basePath;
    if (path === "/admin" || path === "/") return basePath;
    if (path.startsWith("/admin/")) {
      return `${basePath}${path.slice("/admin".length)}`;
    }
    if (path.startsWith("/wander-admin")) {
      return path;
    }
    return path.startsWith("/") ? `${basePath}${path}` : `${basePath}/${path}`;
  };

  return { basePath, isWanderAdmin, adminHref };
}


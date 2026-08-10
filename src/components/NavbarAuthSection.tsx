"use client";

/**
 * NavbarAuthSection — Isolated Client Component for Clerk auth UI.
 *
 * WHY THIS EXISTS:
 * Clerk's full JS bundle (~150 KB parsed + executed) was previously loaded
 * for ALL users including anonymous ones because it was statically imported
 * in Navbar.tsx. By extracting Clerk into this isolated component and
 * dynamically importing it in Navbar, the Clerk bundle is now:
 *   - Split into its own chunk by the bundler
 *   - Only fetched + parsed after the page has hydrated (non-blocking)
 *   - Never loaded at all for pages that don't use auth
 *
 * This reduces the main-thread blocking time (TBT) by ~100–150ms on mobile.
 */

import { useEffect, useRef } from "react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarAuthSectionProps {
  /** Desktop (horizontal) or mobile (vertical full-screen menu) layout */
  variant: "desktop" | "mobile";
  /** Optional callback when a mobile menu link is clicked */
  onNavigate?: () => void;
}

export default function NavbarAuthSection({
  variant,
  onNavigate,
}: NavbarAuthSectionProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const prevAuth = useRef(isSignedIn);

  // Refresh server data when auth state changes (sign in / sign out)
  useEffect(() => {
    if (prevAuth.current !== isSignedIn) {
      router.refresh();
      prevAuth.current = isSignedIn;
    }
  }, [isSignedIn, router]);

  if (variant === "desktop") {
    return !isSignedIn ? (
      <SignInButton mode="modal">
        <button className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all whitespace-nowrap">
          Login / Sign up
        </button>
      </SignInButton>
    ) : (
      <div className="flex items-center gap-4">
        <Link
          href="/trips"
          className="text-sm font-bold text-slate-700 hover:text-[var(--primary)] transition-colors"
        >
          My Bookings
        </Link>
        <UserButton />
      </div>
    );
  }

  // Mobile variant
  return !isSignedIn ? (
    <SignInButton mode="modal">
      <button
        onClick={onNavigate}
        className="block w-full text-center py-3.5 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl font-semibold hover:bg-[var(--primary)] hover:text-white transition-all"
      >
        Sign In
      </button>
    </SignInButton>
  ) : (
    <div className="flex flex-col items-center gap-3 py-2">
      <Link
        href="/trips"
        onClick={onNavigate}
        className="block w-full text-center py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
      >
        My Bookings
      </Link>
      <UserButton />
    </div>
  );
}

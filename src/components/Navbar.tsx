"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

// ── Lazy-load ALL Clerk auth UI ───────────────────────────────────────────────
// Clerk's JS bundle (~150 KB) is deferred until after hydration by using
// dynamic import with ssr:false. A lightweight skeleton is shown in the
// meantime, which collapses to nothing once Clerk loads (< 500ms on fast
// connections, invisible on repeat visits thanks to HTTP caching).
//
// WHY ssr:false?
// The auth state is unknown during SSR (it requires a browser cookie read).
// Rendering the button server-side would show "Login" briefly then swap to
// "UserButton" on hydration, causing CLS. The skeleton avoids this flash.
// ─────────────────────────────────────────────────────────────────────────────

/** Pill skeleton shown while the Clerk bundle loads (desktop) */
function AuthSkeleton() {
  return (
    <div
      className="w-24 h-8 rounded-lg bg-slate-100 animate-pulse"
      aria-hidden="true"
    />
  );
}

/** Small circle skeleton shown while Clerk loads (mobile) */
function MobileAuthSkeleton() {
  return (
    <div
      className="w-full h-12 rounded-xl bg-slate-100 animate-pulse"
      aria-hidden="true"
    />
  );
}

const NavbarAuthSection = dynamic(
  () => import("@/components/NavbarAuthSection"),
  {
    ssr: false,
    loading: () => <AuthSkeleton />,
  }
);

const NavbarAuthSectionMobile = dynamic(
  () => import("@/components/NavbarAuthSection"),
  {
    ssr: false,
    loading: () => <MobileAuthSkeleton />,
  }
);
// ─────────────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Cultural Tour Packages", href: "/tours" },
  { label: "Traditional Homestays", href: "/stays?type=Homestay" },
  { label: "Hotels", href: "/stays?type=Hotel" },
  { label: "Taxis", href: "/taxis" },
  { label: "Travel Guide", href: "/guides" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
          scrolled ? "shadow-sm py-3" : "py-4 border-b border-slate-100"
        }`}
      >
        <div className="container-custom flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center transition-transform group-hover:-rotate-12">
              <Image
                src="/icon.png"
                alt="Indiahiles logo"
                width={36}
                height={36}
                className="rounded-md object-cover shadow-sm"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-[1.35rem] tracking-tight text-[var(--primary)] leading-none mt-1">
                India<span className="text-slate-900">hiles</span>
              </span>
              <span className="text-[9px] text-slate-500 font-medium tracking-wider mt-0.5 uppercase">
                A product by Gtm Adventures LLP
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-slate-700 hover:text-[var(--primary)] transition-colors font-semibold tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/partner/register"
              className="text-xs font-bold text-white bg-[var(--primary)] px-4 py-2.5 rounded-lg"
            >
              Become a Partner
            </Link>
            <button
              aria-label="Select currency: INR Indian Rupee"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg transition-colors"
            >
              INR <ChevronDown className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            </button>

            {/* ← Clerk auth UI — loaded lazily, Clerk bundle deferred */}
            <NavbarAuthSection variant="desktop" />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-[100] bg-white flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <div className="flex items-center justify-center">
                <Image
                  src="/icon.png"
                  alt="Indiahiles logo"
                  width={36}
                  height={36}
                  className="rounded-md object-cover shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-slate-900 leading-none mt-1">
                  India<span className="text-[var(--primary)]">hiles</span>
                </span>
                <span className="text-[9px] text-slate-500 font-medium tracking-wider mt-0.5 uppercase">
                  A product by Gtm Adventures LLP
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3.5 rounded-xl text-slate-800 font-semibold text-lg hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/partner/register"
              onClick={() => setMobileOpen(false)}
              className="block mt-4 px-4 py-3.5 rounded-xl text-white font-bold text-lg bg-[var(--primary)] shadow-md shadow-sky-500/20 text-center border-2 border-[var(--primary)]"
            >
              Become a Partner
            </Link>
          </div>

          <div className="p-5 border-t border-slate-100 space-y-3">
            {/* ← Clerk auth UI — loaded lazily, Clerk bundle deferred */}
            <NavbarAuthSectionMobile
              variant="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
            <Link
              href="/partner/register"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full justify-center py-3.5 text-base"
            >
              List Your Property
            </Link>
          </div>
        </div>
      )}

      {/* Floating Become a Partner Button (homepage only) */}
      {pathname === "/" && (
        <Link
          href="/partner/register"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold px-6 py-3.5 rounded-full shadow-xl shadow-sky-500/30 hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/40 transition-all duration-300 group animate-bounce-slow"
        >
          <span>Become a Partner</span>
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      )}
    </>
  );
}

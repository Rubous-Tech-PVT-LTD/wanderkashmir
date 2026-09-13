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
  { label: "Tour Packages", href: "/tours" },
  { label: "Traditional Homestays", href: "/stays?type=Homestay" },
  { label: "Hotels", href: "/stays?type=Hotel" },
  { label: "Taxis", href: "/taxis" },
  { label: "Travel Guide", href: "/guides" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { getTourCategories } = await import("@/actions/admin-tour-categories");
        const cats = await getTourCategories();
        setCategories(cats.map(c => c.name));
      } catch (e) {
        console.error("Failed to load categories for navbar");
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      // Show WhatsApp button only after scrolling ~1.5 screen heights on mobile
      setShowWhatsapp(window.scrollY > (window.innerHeight * 1.5));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md ${
          scrolled ? "shadow-sm py-2.5 sm:py-3" : "py-3 sm:py-4 border-b border-slate-100"
        }`}
      >
        <div className="container-custom flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center transition-transform group-hover:-rotate-12">
              <Image
                src="/brand-icon.webp"
                alt="WanderKashmir logo"
                width={36}
                height={36}
                className="rounded-md object-cover shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-[1.35rem] tracking-tight text-slate-900 leading-none mt-1">
                <span className="text-[#f97316]">Wander</span>Kashmir
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 font-medium">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                <Link
                  href={link.href}
                  className="flex items-center gap-1 text-sm text-slate-700 hover:text-[var(--primary)] transition-colors font-semibold tracking-wide py-2"
                >
                  {link.label}
                  {link.label === "Tour Packages" && (
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  )}
                </Link>
                
                {/* Dropdown Menu for Tour Packages */}
                {link.label === "Tour Packages" && categories.length > 0 && (
                  <div className="absolute top-full left-0 mt-0 w-56 bg-white border border-slate-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-left scale-95 group-hover:scale-100">
                    <div className="py-2">
                      <Link
                        href="/tours"
                        className="block px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                      >
                        All Packages
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/tours?category=${encodeURIComponent(cat)}`}
                          className="block px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-500 transition-colors border-t border-slate-50"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                  src="/brand-icon.webp"
                  alt="WanderKashmir logo"
                  width={36}
                  height={36}
                  className="rounded-md object-cover shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-slate-900 leading-none mt-1">
                  <span className="text-[#f97316]">Wander</span>Kashmir
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
              className="block mt-4 px-4 py-3.5 rounded-xl text-white font-bold text-lg bg-[var(--primary)] shadow-md shadow-orange-500/20 text-center border-2 border-[var(--primary)]"
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

      {/* Floating WhatsApp Button (bottom left) */}
      <a
        href="https://wa.me/916005888754?text=Hi%20WanderKashmir%2C%20I%20want%20to%20plan%20a%20trip%20to%20Kashmir."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={`fixed bottom-6 left-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-xl shadow-green-600/30 hover:shadow-2xl hover:scale-105 transition-all duration-500 ease-out group ${
          showWhatsapp
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-16 opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <svg
          className="w-6 h-6 fill-current shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.877-2.056-.976-.277-.1-.478-.15-.679.15-.202.3-.78 1-.955 1.202-.176.202-.351.226-.653.076-.301-.151-1.272-.469-2.424-1.496-.897-.798-1.503-1.784-1.68-2.085-.175-.302-.019-.465.132-.616.136-.135.301-.351.452-.527.151-.176.201-.301.302-.502.101-.202.05-.377-.025-.528-.076-.151-.679-1.637-.93-2.241-.244-.589-.493-.509-.679-.519-.176-.01-.377-.01-.578-.01-.201 0-.528.075-.804.377-.276.301-1.055 1.03-1.055 2.513 0 1.482 1.08 2.914 1.231 3.115.151.201 2.126 3.245 5.15 4.551.719.311 1.281.497 1.719.636.723.23 1.381.197 1.901.12.579-.087 1.78-.728 2.03-1.431.252-.704.252-1.307.176-1.432-.075-.125-.276-.2-.577-.35zM12.042 21.848h-.008a9.837 9.837 0 0 1-5.01-1.378l-.359-.214-3.725.976.994-3.633-.235-.374a9.86 9.86 0 0 1-1.512-5.26c.003-5.446 4.436-9.878 9.886-9.878 2.64 0 5.12 1.028 6.985 2.894a9.827 9.827 0 0 1 2.89 6.986c-.003 5.447-4.436 9.88-9.911 9.88zM20.52 3.483A11.93 11.93 0 0 0 12.04 0C5.402 0 .01 5.393 0 12.032a11.98 11.98 0 0 0 1.63 6.02L0 24l6.102-1.602a11.93 11.93 0 0 0 5.938 1.57h.005c6.634 0 12.03-5.393 12.033-12.032a11.906 11.906 0 0 0-3.556-8.453z" />
        </svg>
        <span className="hidden sm:inline text-sm">WhatsApp</span>
      </a>
    </>
  );
}

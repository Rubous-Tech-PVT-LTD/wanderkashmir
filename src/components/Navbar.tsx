"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { Menu, X, Mountain, Phone, ChevronDown, User, Heart } from "lucide-react";
import { useVendor } from "@/context/VendorContext";

const navLinks = [
  { label: "Stays", href: "/stays" },
  { label: "Homestays", href: "/stays?type=Homestay" },
  { label: "Taxis", href: "/taxis" },
  { label: "Tour Packages", href: "/tours" },
  { label: "Travel Guide", href: "/guides" },
];

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const { isRegistered, role } = useVendor();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prevAuth = useRef(isSignedIn);

  useEffect(() => {
    if (prevAuth.current !== isSignedIn) {
      router.refresh();
      prevAuth.current = isSignedIn;
    }
  }, [isSignedIn, router]);



  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
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
              <img src="/icon.png" alt="Logo" className="w-9 h-9 rounded-md object-cover shadow-sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-[1.35rem] tracking-tight text-[var(--primary)] leading-none mt-1">
                Wander<span className="text-slate-900">Kashmir</span>
              </span>
              <span className="text-[9px] text-slate-500 font-medium tracking-wider mt-0.5 uppercase">A product by Gtm Adventures LLP</span>
            </div>
          </Link>

          {/* Desktop Nav */}
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

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">

            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg transition-colors">
              INR <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-all whitespace-nowrap">
                  Login / Sign up
                </button>
              </SignInButton>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/trips" className="text-sm font-bold text-slate-700 hover:text-[var(--primary)] transition-colors">
                  My Trips
                </Link>
                <UserButton />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center">
                <img src="/icon.png" alt="Logo" className="w-9 h-9 rounded-md object-cover shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-slate-900 leading-none mt-1">
                  Wander<span className="text-[var(--primary)]">Kashmir</span>
                </span>
                <span className="text-[9px] text-slate-500 font-medium tracking-wider mt-0.5 uppercase">A product by Gtm Adventures LLP</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-6 h-6" />
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

          </div>
          
          <div className="p-5 border-t border-slate-100 space-y-3">
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-3.5 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl font-semibold hover:bg-[var(--primary)] hover:text-white transition-all"
                >
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <div className="flex justify-center py-2">
                <UserButton />
              </div>
            )}

          </div>
        </div>
      )}


    </>
  );
}

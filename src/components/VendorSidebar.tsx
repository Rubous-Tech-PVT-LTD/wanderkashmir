"use client";

import Link from "next/link";
import { Building2, Home, Car, UserCircle2, LayoutDashboard, LogOut, Settings, Award, X } from "lucide-react";
import { useVendor } from "@/context/VendorContext";
import { useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

interface VendorSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function VendorSidebar({ isOpen = false, onClose }: VendorSidebarProps = {}) {
  const { vendorType, isRegistered, setIsRegistered, setVendorType, vendorName, vendorEmail } = useVendor();
  const { openUserProfile } = useClerk();
  const pathname = usePathname();

  // Hide sidebar completely on the onboarding entry page
  if (pathname === "/partner" || pathname === "/partner/register") {
    return null;
  }

  // If they haven't registered yet, we only show a basic registration sidebar or nothing
  if (!isRegistered) {
    return (
      <>
        {/* Mobile Backdrop Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
        <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed md:sticky top-0 left-0 h-screen z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}>
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/partner" className="flex items-center gap-2" onClick={onClose}>
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Vendor Portal</span>
            </Link>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-md md:hidden hover:bg-slate-800 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex-1 p-6 flex items-center justify-center text-slate-500 text-center text-sm">
            Complete registration to view your dashboard.
          </div>
        </aside>
      </>
    );
  }

  // Dynamic links based on vendorType
  const getLinks = () => {
    switch (vendorType) {
      case "hotel":
        return [{ name: "Hotel Dashboard", href: "/partner/hotel", icon: Building2 }];
      case "homestay":
        return [{ name: "Homestays Dashboard", href: "/partner/homeStays", icon: Home }];
      case "taxi":
        return [{ name: "Transport Dashboard", href: "/partner/Taxi_Driver", icon: Car }];
      case "guide":
        return [{ name: "Guide Dashboard", href: "/partner/Guide", icon: UserCircle2 }];
      default:
        return [];
    }
  };

  const links = getLinks();

  const handleLogout = async () => {
    setIsRegistered(false);
    setVendorType(null);
    try {
      await fetch('/api/auth/vendor-logout', { method: 'POST' });
    } catch (e) {
      console.error('Error logging out:', e);
    }
    window.location.href = "/partner";
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed md:sticky top-0 left-0 h-screen z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/partner" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Vendor Portal</span>
          </Link>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-md md:hidden hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2 mt-4">
            Manage Services
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white bg-slate-800 transition-colors group"
              >
                <Icon className="w-5 h-5 text-sky-400 transition-colors" />
                <span className="font-medium text-sm">{link.name}</span>
              </Link>
            );
          })}

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2 mt-8">
            Growth
          </div>
          <Link
            href="/partner/marketing"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group"
          >
            <Award className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
            <span className="font-medium text-sm">Marketing Badges</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700 capitalize overflow-hidden shrink-0">
              {vendorName ? vendorName[0].toUpperCase() : vendorType ? vendorType[0].toUpperCase() : "V"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {vendorName || `${vendorType} Owner`}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {vendorEmail || "vendor@wanderkashmir.com"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => {
                openUserProfile();
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-400 hover:bg-slate-800 hover:text-orange-300 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

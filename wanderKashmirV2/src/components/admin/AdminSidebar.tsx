"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Palette,
  MapPin,
  Building,
  Sparkles,
  Star,
  Inbox,
  Globe,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { logoutAdminAction } from "@/actions/adminAuth";

interface AdminSidebarProps {
  userEmail: string;
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Tours", href: "/admin/tours", icon: Compass },
  { name: "Travel Styles", href: "/admin/travel-styles", icon: Palette },
  { name: "Destinations", href: "/admin/destinations", icon: MapPin },
  { name: "Properties", href: "/admin/properties", icon: Building },
  { name: "Experiences", href: "/admin/experiences", icon: Sparkles },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Leads & Inquiries", href: "/admin/leads", icon: Inbox },
  { name: "SEO", href: "/admin/seo", icon: Globe },
];

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            WK
          </div>
          <div>
            <span className="font-bold text-sm text-white block leading-tight">WanderKashmir</span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Admin V2</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Area */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/5">
              WK
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none">WanderKashmir</div>
              <div className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1">
                Admin Foundation
              </div>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{item.name}</span>
                {item.href !== "/admin" && item.href !== "/admin/leads" && item.href !== "/admin/tours" && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                    v1
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User & Security Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 truncate font-medium" title={userEmail}>
              {userEmail}
            </span>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

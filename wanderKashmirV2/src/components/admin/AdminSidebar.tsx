"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSeasonalTheme } from "@/lib/theme/themeProvider";
import { seasonalThemes, SeasonId } from "@/lib/theme/seasonalThemes";
import {
  LayoutDashboard,
  Compass,
  Palette,
  MapPin,
  Landmark,
  Building,
  Sparkles,
  Star,
  Inbox,
  Globe,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Check,
  Calendar,
  Layers,
  Car,
  Users,
  MessageSquare,
  Mail,
  Tag,
  Megaphone,
  Store,
  ClipboardList,
} from "lucide-react";
import { logoutAdminAction } from "@/actions/adminAuth";

interface AdminSidebarProps {
  userEmail: string;
  userRole?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Customer Leads", href: "/admin/leads", icon: Inbox },
      { name: "Vendors", href: "/admin/vendors", icon: Store },
      { name: "Listings", href: "/admin/listings", icon: ClipboardList },
      { name: "Taxis & Fleet", href: "/admin/taxis", icon: Car },
      { name: "Users", href: "/admin/users", icon: Users },
    ],
  },
  {
    title: "Catalog & CMS",
    items: [
      { name: "Tours", href: "/admin/tours", icon: Compass },
      { name: "Tour Categories", href: "/admin/tour-categories", icon: Layers },
      { name: "Travel Styles", href: "/admin/travel-styles", icon: Palette },
      { name: "Stays & Properties", href: "/admin/properties", icon: Building },
      { name: "Destinations", href: "/admin/destinations", icon: MapPin },
      { name: "Places", href: "/admin/places", icon: Landmark },
      { name: "Experiences", href: "/admin/experiences", icon: Sparkles },
    ],
  },
  {
    title: "SEO & Content",
    items: [
      { name: "SEO Intelligence", href: "/admin/seo", icon: Globe },
      { name: "SEO Comments", href: "/admin/seo-comments", icon: MessageSquare },
    ],
  },
  {
    title: "Marketing",
    items: [
      { name: "Reviews", href: "/admin/reviews", icon: Star },
      { name: "Promo Codes", href: "/admin/promo-codes", icon: Tag },
      { name: "Bulk Emails", href: "/admin/emails", icon: Mail },
      { name: "Site Popups", href: "/admin/popups", icon: Megaphone },
    ],
  },
];

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

function isPathActive(pathname: string, canonicalHref: string, aliasedHref: string): boolean {
  if (canonicalHref === "/admin") {
    return pathname === "/admin" || pathname === "/wander-admin";
  }
  return (
    pathname === canonicalHref ||
    pathname.startsWith(`${canonicalHref}/`) ||
    pathname === aliasedHref ||
    pathname.startsWith(`${aliasedHref}/`)
  );
}

export default function AdminSidebar({ userEmail, userRole }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const pathname = usePathname() || "";
  const { mode, setMode, selectedSeason, setSelectedSeason, activeSeason, autoSeason } = useSeasonalTheme();

  const isWanderAdmin = pathname.startsWith("/wander-admin");
  const adminBase = isWanderAdmin ? "/wander-admin" : "/admin";

  const isEditor = userRole === "EDITOR";
  const visibleSections = isEditor
    ? navSections
        .map((sec) => ({
          ...sec,
          items: sec.items.filter((item) => {
            if (item.href === "/admin") return true;
            return EDITOR_ALLOWED_PREFIXES.some(
              (p) => item.href === p || item.href.startsWith(`${p}/`)
            );
          }),
        }))
        .filter((sec) => sec.items.length > 0)
    : navSections;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white border-b border-slate-200 px-4 h-14 print:hidden">
        <Link href={adminBase} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--season-primary)] text-white flex items-center justify-center font-semibold text-xs tracking-tight">
            WK
          </div>
          <div className="leading-tight">
            <span className="font-semibold text-sm text-slate-900 block">WanderKashmir</span>
            <span className="text-[10px] text-slate-500 font-medium block">
              {isEditor ? "Editorial" : "Admin"}
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] print:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 print:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="px-4 h-13 border-b border-slate-200/90 flex items-center justify-between shrink-0">
          <Link href={adminBase} className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[var(--season-primary)] text-white flex items-center justify-center font-semibold text-xs tracking-tight shrink-0 transition-colors">
              WK
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 text-[13px] tracking-tight truncate leading-none">
                WanderKashmir
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-none">
                {isEditor ? "Editorial CMS" : "Admin Console"}
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto" aria-label="Admin navigation">
          {visibleSections.map((section, idx) => (
            <div key={section.title || idx} className="space-y-0.5">
              {section.title && (
                <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 select-none">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const itemHref = item.href.replace(/^\/admin/, adminBase);
                const isActive = isPathActive(pathname, item.href, itemHref);

                return (
                  <Link
                    key={item.href}
                    href={itemHref}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                      isActive
                        ? "bg-[var(--season-primary-light)] text-[var(--season-primary-hover)] font-medium border-l-2 border-[var(--season-primary)]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-normal border-l-2 border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-[var(--season-primary)]" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Public Site Seasonal Theme Control */}
        <div className="px-3 py-2.5 border-t border-slate-200/80 bg-slate-50/50">
          <div className="px-0.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between select-none">
            <span>Active Theme Season</span>
            <span className="text-[10px] font-medium text-[var(--season-primary)] normal-case">
              {mode === "automatic" ? "Auto" : "Manual"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setThemeOpen(!themeOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
            aria-expanded={themeOpen}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center -space-x-1 shrink-0">
                <span
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-white"
                  style={{ backgroundColor: activeSeason.colors.primary }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-white"
                  style={{ backgroundColor: activeSeason.colors.secondary }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-white"
                  style={{ backgroundColor: activeSeason.colors.tertiary }}
                />
              </div>
              <span className="text-xs font-medium text-slate-800 truncate">
                {activeSeason.name}
                <span className="text-slate-400 font-normal ml-1">({activeSeason.kashmiriName})</span>
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                themeOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {themeOpen && (
            <div className="mt-1.5 space-y-0.5 p-1 rounded-md bg-white border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setMode("automatic")}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                  mode === "automatic"
                    ? "bg-[var(--season-primary-light)] text-[var(--season-primary-hover)] font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Auto ({seasonalThemes[autoSeason]?.name})</span>
                </div>
                {mode === "automatic" && <Check className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />}
              </button>

              <div className="h-px bg-slate-100 my-1" />

              {(["spring", "summer", "autumn", "winter"] as SeasonId[]).map((seasonKey) => {
                const s = seasonalThemes[seasonKey];
                const isSelected = mode === "manual" && selectedSeason === seasonKey;
                return (
                  <button
                    key={seasonKey}
                    type="button"
                    onClick={() => setSelectedSeason(seasonKey)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[var(--season-primary-light)] text-[var(--season-primary-hover)] font-medium"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.colors.primary }}
                      />
                      <span className="truncate">
                        {s.name} <span className="text-slate-400">({s.kashmiriName})</span>
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Account & Sign Out Footer (Single Location) */}
        <div className="p-3 border-t border-slate-200/80 bg-white">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-900 truncate" title={userEmail}>
                {userEmail}
              </div>
              <div className="text-[10px] text-slate-500">
                {isEditor ? "Editor" : "Administrator"}
              </div>
            </div>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

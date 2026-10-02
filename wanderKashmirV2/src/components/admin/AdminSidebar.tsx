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
  Building,
  Sparkles,
  Star,
  Inbox,
  Globe,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Check,
  Calendar,
} from "lucide-react";
import { logoutAdminAction } from "@/actions/adminAuth";

interface AdminSidebarProps {
  userEmail: string;
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
    title: "Content Management",
    items: [
      { name: "Tours", href: "/admin/tours", icon: Compass },
      { name: "Travel Styles", href: "/admin/travel-styles", icon: Palette },
      { name: "Stays & Properties", href: "/admin/properties", icon: Building },
      { name: "Destinations & Places", href: "/admin/destinations", icon: MapPin },
      { name: "Experiences", href: "/admin/experiences", icon: Sparkles },
      { name: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "SEO & Growth",
    items: [
      { name: "SEO Intelligence", href: "/admin/seo", icon: Globe },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Customer Leads", href: "/admin/leads", icon: Inbox },
    ],
  },
];

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const pathname = usePathname();
  const { mode, setMode, selectedSeason, setSelectedSeason, activeSeason, autoSeason } = useSeasonalTheme();

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
                Admin Console
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
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
 
         {/* Seasonal Theme Control */}
         <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
           <div className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between select-none">
             <span className="flex items-center gap-1.5">
               <Palette className="w-3 h-3 text-emerald-400" />
               <span>Theme / Season</span>
             </span>
             <span className="text-[9px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
               {mode === "automatic" ? "Auto" : "Manual"}
             </span>
           </div>
 
           <button
             type="button"
             onClick={() => setThemeOpen(!themeOpen)}
             className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
             aria-expanded={themeOpen}
           >
             <div className="flex items-center gap-2.5 min-w-0">
               <div className="flex items-center -space-x-1 shrink-0">
                 <span
                   className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-900"
                   style={{ backgroundColor: activeSeason.colors.primary }}
                 />
                 <span
                   className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-900"
                   style={{ backgroundColor: activeSeason.colors.secondary }}
                 />
                 <span
                   className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-900"
                   style={{ backgroundColor: activeSeason.colors.tertiary }}
                 />
               </div>
 
               <div className="min-w-0">
                 <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                   <span>{activeSeason.name}</span>
                   <span className="text-slate-400 font-normal">({activeSeason.kashmiriName})</span>
                 </div>
                 <div className="text-[10px] text-slate-400 truncate">
                   {mode === "automatic" ? "Date-based (Auto)" : "Manual Override"}
                 </div>
               </div>
             </div>
 
             <ChevronDown
               className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform shrink-0 ${
                 themeOpen ? "rotate-180" : ""
               }`}
             />
           </button>
 
           {themeOpen && (
             <div className="mt-2 space-y-1 p-1.5 rounded-lg bg-slate-900 border border-slate-800 animate-in fade-in duration-150">
               <button
                 type="button"
                 onClick={() => {
                   setMode("automatic");
                 }}
                 className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                   mode === "automatic"
                     ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                     : "text-slate-300 hover:bg-slate-800 hover:text-white"
                 }`}
               >
                 <div className="flex items-center gap-2">
                   <Calendar className="w-3.5 h-3.5 text-slate-400" />
                   <div className="text-left">
                     <div>Automatic (Date-based)</div>
                     <div className="text-[9px] text-slate-400 font-normal">
                       Current: {seasonalThemes[autoSeason]?.name} ({seasonalThemes[autoSeason]?.kashmiriName})
                     </div>
                   </div>
                 </div>
                 {mode === "automatic" && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
               </button>
 
               <div className="h-px bg-slate-800 my-1" />
 
               <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                 Manual Override
               </div>
 
               {(["spring", "summer", "autumn", "winter"] as SeasonId[]).map((seasonKey) => {
                 const s = seasonalThemes[seasonKey];
                 const isSelected = mode === "manual" && selectedSeason === seasonKey;
 
                 return (
                   <button
                     key={seasonKey}
                     type="button"
                     onClick={() => {
                       setSelectedSeason(seasonKey);
                     }}
                     className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                       isSelected
                         ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                         : "text-slate-300 hover:bg-slate-800 hover:text-white"
                     }`}
                   >
                     <div className="flex items-center gap-2 min-w-0">
                       <div className="flex items-center -space-x-1 shrink-0">
                         <span
                           className="w-2 h-2 rounded-full"
                           style={{ backgroundColor: s.colors.primary }}
                         />
                         <span
                           className="w-2 h-2 rounded-full"
                           style={{ backgroundColor: s.colors.secondary }}
                         />
                         <span
                           className="w-2 h-2 rounded-full"
                           style={{ backgroundColor: s.colors.tertiary }}
                         />
                       </div>
                       <div className="text-left truncate">
                         <span className="truncate">{s.name}</span>{" "}
                         <span className="text-[10px] text-slate-400">({s.kashmiriName})</span>
                       </div>
                     </div>
                     {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                   </button>
                 );
               })}
             </div>
           )}
         </div>

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
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

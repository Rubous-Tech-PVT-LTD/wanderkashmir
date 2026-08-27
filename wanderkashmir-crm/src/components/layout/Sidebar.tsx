"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  Calendar, 
  FileText, 
  Settings,
  LogOut,
  X,
  Share2
} from "lucide-react";
import { useMobileNav } from "./MobileNavContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Follow-ups", href: "/dashboard/follow-ups", icon: Calendar },
  { name: "Requirements", href: "/dashboard/requirements", icon: FileText },
  { name: "Quotations", href: "/dashboard/quotations", icon: FileText },
];

export default function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useMobileNav();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data && data.role) {
          setRole(data.role);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">WanderKashmir</h2>
            <p className="text-xs text-gray-500 uppercase font-semibold mt-1">Partner Portal</p>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 md:py-2 text-gray-700 rounded-md hover:bg-gray-50 hover:text-primary transition-colors font-medium text-[15px] md:text-sm"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            {role === "CRM_ADMIN" && (
              <Link
                href="/dashboard/leads/assignment"
                className="flex items-center gap-3 px-3 py-3 md:py-2 text-gray-700 rounded-md hover:bg-gray-50 hover:text-primary transition-colors font-medium text-[15px] md:text-sm"
              >
                <Share2 className="h-5 w-5" />
                Lead Assignment
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <Link
            href="/settings/users"
            className="flex items-center gap-3 px-3 py-3 md:py-2 text-gray-700 rounded-md hover:bg-gray-50 hover:text-primary transition-colors font-medium text-[15px] md:text-sm"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <button
            onClick={() => {
              document.cookie = "crm_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-3 py-3 md:py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-[15px] md:text-sm"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

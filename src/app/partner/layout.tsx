"use client";

import { useState } from "react";
import VendorSidebar from "@/components/VendorSidebar";

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div className="flex min-h-screen bg-slate-50">
        <VendorSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Mobile Header (visible only on small screens) */}
          <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
            <span className="text-lg font-bold">Vendor Portal</span>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-slate-800 rounded-md hover:bg-slate-700 active:bg-slate-600 transition-colors"
              aria-label="Open navigation menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

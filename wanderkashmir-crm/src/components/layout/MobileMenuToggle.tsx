"use client";

import { Menu } from "lucide-react";
import { useMobileNav } from "./MobileNavContext";

export default function MobileMenuToggle() {
  const { toggleSidebar } = useMobileNav();

  return (
    <button 
      onClick={toggleSidebar}
      className="md:hidden text-gray-500 hover:text-gray-700 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Toggle Menu"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}

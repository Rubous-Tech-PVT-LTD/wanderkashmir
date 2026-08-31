import { Bell } from "lucide-react";
import { getSession } from "@/lib/auth";
import MobileMenuToggle from "./MobileMenuToggle";
import GlobalSearch from "./GlobalSearch";
import NotificationBell from "./NotificationBell";

export default async function Topbar() {
  const session = await getSession();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <MobileMenuToggle />
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">Dashboard</h1>
      </div>

      {session?.role === 'CRM_ADMIN' && (
        <div className="flex-1 max-w-xl mx-8">
          <GlobalSearch />
        </div>
      )}

      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-700">{session?.name || "User"}</p>
            <p className="text-xs text-gray-500 capitalize">{session?.role?.replace("_", " ") || "Partner"}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary-muted flex items-center justify-center text-primary font-bold">
            {session?.name?.charAt(0) || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}

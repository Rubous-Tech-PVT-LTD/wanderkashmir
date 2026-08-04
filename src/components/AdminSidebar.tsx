import Link from "next/link";
import { 
  LayoutDashboard, 
  CheckCircle, 
  CalendarCheck, 
  Users, 
  Banknote,
  Settings,
  Download
} from "lucide-react";

export default function AdminSidebar() {
  const links = [
    { name: "Overview", href: "/wander-admin", icon: LayoutDashboard },
    { name: "Approvals Queue", href: "/wander-admin/approvals", icon: CheckCircle },
    { name: "All Bookings", href: "/wander-admin/bookings", icon: CalendarCheck },
    { name: "Booking Manifesto", href: "/wander-admin/exports", icon: Download },
    { name: "Payouts", href: "/wander-admin/payouts", icon: Banknote },
    { name: "Users & Vendors", href: "/wander-admin/users", icon: Users },
    { name: "Settings", href: "/wander-admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen flex flex-col hidden md:flex sticky top-0 h-screen border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Indiahiles Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-4">
          Platform Management
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors group"
            >
              <Icon className="w-5 h-5 text-slate-400 group-hover:text-sky-400 transition-colors" />
              <span className="font-medium text-sm">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold border border-sky-500/30">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-slate-400 truncate">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

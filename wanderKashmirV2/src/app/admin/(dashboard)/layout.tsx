import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { logoutAdminAction } from "@/actions/adminAuth";
import { LogOut } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | WanderKashmir",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const headerList = await headers();
  const isWanderAdmin = headerList.get("x-admin-alias") === "wander-admin";

  if (!session) {
    redirect(isWanderAdmin ? "/wander-admin/login" : "/admin/login");
  }

  if (session.role !== "ADMIN") {
    redirect(isWanderAdmin ? "/wander-admin/unauthorized" : "/admin/unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar userEmail={session.email} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Status Bar */}
        <header className="sticky top-0 z-30 hidden lg:flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-8 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Environment:</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Production DB Connected
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
              Read-Only Safety
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div>
              Authenticated Admin: <span className="text-white font-medium">{session.email}</span>
            </div>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                title="Sign out of Admin session"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

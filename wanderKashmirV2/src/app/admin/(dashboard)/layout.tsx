import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

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

  if (!session) {
    redirect("/admin/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/admin/unauthorized");
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

          <div className="text-xs text-slate-400">
            Authenticated Admin: <span className="text-white font-medium">{session.email}</span>
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

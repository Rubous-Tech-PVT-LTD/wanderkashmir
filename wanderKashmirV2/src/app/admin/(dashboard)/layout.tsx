import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ExternalLink } from "lucide-react";
import { getAdminOrEditorSession } from "@/lib/admin/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Dashboard | WanderKashmir Admin",
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
  const session = await getAdminOrEditorSession();
  const headerList = await headers();
  const isWanderAdmin = headerList.get("x-admin-alias") === "wander-admin";

  if (!session) {
    redirect(isWanderAdmin ? "/wander-admin/login" : "/admin/login");
  }

  if (session.role !== "ADMIN" && session.role !== "EDITOR") {
    redirect(isWanderAdmin ? "/wander-admin/unauthorized" : "/admin/unauthorized");
  }

  const isEditor = session.role === "EDITOR";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar userEmail={session.email} userRole={session.role} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        {/* Minimal Top Utility Bar (Desktop) */}
        <header className="sticky top-0 z-30 hidden lg:flex items-center justify-between border-b border-slate-200/90 bg-white/90 px-8 h-13 backdrop-blur-sm print:hidden">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-medium text-slate-900">WanderKashmir Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200/80">
              {isEditor ? "Editorial Role" : "Administrator"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

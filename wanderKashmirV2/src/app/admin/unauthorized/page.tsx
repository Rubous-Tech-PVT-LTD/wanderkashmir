import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { logoutAdminAction } from "@/actions/adminAuth";

export const metadata = {
  title: "Access Denied | WanderKashmir Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminUnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-[#F8FAFC]">
      <div className="max-w-sm w-full text-center rounded-md border border-slate-200/90 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-rose-50 border border-rose-200 text-rose-600 mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <h1 className="text-lg font-semibold tracking-tight text-slate-900">Access Denied</h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Your account is signed in, but does not have the <strong>ADMIN</strong> or{" "}
          <strong>EDITOR</strong> permissions required to access this workspace.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
          </form>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to WanderKashmir Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

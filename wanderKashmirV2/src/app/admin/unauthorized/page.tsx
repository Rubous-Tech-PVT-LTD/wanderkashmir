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
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-slate-950 text-white">
      <div className="max-w-md w-full text-center rounded-2xl border border-red-500/20 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-5">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white">Access Denied</h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Your account is authenticated, but does not possess the <strong>ADMIN</strong> role required to access this portal.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
          </form>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to WanderKashmir Home
          </Link>
        </div>
      </div>
    </div>
  );
}

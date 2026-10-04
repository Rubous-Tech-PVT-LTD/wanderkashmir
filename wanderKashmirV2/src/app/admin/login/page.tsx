import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/admin/auth";
import AdminLoginForm from "./AdminLoginForm";

export const metadata = {
  title: "Admin Sign In | WanderKashmir",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminLoginPageProps {
  searchParams?: Promise<{ from?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getAdminSession();
  const headerList = await headers();
  const isWanderAdmin = headerList.get("x-admin-alias") === "wander-admin";

  if (session && session.role === "ADMIN") {
    redirect(isWanderAdmin ? "/wander-admin" : "/admin");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const from = resolvedParams.from;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">WanderKashmir Admin</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Secure administrative control portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
          <AdminLoginForm initialFrom={from} isWanderAdminAlias={isWanderAdmin} />
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Admin Control Portal • Production DB Connected • Verified Access Only
        </p>
      </div>
    </div>
  );
}

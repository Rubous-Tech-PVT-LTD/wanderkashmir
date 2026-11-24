import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Lock } from "lucide-react";
import { getAdminOrEditorSession } from "@/lib/admin/auth";
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
  const session = await getAdminOrEditorSession();
  const headerList = await headers();
  const isWanderAdmin = headerList.get("x-admin-alias") === "wander-admin";

  if (session && (session.role === "ADMIN" || session.role === "EDITOR")) {
    redirect(isWanderAdmin ? "/wander-admin" : "/admin");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const from = resolvedParams.from;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-[#F8FAFC]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-md bg-white border border-slate-200 text-[var(--season-primary)] mb-4 shadow-xs">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            WanderKashmir Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access the operations and CMS workspace
          </p>
        </div>

        <div className="rounded-md border border-slate-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <AdminLoginForm initialFrom={from} isWanderAdminAlias={isWanderAdmin} />
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-5">
          Authorized WanderKashmir personnel only
        </p>
      </div>
    </div>
  );
}

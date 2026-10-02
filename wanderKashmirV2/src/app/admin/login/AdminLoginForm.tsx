"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/actions/adminAuth";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAdminAction(formData);
      if (res.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(res.error || "Authentication failed. Please verify credentials.");
      }
    } catch {
      setError("An unexpected network or server error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs sm:text-sm text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div className="leading-snug">{error}</div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Admin Email
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@wanderkashmir.com"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Authenticating...
          </>
        ) : (
          "Sign In to Admin Portal"
        )}
      </button>
    </form>
  );
}

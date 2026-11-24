"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-[55vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-md p-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="w-11 h-11 rounded-md bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">Something went wrong</h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          We couldn&apos;t load this admin view. Try refreshing the page or return to the dashboard.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


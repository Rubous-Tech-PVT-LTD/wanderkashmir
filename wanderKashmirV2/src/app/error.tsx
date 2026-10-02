"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, PhoneCall } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log sanitized error report to monitoring
    console.error("Application error boundary triggered:", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-16 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">
          Something went wrong
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          We encountered an unexpected error while preparing your Kashmir travel details. Our team has been notified.
        </p>

        {error.digest && (
          <p className="text-[11px] text-slate-400 font-mono mb-6 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
            Error Reference: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>

          <Link
            href="/contact"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Need assistance? Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

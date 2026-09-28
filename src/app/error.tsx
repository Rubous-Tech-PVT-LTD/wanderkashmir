"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertTriangle, RotateCcw, Home, MessageSquare } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
          {/* Icon */}
          <div className="inline-flex items-center justify-center p-4 bg-amber-100 text-amber-600 rounded-2xl mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <p className="text-xs uppercase tracking-wider font-bold text-amber-600 mb-2">
            Temporary Service Hitch
          </p>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Something went unexpectedly off track
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
            We encountered a slight bump on the digital road. Our local team has been notified and is already working on smoothing it out.
          </p>

          {error?.digest && (
            <p className="text-xs font-mono text-slate-400 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200 w-fit mx-auto mb-6">
              Reference ID: {error.digest}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--primary,#f97316)] text-white font-semibold shadow-sm hover:opacity-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
            Need urgent assistance with your booking?{" "}
            <Link href="/contact" className="text-orange-600 font-semibold hover:underline">
              Contact our 24/7 Kashmir Desk
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

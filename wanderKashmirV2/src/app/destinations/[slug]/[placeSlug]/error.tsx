"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Compass, ArrowLeft } from "lucide-react";

interface PlaceErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PlaceDetailError({ error, reset }: PlaceErrorProps) {
  useEffect(() => {
    console.error("Place detail error boundary triggered:", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">
          Attraction Unavailable
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          We encountered an unexpected error while loading this tourist attraction’s details. You can try refreshing the page or explore our complete catalog.
        </p>

        {error.digest && (
          <p className="text-[11px] text-slate-400 font-mono mb-6 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
            Error Reference: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/places"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-sm transition-colors border border-emerald-100"
          >
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>Explore All Kashmir Places</span>
          </Link>

          <Link
            href="/destinations"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Destinations</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


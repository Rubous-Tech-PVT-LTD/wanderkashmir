import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, LucideIcon } from "lucide-react";

interface SectionEmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  className?: string;
}

export function SectionEmptyState({
  icon: Icon,
  title,
  message,
  className = "",
}: SectionEmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 sm:p-8 text-center flex flex-col items-center justify-center space-y-2.5 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h4 className="text-xs sm:text-sm font-bold text-slate-800 font-display">
        {title}
      </h4>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
    </div>
  );
}

interface PageHotelEmptyStateProps {
  slug?: string;
}

export default function PageHotelEmptyState({ slug }: PageHotelEmptyStateProps) {
  return (
    <div className="min-h-[60vh] max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Home className="w-8 h-8 stroke-[1.5]" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          No Hotel Information Available Yet
        </h1>
        <p className="text-sm text-slate-600 max-w-lg leading-relaxed">
          {slug
            ? `The property "${slug}" is either currently in draft review, pending verification, or not yet published.`
            : "The requested accommodation details are not currently available."}
        </p>
      </div>

      <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/stays"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: "var(--season-primary, #065F46)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Verified Kashmir Stays</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

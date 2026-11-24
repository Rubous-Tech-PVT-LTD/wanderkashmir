import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  badge,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between pb-5 border-b border-slate-200/80">
      <div className="min-w-0 space-y-1">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>
        )}
        <div className="flex items-center flex-wrap gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-[13px] text-slate-500 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}


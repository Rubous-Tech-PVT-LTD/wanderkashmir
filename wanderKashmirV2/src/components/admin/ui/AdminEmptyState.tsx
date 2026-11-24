import React from "react";

interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminEmptyState({
  icon,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
      {icon && (
        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200/80 text-slate-400 flex items-center justify-center mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex items-center gap-2">{action}</div>}
    </div>
  );
}


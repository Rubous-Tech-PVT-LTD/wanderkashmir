"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalCount,
  itemLabel = "items",
  onPageChange,
  disabled = false,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 text-xs text-slate-500">
      <div>
        Page <span className="font-semibold text-slate-900 tabular-nums">{currentPage}</span> of{" "}
        <span className="font-semibold text-slate-900 tabular-nums">{totalPages}</span>
        {typeof totalCount === "number" && (
          <span className="ml-1.5 text-slate-400">
            ({totalCount.toLocaleString("en-IN")} {itemLabel})
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer font-medium"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}


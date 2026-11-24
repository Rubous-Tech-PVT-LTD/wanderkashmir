"use client";

import React from "react";
import { Search, X } from "lucide-react";

export interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface AdminFilterBarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
  searchPlaceholder?: string;
  tabs?: FilterTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  filters?: React.ReactNode;
  hasActiveFilters?: boolean;
  onReset?: () => void;
}

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "Search...",
  tabs,
  activeTab,
  onTabChange,
  filters,
  hasActiveFilters = false,
  onReset,
}: AdminFilterBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.();
  };

  return (
    <div className="space-y-3">
      {tabs && tabs.length > 0 && onTabChange && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "border-[var(--season-primary)] text-[var(--season-primary-hover)] font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] tabular-nums ${
                      isActive
                        ? "bg-[var(--season-primary-light)] text-[var(--season-primary-hover)] font-semibold"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {(onSearchChange || filters || hasActiveFilters) && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          {onSearchChange && (
            <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-20 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-2 focus:ring-[var(--season-primary)]/15"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    if (onSearchSubmit) setTimeout(onSearchSubmit, 0);
                  }}
                  className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {onSearchSubmit && (
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                >
                  Search
                </button>
              )}
            </form>
          )}

          {filters && (
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
          )}

          {hasActiveFilters && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}


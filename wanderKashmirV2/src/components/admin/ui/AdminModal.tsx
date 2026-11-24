"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const WIDTH_MAP: Record<NonNullable<AdminModalProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

export function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = "lg",
  children,
  footer,
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      onClick={onClose}
    >
      <div
        className={`w-full ${WIDTH_MAP[maxWidth]} max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <h2 id="admin-modal-title" className="text-sm font-semibold text-slate-900 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


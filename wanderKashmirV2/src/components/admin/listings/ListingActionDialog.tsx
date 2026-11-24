"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

interface ListingActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  description: string;
  actionLabel: string;
  isDestructive?: boolean;
  requireReason?: boolean;
  propertyName: string;
}

export default function ListingActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel,
  isDestructive = false,
  requireReason = true,
  propertyName,
}: ListingActionDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireReason && !reason.trim()) {
      setError("A reason is mandatory for this action.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
      onClick={() => !loading && onClose()}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-9 w-9 rounded-md border flex items-center justify-center shrink-0 ${
                isDestructive
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{propertyName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

          {requireReason && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Audit Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                rows={3}
                placeholder="e.g. Listing information is incomplete, missing photos, or pricing mismatch..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
              />
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 ${
                isDestructive ? "bg-rose-600 hover:bg-rose-700" : "bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)]"
              }`}
            >
              {loading ? "Processing..." : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

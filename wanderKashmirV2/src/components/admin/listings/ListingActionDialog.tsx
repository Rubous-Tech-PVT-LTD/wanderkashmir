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
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isDestructive
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">{propertyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

          {requireReason && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Audit Reason <span className="text-rose-400">*</span>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all ${
                isDestructive
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
              } disabled:opacity-50`}
            >
              {loading ? "Processing..." : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { AdminModal } from "./AdminModal";

interface ConfirmActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "primary";
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => Promise<void> | void;
}

export function ConfirmActionDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  requireReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Provide a brief reason for this action...",
  onConfirm,
}: ConfirmActionDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (submitting) return;
    setReason("");
    setError(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError("Please enter a reason before continuing.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(requireReason ? reason.trim() : undefined);
      setReason("");
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmClasses =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : tone === "warning"
      ? "bg-amber-600 hover:bg-amber-700 text-white"
      : "bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] text-white";

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            disabled={submitting}
            onClick={handleClose}
            className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer ${confirmClasses}`}
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

        {requireReason && (
          <div>
            <label
              htmlFor="confirm-action-reason"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              {reasonLabel} <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="confirm-action-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-2 focus:ring-[var(--season-primary)]/15"
            />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </AdminModal>
  );
}

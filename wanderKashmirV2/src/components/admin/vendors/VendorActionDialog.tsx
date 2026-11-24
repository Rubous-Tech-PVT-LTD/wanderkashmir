"use client";

import { useState } from "react";
import { X, AlertTriangle, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { AdminVendorListItem } from "@/lib/admin/vendors";

export type VendorActionType = "approve" | "reject" | "suspend" | "reactivate";

interface VendorActionDialogProps {
  vendor: AdminVendorListItem;
  actionType: VendorActionType;
  onClose: () => void;
  onConfirm: (vendorId: string, reason?: string) => Promise<void>;
  isProcessing: boolean;
}

export default function VendorActionDialog({
  vendor,
  actionType,
  onClose,
  onConfirm,
  isProcessing,
}: VendorActionDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isReasonRequired = actionType === "reject" || actionType === "suspend";

  const getActionConfig = () => {
    switch (actionType) {
      case "approve":
        return {
          title: "Approve Vendor Application",
          description: `Approve "${vendor.businessName}"? This activates their account and assigns a permanent Vendor ID.`,
          confirmText: "Approve Vendor",
          confirmClass: "bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] text-white",
          icon: CheckCircle2,
          iconColor: "text-[var(--season-primary-hover)] bg-[var(--season-primary-light)] border-[var(--season-primary)]/25",
        };
      case "reject":
        return {
          title: "Reject Vendor Application",
          description: `Provide the reason for rejecting "${vendor.businessName}". This record will move to the Rejected tab.`,
          confirmText: "Reject Vendor",
          confirmClass: "bg-rose-600 hover:bg-rose-700 text-white",
          icon: ShieldAlert,
          iconColor: "text-rose-700 bg-rose-50 border-rose-200",
        };
      case "suspend":
        return {
          title: "Suspend Live Vendor",
          description: `Suspend "${vendor.businessName}"? Their listings will no longer be bookable.`,
          confirmText: "Suspend Vendor",
          confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
          icon: AlertTriangle,
          iconColor: "text-amber-700 bg-amber-50 border-amber-200",
        };
      case "reactivate":
        return {
          title: "Reactivate Vendor",
          description: `Reactivate "${vendor.businessName}" and restore their approved status?`,
          confirmText: "Reactivate Vendor",
          confirmClass: "bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] text-white",
          icon: CheckCircle2,
          iconColor: "text-[var(--season-primary-hover)] bg-[var(--season-primary-light)] border-[var(--season-primary)]/25",
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isReasonRequired) {
      const trimmed = reason.trim();
      if (!trimmed || trimmed.length < 3) {
        setError("Please enter a detailed reason (minimum 3 characters).");
        return;
      }
    }

    try {
      await onConfirm(vendor.id, reason.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to process vendor action.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
      onClick={() => !isProcessing && onClose()}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] bg-white border border-slate-200 rounded-md shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-9 w-9 rounded-md border flex items-center justify-center shrink-0 ${config.iconColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 truncate">{config.title}</h2>
              <p className="text-xs text-slate-500 truncate">{vendor.businessName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-600 leading-relaxed">{config.description}</p>

          {error && (
            <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          {isReasonRequired && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Reason / Remarks <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify the operational or compliance reason..."
                className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${config.confirmClass}`}
            >
              {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{config.confirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

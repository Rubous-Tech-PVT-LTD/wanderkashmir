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
          description: `Are you sure you want to approve "${vendor.businessName}"? This will activate their account and assign a permanent Vendor ID.`,
          confirmText: "Confirm & Approve",
          confirmClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
          icon: CheckCircle2,
          iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        };
      case "reject":
        return {
          title: "Reject Vendor Application",
          description: `Please enter the reason for rejecting "${vendor.businessName}". This record will be moved to the Rejected Vendors tab.`,
          confirmText: "Reject Vendor",
          confirmClass: "bg-red-600 hover:bg-red-500 text-white",
          icon: ShieldAlert,
          iconColor: "text-red-400 bg-red-500/10 border-red-500/20",
        };
      case "suspend":
        return {
          title: "Suspend Live Vendor",
          description: `Are you sure you want to suspend "${vendor.businessName}"? Their listings will no longer be bookable. Reason is required.`,
          confirmText: "Suspend Vendor",
          confirmClass: "bg-amber-600 hover:bg-amber-500 text-white",
          icon: AlertTriangle,
          iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
      case "reactivate":
        return {
          title: "Reactivate Vendor",
          description: `Are you sure you want to reactivate "${vendor.businessName}"? This will restore their approved status.`,
          confirmText: "Reactivate Vendor",
          confirmClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
          icon: CheckCircle2,
          iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
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
    } catch (err: any) {
      setError(err?.message || "Failed to process vendor action.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${config.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{config.title}</h2>
              <p className="text-xs text-slate-400">{vendor.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{config.description}</p>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {isReasonRequired && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Reason / Remarks <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify the operational or compliance reason..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${config.confirmClass}`}
            >
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{config.confirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

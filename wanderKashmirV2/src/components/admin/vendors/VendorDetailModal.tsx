"use client";

import { useState } from "react";
import {
  X,
  Building,
  User,
  CreditCard,
  FileCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { AdminVendorListItem } from "@/lib/admin/vendors";
import { VendorActionType } from "./VendorActionDialog";

interface VendorDetailModalProps {
  vendor: AdminVendorListItem;
  onClose: () => void;
  onTriggerAction: (actionType: VendorActionType) => void;
  onViewKyc: () => void;
}

export default function VendorDetailModal({
  vendor,
  onClose,
  onTriggerAction,
  onViewKyc,
}: VendorDetailModalProps) {
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const getStatusBadge = () => {
    if (vendor.status === "SUSPENDED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" /> Suspended
        </span>
      );
    }
    if (vendor.status === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    }
    if (vendor.isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Live & Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Clock className="w-3 h-3" /> Pending Review
      </span>
    );
  };

  const maskedAccount = vendor.accountNumber
    ? vendor.accountNumber.length > 4
      ? "•••• •••• " + vendor.accountNumber.slice(-4)
      : vendor.accountNumber
    : "Not Provided";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{vendor.businessName}</h2>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400">
                Vendor ID: <span className="font-mono text-emerald-400">{vendor.vendorId || "Not yet assigned"}</span> • Type: {vendor.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Rejection / Suspension Alert */}
          {vendor.rejectionReason && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm">
              <div className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Recorded Notice / Rejection Reason:</span>
              </div>
              <p className="leading-relaxed">{vendor.rejectionReason}</p>
            </div>
          )}

          {/* Section: Business Information */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Business Profile</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Business Name</span>
                <span className="text-white font-medium">{vendor.businessName}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Service Type</span>
                <span className="text-emerald-400 font-semibold">{vendor.type}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Business Email</span>
                <span className="text-slate-300">{vendor.email || "N/A"}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Business Phone</span>
                <span className="text-slate-300">{vendor.phone || "N/A"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Physical Address</span>
                <span className="text-slate-300 leading-relaxed">{vendor.address || "N/A"}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Alt Contact Person</span>
                <span className="text-slate-300">{vendor.altContactPerson || "N/A"}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Alt Phone</span>
                <span className="text-slate-300">{vendor.altPhone || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Section: Owner / Account Info */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>User & Account Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Account Owner</span>
                <span className="text-white font-medium">{vendor.user?.name || "N/A"}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Account Email</span>
                <span className="text-slate-300">{vendor.user?.email || "N/A"}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Registered Since</span>
                <span className="text-slate-300">{new Date(vendor.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Section: Banking & Payout Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Banking & Payout Credentials</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountNumber(!showAccountNumber)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showAccountNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAccountNumber ? "Mask Account" : "Reveal Account"}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Account Holder Name</span>
                <span className="text-white font-medium">{vendor.accountHolderName || "N/A"}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Bank Name</span>
                <span className="text-white font-medium">{vendor.bankName || "N/A"}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Account Number</span>
                <span className="font-mono text-emerald-400 font-semibold text-sm">
                  {showAccountNumber ? vendor.accountNumber || "N/A" : maskedAccount}
                </span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">IFSC Code</span>
                <span className="font-mono text-slate-200 font-medium">{vendor.ifscCode || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Section: Associated Inventory Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 pb-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Associated Inventory</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-xl font-bold text-white block">{vendor.propertiesCount}</span>
                <span className="text-slate-400 text-[11px]">Properties / Stays</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-xl font-bold text-white block">{vendor.vehiclesCount}</span>
                <span className="text-slate-400 text-[11px]">Vehicles</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-xl font-bold text-white block">{vendor.guidesCount}</span>
                <span className="text-slate-400 text-[11px]">Guide Profiles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onViewKyc}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View KYC Docs ({vendor.kycDocuments?.length || 0})</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>

            {/* Context-aware mutation buttons */}
            {!vendor.isApproved && vendor.status !== "REJECTED" && (
              <>
                <button
                  type="button"
                  onClick={() => onTriggerAction("reject")}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onTriggerAction("approve")}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Vendor</span>
                </button>
              </>
            )}

            {vendor.isApproved && vendor.status !== "SUSPENDED" && (
              <button
                type="button"
                onClick={() => onTriggerAction("suspend")}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Suspend Vendor</span>
              </button>
            )}

            {(vendor.status === "REJECTED" || vendor.status === "SUSPENDED") && (
              <button
                type="button"
                onClick={() => onTriggerAction("reactivate")}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reactivate Vendor</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { AdminVendorListItem } from "@/lib/admin/vendors";
import { VendorActionType } from "./VendorActionDialog";
import { StatusBadge } from "@/components/admin/ui";

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

  const statusKey =
    vendor.status === "SUSPENDED"
      ? "SUSPENDED"
      : vendor.status === "REJECTED"
      ? "REJECTED"
      : vendor.isApproved
      ? "LIVE"
      : "PENDING";

  const maskedAccount = vendor.accountNumber
    ? vendor.accountNumber.length > 4
      ? "•••• •••• " + vendor.accountNumber.slice(-4)
      : vendor.accountNumber
    : "Not Provided";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Vendor profile: ${vendor.businessName}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-md shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
              <Building className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 truncate">
                  {vendor.businessName}
                </h2>
                <StatusBadge status={statusKey} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vendor ID:{" "}
                <span className="font-mono text-slate-700">
                  {vendor.vendorId || "Not yet assigned"}
                </span>{" "}
                · Type: {vendor.type}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-[#F8FAFC]">
          {vendor.rejectionReason && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
              <div className="font-semibold text-rose-900 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                <span>Recorded Notice / Rejection Reason</span>
              </div>
              <p className="leading-relaxed">{vendor.rejectionReason}</p>
            </div>
          )}

          {/* Business Information */}
          <div className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <span>Business Profile</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[11px] text-slate-500">Business Name</span>
                <span className="font-medium text-slate-900">{vendor.businessName}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Service Type</span>
                <span className="font-semibold text-emerald-800">{vendor.type}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Business Email</span>
                <span className="text-slate-700">{vendor.email || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Business Phone</span>
                <span className="text-slate-700">{vendor.phone || "N/A"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-[11px] text-slate-500">Physical Address</span>
                <span className="text-slate-700 leading-relaxed">{vendor.address || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Alt Contact Person</span>
                <span className="text-slate-700">{vendor.altContactPerson || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Alt Phone</span>
                <span className="text-slate-700">{vendor.altPhone || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Account Owner</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="block text-[11px] text-slate-500">Name</span>
                <span className="font-medium text-slate-900">{vendor.user?.name || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Email</span>
                <span className="text-slate-700 break-all">{vendor.user?.email || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Registered Since</span>
                <span className="text-slate-700">
                  {new Date(vendor.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Banking & Payout Details */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                <span>Banking & Payout Details</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountNumber(!showAccountNumber)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {showAccountNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showAccountNumber ? "Mask Account" : "Reveal Account"}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[11px] text-slate-500">Account Holder Name</span>
                <span className="font-medium text-slate-900">{vendor.accountHolderName || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Bank Name</span>
                <span className="font-medium text-slate-900">{vendor.bankName || "N/A"}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Account Number</span>
                <span className="font-mono font-semibold text-slate-900">
                  {showAccountNumber ? vendor.accountNumber || "N/A" : maskedAccount}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">IFSC Code</span>
                <span className="font-mono text-slate-800">{vendor.ifscCode || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              <FileCheck className="h-3.5 w-3.5 text-slate-400" />
              <span>Associated Inventory</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="text-lg font-semibold text-slate-900 block tabular-nums">
                  {vendor.propertiesCount}
                </span>
                <span className="text-[11px] text-slate-500">Properties / Stays</span>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="text-lg font-semibold text-slate-900 block tabular-nums">
                  {vendor.vehiclesCount}
                </span>
                <span className="text-[11px] text-slate-500">Vehicles</span>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <span className="text-lg font-semibold text-slate-900 block tabular-nums">
                  {vendor.guidesCount}
                </span>
                <span className="text-[11px] text-slate-500">Guide Profiles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onViewKyc}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            <span>View KYC Docs ({vendor.kycDocuments?.length || 0})</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>

            {!vendor.isApproved && vendor.status !== "REJECTED" && (
              <>
                <button
                  type="button"
                  onClick={() => onTriggerAction("reject")}
                  className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onTriggerAction("approve")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve Vendor</span>
                </button>
              </>
            )}

            {vendor.isApproved && vendor.status !== "SUSPENDED" && (
              <button
                type="button"
                onClick={() => onTriggerAction("suspend")}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Suspend Vendor</span>
              </button>
            )}

            {(vendor.status === "REJECTED" || vendor.status === "SUSPENDED") && (
              <button
                type="button"
                onClick={() => onTriggerAction("reactivate")}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Reactivate Vendor</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { X, FileText, ExternalLink, ShieldCheck } from "lucide-react";
import { AdminVendorListItem } from "@/lib/admin/vendors";

interface VendorKycModalProps {
  vendor: AdminVendorListItem;
  onClose: () => void;
}

export default function VendorKycModal({ vendor, onClose }: VendorKycModalProps) {
  const documents = vendor.kycDocuments || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`KYC documents for ${vendor.businessName}`}
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
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 truncate">
                KYC Verification Documents
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {vendor.businessName} · {vendor.vendorId || "Pending ID"} · {vendor.type}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-[#F8FAFC]">
          {documents.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white text-center py-12 px-4">
              <FileText className="h-9 w-9 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">No KYC documents uploaded</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                This vendor has not uploaded identity or registration documents during onboarding.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((docUrl, idx) => {
                const isPdf = docUrl.toLowerCase().includes(".pdf");
                return (
                  <div
                    key={idx}
                    className="group relative rounded-md border border-slate-200 bg-white overflow-hidden flex flex-col shadow-xs"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">Document #{idx + 1}</span>
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--season-primary)] hover:underline font-medium"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="relative aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                      {isPdf ? (
                        <div className="flex flex-col items-center justify-center p-6 text-slate-500">
                          <FileText className="h-10 w-10 text-slate-400 mb-2" />
                          <span className="text-xs font-semibold text-slate-800">PDF Document</span>
                          <span className="text-[11px] text-slate-500 mt-0.5">
                            Click to view in new tab
                          </span>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={docUrl}
                          alt={`KYC Document ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}

                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Full Size</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legal / License Identifiers */}
          <div className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Official Registration Records
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] uppercase font-medium text-slate-500">
                  GST Number
                </span>
                <span className="font-mono text-slate-900 mt-0.5 block truncate">
                  {vendor.gstNumber || "N/A"}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] uppercase font-medium text-slate-500">
                  PAN Number
                </span>
                <span className="font-mono text-slate-900 mt-0.5 block truncate">
                  {vendor.panNumber || "N/A"}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] uppercase font-medium text-slate-500">
                  Trade License
                </span>
                <span className="font-mono text-slate-900 mt-0.5 block truncate">
                  {vendor.tradeLicense || "N/A"}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="block text-[10px] uppercase font-medium text-slate-500">
                  {vendor.type === "TAXI" ? "Driving License" : "Vehicle Reg"}
                </span>
                <span className="font-mono text-slate-900 mt-0.5 block truncate">
                  {vendor.drivingLicense || vendor.vehicleRegistration || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {documents.length} document{documents.length === 1 ? "" : "s"} attached
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

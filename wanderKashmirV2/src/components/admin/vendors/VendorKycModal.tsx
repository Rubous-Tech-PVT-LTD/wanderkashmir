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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">KYC Verification Documents</h2>
              <p className="text-xs text-slate-400">
                {vendor.businessName} • {vendor.vendorId || "Pending ID"} • {vendor.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Documents Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No KYC Documents Uploaded</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                This vendor has not uploaded identity or registration documents during sign-up.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((docUrl, idx) => {
                const isPdf = docUrl.toLowerCase().includes(".pdf");
                return (
                  <div
                    key={idx}
                    className="group relative rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden hover:border-slate-700 transition-all flex flex-col"
                  >
                    <div className="p-3 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Document #{idx + 1}</span>
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                      >
                        <span>Open Raw</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                      {isPdf ? (
                        <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                          <FileText className="w-12 h-12 text-emerald-400/80 mb-2" />
                          <span className="text-xs font-semibold text-white">PDF Document</span>
                          <span className="text-[11px] text-slate-500 mt-0.5">Click to view in new tab</span>
                        </div>
                      ) : (
                        <img
                          src={docUrl}
                          alt={`KYC Document ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Full Screen</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legal / License Identifiers */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Official Registration Records
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">GST Number</span>
                <span className="font-mono text-slate-200 mt-0.5 block truncate">
                  {vendor.gstNumber || "N/A"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">PAN Number</span>
                <span className="font-mono text-slate-200 mt-0.5 block truncate">
                  {vendor.panNumber || "N/A"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">Trade License</span>
                <span className="font-mono text-slate-200 mt-0.5 block truncate">
                  {vendor.tradeLicense || "N/A"}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="block text-slate-500 text-[10px] uppercase font-semibold">
                  {vendor.type === "TAXI" ? "Driving License" : "Vehicle Reg"}
                </span>
                <span className="font-mono text-slate-200 mt-0.5 block truncate">
                  {vendor.drivingLicense || vendor.vehicleRegistration || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {documents.length} document{documents.length === 1 ? "" : "s"} attached
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

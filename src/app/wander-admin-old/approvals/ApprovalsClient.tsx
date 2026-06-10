"use client";

import { CheckCircle2, XCircle, FileText, AlertCircle, MapPin, Eye, X } from "lucide-react";
import { useState, useEffect } from "react";
import { approveVendor, rejectVendor } from "@/actions/vendor";
import { toast } from "react-hot-toast";

type Vendor = {
  id: string;
  type: string;
  businessName: string;
  isApproved: boolean;
  kycDocuments: string[];
  createdAt: Date;
  user: {
    name: string | null;
  };
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  altContactPerson?: string | null;
  altPhone?: string | null;
  accountHolderName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
};

export default function ApprovalsClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedVendorDetails, setSelectedVendorDetails] = useState<Vendor | null>(null);
  const [rejectingVendor, setRejectingVendor] = useState<Vendor | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await approveVendor(id);
      if (res.success) {
        setVendors(vendors.filter((v) => v.id !== id));
        toast.success("Vendor approved successfully!");
      } else {
        toast.error(res.error || "Failed to approve vendor.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionRemarks.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    
    try {
      const res = await rejectVendor(id, rejectionRemarks);
      if (res.success) {
        setVendors(vendors.filter((v) => v.id !== id));
        setRejectingVendor(null);
        setRejectionRemarks("");
        toast.success("Vendor rejected successfully!");
      } else {
        toast.error(res.error || "Failed to reject vendor.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vendor Approvals Queue</h1>
        <p className="text-slate-500 mt-1">Review and approve new properties, drivers, and guides.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Property / Service</div>
          <div className="col-span-3">Vendor Details</div>
          <div className="col-span-2">Submitted</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {vendors.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No pending approvals!</div>
          ) : (
            vendors.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors">
                <div className="col-span-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'TAXI' ? 'bg-orange-100 text-orange-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.businessName}</p>
                      <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
                        <span className="font-semibold text-slate-700">{item.type}</span>
                        <span>•</span>
                        <MapPin className="w-3 h-3" />
                        <span>Kashmir</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <p className="text-sm font-semibold text-slate-900">{item.user?.name || "Unknown Vendor"}</p>
                  <button 
                    onClick={() => setSelectedVendor(item)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium mt-1"
                  >
                    View KYC Documents ({item.kycDocuments.length})
                  </button>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-slate-500">{mounted ? new Date(item.createdAt).toLocaleDateString() : ""}</p>
                  {item.kycDocuments.length === 0 ? (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Missing Docs
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                      Ready to Review
                    </span>
                  )}
                </div>

                <div className="col-span-3 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => setSelectedVendorDetails(item)}
                    className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" 
                    title="Review Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setRejectingVendor(item)}
                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                    title="Reject"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleApprove(item.id)}
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* KYC Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">KYC Documents</h2>
                <p className="text-sm text-slate-500">{selectedVendor.businessName} ({selectedVendor.type})</p>
              </div>
              <button onClick={() => setSelectedVendor(null)} className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1 space-y-6">
              {selectedVendor.kycDocuments.length === 0 ? (
                <div className="text-center p-12 text-slate-500 font-medium">No KYC documents uploaded by this vendor yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedVendor.kycDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                      <a href={doc} target="_blank" rel="noopener noreferrer" className="block relative aspect-[4/3] rounded-lg overflow-hidden group">
                        {doc.toLowerCase().endsWith('.pdf') ? (
                          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
                            <FileText className="w-12 h-12 mb-2" />
                            <span className="font-semibold text-sm">View PDF</span>
                          </div>
                        ) : (
                          <img src={doc} alt={`KYC Document ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                          Click to Enlarge
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {selectedVendorDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Vendor Application Details</h2>
                <p className="text-sm text-slate-500">Review all information before approving.</p>
              </div>
              <button onClick={() => setSelectedVendorDetails(null)} className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Business Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-slate-500 mb-1">Business Name</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.businessName}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Service Type</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.type}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-500 mb-1">Address</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Contact Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-slate-500 mb-1">Owner Name</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.user?.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Email Address</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Primary Phone</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Alt Contact ({selectedVendorDetails.altContactPerson || "N/A"})</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.altPhone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="col-span-2">
                    <span className="block text-slate-500 mb-1">Account Holder Name</span>
                    <span className="font-bold text-slate-900">{selectedVendorDetails.accountHolderName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Bank Name</span>
                    <span className="font-semibold text-slate-900">{selectedVendorDetails.bankName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Account Number</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedVendorDetails.accountNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">IFSC Code</span>
                    <span className="font-mono font-semibold text-slate-900 uppercase">{selectedVendorDetails.ifscCode || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedVendorDetails(null)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setRejectingVendor(selectedVendorDetails);
                  setSelectedVendorDetails(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-200 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button 
                onClick={() => {
                  handleApprove(selectedVendorDetails.id);
                  setSelectedVendorDetails(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Reject Application</h2>
              <p className="text-sm text-slate-500 mt-1">Provide a reason or warning for {rejectingVendor.businessName}. This will be visible on their dashboard.</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Remarks / Reason</label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                rows={4}
                placeholder="e.g., The Tourism Certificate uploaded is blurry or invalid. Please re-upload a clear copy."
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
              />
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setRejectingVendor(null);
                  setRejectionRemarks("");
                }}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReject(rejectingVendor.id)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors"
              >
                Reject Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

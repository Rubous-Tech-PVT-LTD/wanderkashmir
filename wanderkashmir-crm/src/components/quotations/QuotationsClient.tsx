"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronRight, X, Plus, CheckCircle, History, Save, Send, Trash, Download, Copy, Upload } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

export type QuotationListItem = {
  id: string;
  requirementId: string;
  version: number;
  partnerPrice: number;
  totalCost?: number;
  grossMargin?: number;
  status: string;
  createdAt: Date;
};

export default function QuotationsClient({ quotations, isAdmin = false }: { quotations: QuotationListItem[]; isAdmin?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationListItem | null>(null);

  useEffect(() => {
    const reqId = searchParams.get("reqId") || searchParams.get("openReqId");
    if (reqId && quotations.length > 0 && !selectedQuotation) {
      const q = quotations.find(q => q.requirementId === reqId);
      if (q) {
        setSelectedQuotation(q);
      }
    }
  }, [searchParams, quotations, selectedQuotation]);

  const filtered = quotations.filter(q =>
    q.id.toLowerCase().includes(search.toLowerCase()) ||
    q.requirementId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CRM Quotations</h2>
          <p className="text-slate-500">Manage quotations, build packages, and handle approvals.</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search quotations..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 font-medium">Quotation ID</th>
                <th className="px-6 py-4 font-medium">Req ID</th>
                <th className="px-6 py-4 font-medium">Version</th>
                <th className="px-6 py-4 font-medium">Selling Price</th>
                {isAdmin && <th className="px-6 py-4 font-medium">Total Cost</th>}
                {isAdmin && <th className="px-6 py-4 font-medium">Gross Margin</th>}
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No quotations found.</td></tr>
              ) : filtered.map(q => (
                <React.Fragment key={q.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors hidden md:table-row">
                    <td className="px-6 py-4 font-medium text-slate-900">WK-Q-{q.id.substring(0,6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-slate-500">WK-R-{q.requirementId.substring(0,6).toUpperCase()}</td>
                    <td className="px-6 py-4">v{q.version}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">Rs. {q.partnerPrice?.toLocaleString("en-IN")||0}</td>
                    {isAdmin && <td className="px-6 py-4 font-medium text-red-600">Rs. {q.totalCost?.toLocaleString("en-IN")||0}</td>}
                    {isAdmin && <td className="px-6 py-4 font-medium text-green-600">Rs. {q.grossMargin?.toLocaleString("en-IN")||0}</td>}
                    <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{q.status}</span></td>
                    <td className="px-6 py-4 text-slate-500">{format(new Date(q.createdAt), "dd MMM yyyy")}</td>
                    <td className="px-6 py-4"><button onClick={() => setSelectedQuotation(q)} className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1">Builder <ChevronRight className="w-4 h-4"/></button></td>
                  </tr>
                  <tr className="md:hidden">
                    <td colSpan={7} className="p-0">
                      <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                        <div className="flex justify-between items-start">
                          <div><h3 className="font-semibold text-slate-900 text-lg">WK-Q-{q.id.substring(0,6).toUpperCase()}</h3><p className="text-xs text-slate-500">Req: WK-R-{q.requirementId.substring(0,6).toUpperCase()}</p></div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{q.status}</span>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">v{q.version}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="flex flex-col"><span className="text-xs text-slate-400 uppercase tracking-wider">Selling Price</span><span className="font-semibold text-slate-900">Rs. {q.partnerPrice?.toLocaleString("en-IN")||0}</span></div>
                          <div className="flex flex-col"><span className="text-xs text-slate-400 uppercase tracking-wider">Created</span><span className="font-medium">{format(new Date(q.createdAt), "dd MMM yyyy")}</span></div>
                        </div>
                        <div className="pt-3 border-t border-slate-100"><button onClick={() => setSelectedQuotation(q)} className="w-full flex items-center justify-center gap-1 py-2.5 bg-orange-50 text-orange-600 rounded-lg font-medium active:bg-orange-100 transition-colors">Builder <ChevronRight className="w-4 h-4"/></button></div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedQuotation && (
        <QuotationBuilderModal
          quotationId={selectedQuotation.id}
          onClose={() => setSelectedQuotation(null)}
          onUpdate={() => { setSelectedQuotation(null); router.refresh(); }}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

function QuotationBuilderModal({ quotationId, onClose, onUpdate, isAdmin }: { quotationId: string; onClose: () => void; onUpdate: () => void; isAdmin?: boolean }) {
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [proofUrls, setProofUrls] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/quotations/${quotationId}`).then(r => r.json()).then(d => setQuotation(d)).catch(console.error).finally(() => setLoading(false));
  }, [quotationId]);

  if (loading || !quotation) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8">Loading Builder...</div>
      </div>
    );
  }

  const isEditable = quotation.status !== "ACCEPTED" && quotation.status !== "SENT" && quotation.status !== "INTERNAL_REVIEW" && quotation.status !== "CONFIRMED";

  const handleCopyQuotation = () => {
    let text = `*Quotation: WK-Q-${quotation.id.substring(0,6).toUpperCase()}*\n`;
    text += `*Valid Until:* ${quotation.validUntil ? format(new Date(quotation.validUntil), "dd MMM yyyy") : "TBD"}\n\n`;
    text += `*Itinerary & Services:*\n`;
    quotation.items?.forEach((item: any) => {
      text += `- ${item.category}: ${item.description} (${item.quantity} ${item.unit})\n`;
    });
    text += `\n*Total Selling Price:* Rs. ${quotation.partnerPrice?.toLocaleString("en-IN")}\n`;
    if (quotation.terms) {
      text += `\n*Terms & Policies:*\n${quotation.terms}\n`;
    }
    
    navigator.clipboard.writeText(text).then(() => {
      alert("Quotation copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  const handleConfirmQuotation = async () => {
    if (proofUrls.length === 0) {
      return alert("Please upload confirmation proof first.");
    }
    setConfirming(true);
    try {
      const res = await fetch(`/api/quotations/${quotation.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationProofUrl: proofUrls[0] }),
      });
      if (res.ok) {
        setShowConfirmModal(false);
        onUpdate();
      } else {
        const error = await res.json();
        alert("Failed to confirm: " + (error.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setConfirming(false);
    }
  };

  const handleCreateBooking = async () => {
    setCreatingBooking(true);
    try {
      const res = await fetch(`/api/quotations/${quotation.id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        router.push("/dashboard/bookings");
        onClose();
      } else {
        const error = await res.json();
        alert("Failed to create booking: " + (error.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setCreatingBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl print:shadow-none print:h-auto print:rounded-none">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white print:hidden">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3">
              Quotation Builder
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/20">WK-Q-{quotation.id.substring(0,6).toUpperCase()}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">v{quotation.version}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">{quotation.status}</span>
            </h3>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <button onClick={handleCopyQuotation} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Copy className="w-4 h-4"/> Copy Text</button>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Download className="w-4 h-4"/> Download PDF</button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden print:hidden">
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h4 className="text-lg font-bold text-slate-900">Itinerary &amp; Services</h4>
              {isEditable && <button className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100"><Plus className="w-4 h-4"/> Add Item</button>}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Qty</th>
                    {isAdmin && <th className="px-4 py-3">Unit Cost</th>}
                    <th className="px-4 py-3">Unit Sell</th>
                    {isAdmin && <th className="px-4 py-3">Total Cost</th>}
                    <th className="px-4 py-3">Total Sell</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.items?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.category}</td>
                      <td className="px-4 py-3 text-slate-600">{item.description}</td>
                      <td className="px-4 py-3">{item.quantity} {item.unit}</td>
                      {isAdmin && <td className="px-4 py-3 text-red-600">Rs. {item.unitCost}</td>}
                      <td className="px-4 py-3 text-green-600">Rs. {item.unitSellingPrice}</td>
                      {isAdmin && <td className="px-4 py-3 font-medium text-red-700">Rs. {item.totalCost}</td>}
                      <td className="px-4 py-3 font-medium text-green-700">Rs. {item.totalSellingPrice}</td>
                      <td className="px-4 py-3 text-right">{isEditable&&<button className="text-slate-400 hover:text-red-500"><Trash className="w-4 h-4"/></button>}</td>
                    </tr>
                  ))}
                  {!quotation.items?.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No items added to this quotation.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <h4 className="font-bold text-slate-900 mb-4">Terms &amp; Policies</h4>
                <div className="space-y-4"><div><label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Inclusions &amp; Exclusions</label><textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[100px]" value={quotation.terms||""} readOnly={!isEditable} placeholder="Enter terms..."/></div></div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-0 overflow-hidden flex flex-col">
                <div className="bg-slate-900 p-4 text-white"><h4 className="font-bold flex items-center justify-between"><span>Financial Summary</span>{isAdmin && <span className="text-xs bg-white/20 px-2 py-1 rounded text-white/90">INTERNAL</span>}</h4></div>
                <div className="p-5 space-y-3 flex-1 text-sm">
                  {isAdmin && <div className="flex justify-between pb-2 border-b border-slate-100"><span className="text-slate-500">Total Cost</span><span className="font-medium text-red-600">Rs. {quotation.totalCost}</span></div>}
                  <div className="flex justify-between pb-2 border-b border-slate-100"><span className="text-slate-500">Total Selling (Before Discount)</span><span className="font-medium">Rs. {quotation.totalSellingPrice}</span></div>
                  <div className="flex justify-between pb-2 border-b border-slate-100 items-center"><span className="text-slate-500">Discount Amount</span><span className="text-orange-500 font-medium">- Rs. {quotation.discountType==="FIXED"?quotation.discount:((quotation.totalSellingPrice*quotation.discount)/100)}</span></div>
                  <div className="flex justify-between pb-2 border-b border-slate-100 pt-2"><span className="font-bold text-slate-900">Final Selling Price</span><span className="font-bold text-green-600 text-lg">Rs. {quotation.partnerPrice}</span></div>
                  {isAdmin && (
                    <div className="grid grid-cols-2 gap-4 pt-4 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div><span className="block text-xs text-slate-500 mb-1">Gross Margin</span><span className="font-bold text-slate-700">Rs. {quotation.grossMargin}</span></div>
                      <div><span className="block text-xs text-slate-500 mb-1">Net Margin</span><span className="font-bold text-blue-600">Rs. {quotation.netMargin}</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-80 border-t md:border-l border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-4 md:p-6 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs text-slate-500">Actions</h4>
              <div className="space-y-3">
                {(quotation.status==="DRAFT"||quotation.status==="REVISED")&&<button className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-medium transition-colors"><Send className="w-4 h-4"/> Submit for Approval</button>}
                {quotation.status==="INTERNAL_REVIEW"&&<><button className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-medium transition-colors"><CheckCircle className="w-4 h-4"/> Approve Quotation</button><button className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl font-medium transition-colors">Reject Quotation</button></>}
                {(quotation.status==="APPROVED"||quotation.status==="SENT"||quotation.status==="ACCEPTED")&&<><button onClick={() => setShowConfirmModal(true)} className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium transition-colors"><Upload className="w-4 h-4"/> Mark as Confirmed</button><button className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2.5 rounded-xl font-medium transition-colors border border-orange-200"><History className="w-4 h-4"/> Revise (New Version)</button></>}
                {quotation.status==="CONFIRMED"&&<><button onClick={handleCreateBooking} disabled={creatingBooking} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"><CheckCircle className="w-4 h-4"/> {creatingBooking ? "Creating Booking..." : "Create Booking"}</button></>}
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs text-slate-500">Version History</h4>
              <div className="space-y-4">
                <div className="p-3 border-2 border-orange-500 rounded-xl bg-orange-50 relative">
                  <span className="absolute -top-2.5 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">CURRENT</span>
                  <div className="font-bold text-slate-900 text-sm">Version {quotation.version}</div>
                  <div className="text-xs text-slate-500 mb-2">{format(new Date(quotation.createdAt),"dd MMM yyyy HH:mm")}</div>
                  <div className="flex justify-between items-center text-sm"><span className="text-slate-700">Rs. {quotation.partnerPrice}</span><span className="font-medium text-orange-600 text-xs">{quotation.status}</span></div>
                </div>
                {quotation.version>1&&(<div className="p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"><div className="font-bold text-slate-600 text-sm">Version {quotation.version-1}</div><div className="flex justify-between items-center text-sm mt-1"><span className="font-medium text-slate-500 text-xs">REVISED</span></div></div>)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Hidden Print Section */}
        <div className="hidden print:block p-8 bg-white text-black min-h-screen">
          <div className="flex justify-between items-end border-b-2 border-orange-500 pb-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-orange-500">WanderKashmir</h1>
              <p className="text-sm text-slate-600 mt-1">Srinagar, Jammu &amp; Kashmir</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p className="font-bold text-slate-900">Quotation Ref: WK-Q-{quotation.id.substring(0,6).toUpperCase()}</p>
              <p>Date: {format(new Date(quotation.createdAt), "dd MMM yyyy")}</p>
              <p>Valid Until: {quotation.validUntil ? format(new Date(quotation.validUntil), "dd MMM yyyy") : "TBD"}</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Travel Itinerary &amp; Package Details</h2>
          
          <table className="w-full text-left text-sm mb-6 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="p-3 border border-slate-300">Category</th>
                <th className="p-3 border border-slate-300">Description</th>
                <th className="p-3 border border-slate-300">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="p-3 border border-slate-300 font-medium">{item.category}</td>
                  <td className="p-3 border border-slate-300">{item.description}</td>
                  <td className="p-3 border border-slate-300">{item.quantity} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-end mb-10">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 w-64">
              <div className="text-sm text-slate-500 mb-1">Total Package Price</div>
              <div className="text-2xl font-bold text-slate-900">Rs. {quotation.partnerPrice?.toLocaleString("en-IN")}</div>
            </div>
          </div>
          
          {quotation.terms && (
             <div className="mb-6 page-break-inside-avoid">
               <h3 className="text-lg font-bold mb-3 text-slate-900 border-b border-slate-200 pb-2">Terms, Conditions &amp; Exclusions</h3>
               <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{quotation.terms}</div>
             </div>
          )}
          
          <div className="mt-12 text-center text-sm text-slate-500 border-t border-slate-200 pt-6">
            <p>Thank you for choosing WanderKashmir.</p>
            <p>For any queries, please contact your travel advisor.</p>
          </div>
        </div>

      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Confirm Quotation</h3>
            <p className="text-sm text-slate-500 mb-6">Upload proof of vendor confirmation (e.g. email screenshot or chat) to proceed with booking creation.</p>
            
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md mb-6">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Upload Proof of Vendor Confirmation
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement("canvas");
                        let width = img.width;
                        let height = img.height;
                        const MAX_WIDTH = 1200;
                        const MAX_HEIGHT = 1200;
                        if (width > height) {
                          if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                          }
                        } else {
                          if (height > MAX_HEIGHT) {
                            width = Math.round((width * MAX_HEIGHT) / height);
                            height = MAX_HEIGHT;
                          }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx?.drawImage(img, 0, 0, width, height);
                        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                        setProofUrls([compressedBase64]);
                      };
                      img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {proofUrls.length > 0 && (
                <div className="mt-3">
                  <img src={proofUrls[0]} alt="Proof" className="w-full h-32 object-cover rounded-md border border-blue-200" />
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleConfirmQuotation} disabled={confirming || proofUrls.length === 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50">
                {confirming ? "Saving..." : "Save Confirmation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

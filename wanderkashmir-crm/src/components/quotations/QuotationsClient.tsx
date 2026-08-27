"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronRight, X, Plus, CheckCircle, History, Save, Send, Trash, Download } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export type QuotationListItem = {
  id: string;
  requirementId: string;
  version: number;
  partnerPrice: number;
  netCost?: number;
  markup?: number;
  status: string;
  createdAt: Date;
};

export default function QuotationsClient({ quotations, isAdmin = false }: { quotations: QuotationListItem[]; isAdmin?: boolean }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationListItem | null>(null);

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
                {isAdmin && <th className="px-6 py-4 font-medium">Net Cost</th>}
                {isAdmin && <th className="px-6 py-4 font-medium">Markup</th>}
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
                    {isAdmin && <td className="px-6 py-4 font-medium text-red-600">Rs. {q.netCost?.toLocaleString("en-IN")||0}</td>}
                    {isAdmin && <td className="px-6 py-4 font-medium text-green-600">Rs. {q.markup?.toLocaleString("en-IN")||0}</td>}
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

  const isEditable = quotation.status !== "ACCEPTED" && quotation.status !== "SENT" && quotation.status !== "INTERNAL_REVIEW";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3">
              Quotation Builder
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/20">WK-Q-{quotation.id.substring(0,6).toUpperCase()}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">v{quotation.version}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">{quotation.status}</span>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Download className="w-4 h-4"/> Download PDF</button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
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
                {(quotation.status==="APPROVED"||quotation.status==="SENT")&&<><button className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-medium transition-colors"><CheckCircle className="w-4 h-4"/> Accept &amp; Convert to Booking</button><button className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2.5 rounded-xl font-medium transition-colors border border-orange-200"><History className="w-4 h-4"/> Revise (New Version)</button></>}
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
      </div>
    </div>
  );
}

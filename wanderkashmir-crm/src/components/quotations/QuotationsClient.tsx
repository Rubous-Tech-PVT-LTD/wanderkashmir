"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronRight, X, Plus, CheckCircle, History, Save, Send, Trash, Download, Copy, Upload, AlertCircle, MapPin, Calendar, Clock, ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

export type QuotationListItem = {
  id: string;
  requirementId: string;
  version: number;
  partnerPrice: number;
  retailPrice?: number | null;
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
                <th className="px-6 py-4 font-medium">Retail Price</th>
                <th className="px-6 py-4 font-medium">B2B Price</th>
                {isAdmin && <th className="px-6 py-4 font-medium">Internal Cost</th>}
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-slate-500">No quotations found.</td></tr>
              ) : filtered.map(q => (
                <React.Fragment key={q.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors hidden md:table-row">
                    <td className="px-6 py-4 font-medium text-slate-900">WK-Q-{q.id.substring(0,6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-slate-500">WK-R-{q.requirementId.substring(0,6).toUpperCase()}</td>
                    <td className="px-6 py-4">v{q.version}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {q.retailPrice !== null && q.retailPrice !== undefined ? `Rs. ${q.retailPrice.toLocaleString("en-IN")}` : <span className="text-slate-400 italic">Not Set</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">Rs. {q.partnerPrice?.toLocaleString("en-IN")||0}</td>
                    {isAdmin && <td className="px-6 py-4 font-medium text-red-600">Rs. {q.totalCost?.toLocaleString("en-IN")||0}</td>}
                    <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{q.status}</span></td>
                    <td className="px-6 py-4 text-slate-500">{format(new Date(q.createdAt), "dd MMM yyyy")}</td>
                    <td className="px-6 py-4"><button onClick={() => setSelectedQuotation(q)} className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1">Builder <ChevronRight className="w-4 h-4"/></button></td>
                  </tr>
                  <tr className="md:hidden">
                    <td colSpan={9} className="p-0">
                      <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                        <div className="flex justify-between items-start">
                          <div><h3 className="font-semibold text-slate-900 text-lg">WK-Q-{q.id.substring(0,6).toUpperCase()}</h3><p className="text-xs text-slate-500">Req: WK-R-{q.requirementId.substring(0,6).toUpperCase()}</p></div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{q.status}</span>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">v{q.version}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Retail Price</span>
                            <span className="font-semibold text-slate-700">{q.retailPrice !== null && q.retailPrice !== undefined ? `Rs. ${q.retailPrice.toLocaleString("en-IN")}` : 'Not Set'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 uppercase tracking-wider">B2B Price</span>
                            <span className="font-bold text-slate-900">Rs. {q.partnerPrice?.toLocaleString("en-IN")||0}</span>
                          </div>
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
          onUpdate={(newId?: string) => { 
            setSelectedQuotation(null); 
            router.refresh(); 
            if(newId) {
               setTimeout(() => {
                 const updatedQ = quotations.find(q => q.id === newId);
                 if(updatedQ) setSelectedQuotation(updatedQ);
               }, 500);
            }
          }}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

function QuotationBuilderModal({ quotationId, onClose, onUpdate, isAdmin }: { quotationId: string; onClose: () => void; onUpdate: (newId?: string) => void; isAdmin?: boolean }) {
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [items, setItems] = useState<any[]>([]);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [terms, setTerms] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("FIXED");
  const [retailPrice, setRetailPrice] = useState<string>("");

  // Status Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [proofUrls, setProofUrls] = useState<string[]>([]);
  
  // Async states
  const [saving, setSaving] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const router = useRouter();

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotations/${quotationId}`);
      const data = await res.json();
      setQuotation(data);
      setItems(data.items || []);
      setItinerary(data.itinerary || []);
      setTerms(data.terms || "");
      setDiscount(data.discount || 0);
      setDiscountType(data.discountType || "FIXED");
      setRetailPrice(data.retailPrice !== null && data.retailPrice !== undefined ? String(data.retailPrice) : "");
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [quotationId]);

  if (loading || !quotation) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl">Loading Builder...</div>
      </div>
    );
  }

  // Permissions & Visibility
  const isEditable = (quotation.status === "DRAFT" || quotation.status === "REVISED");
  const canSubmit = !isAdmin && isEditable; 
  const canAdminApprove = isAdmin && quotation.status === "INTERNAL_REVIEW";

  // Calculations
  const calculatedTotalCost = items.reduce((acc, item) => acc + (Number(item.quantity || 1) * Number(item.unitCost || 0)), 0);
  const calculatedTotalSelling = items.reduce((acc, item) => acc + (Number(item.quantity || 1) * Number(item.unitSellingPrice || 0)), 0);
  const calculatedDiscountAmount = discountType === "FIXED" ? Number(discount) : (calculatedTotalSelling * Number(discount) / 100);
  const calculatedFinalSelling = calculatedTotalSelling - calculatedDiscountAmount;
  const calculatedGrossMargin = calculatedFinalSelling - calculatedTotalCost;
  const displayRetailPrice = retailPrice ? Number(retailPrice) : null;

  // Itinerary Handlers
  const handleAddDay = () => {
    if (itinerary.length >= 10) return;
    setItinerary([...itinerary, { 
      dayNumber: itinerary.length + 1, 
      title: "", 
      destination: "", 
      description: "", 
      activities: "", 
      overnight: "" 
    }]);
  };

  const handleItineraryChange = (index: number, field: string, value: string) => {
    const newItin = [...itinerary];
    newItin[index][field] = value;
    setItinerary(newItin);
  };

  const handleDeleteDay = (index: number) => {
    const newItin = [...itinerary];
    newItin.splice(index, 1);
    // Renumber days
    newItin.forEach((day, i) => { day.dayNumber = i + 1; });
    setItinerary(newItin);
  };

  const moveDay = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === itinerary.length - 1) return;
    const newItin = [...itinerary];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    [newItin[index], newItin[targetIdx]] = [newItin[targetIdx], newItin[index]];
    newItin.forEach((day, i) => { day.dayNumber = i + 1; });
    setItinerary(newItin);
  };

  // Item Handlers
  const handleAddItem = () => {
    setItems([...items, { category: "HOTEL", description: "", quantity: 1, unit: "Night", unitCost: 0, unitSellingPrice: 0 }]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // API Handlers
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        items,
        itinerary,
        terms,
        discount,
        discountType,
        retailPrice: retailPrice !== "" ? Number(retailPrice) : null
      };

      const res = await fetch(`/api/quotations/${quotation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Draft saved successfully!");
        fetchQuotation(); // refresh
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save draft");
      }
    } catch(e) {
      alert("Error saving draft");
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action: string) => {
    if (action === "SUBMIT" && items.length === 0) {
      return alert("Cannot submit an empty quotation. Please add services.");
    }
    
    if (action === "SUBMIT" && isEditable) {
       await fetch(`/api/quotations/${quotation.id}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ items, itinerary, terms, discount, discountType, retailPrice: retailPrice !== "" ? Number(retailPrice) : null })
       });
    }

    let reason = "";
    if (action === "REJECT" || action === "REQUEST_REVISION") {
      reason = prompt("Please provide a reason or note:") || "";
      if (!reason && action === "REJECT") return;
    }

    setProcessingAction(action);
    try {
      const res = await fetch(`/api/quotations/${quotation.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason })
      });
      if (res.ok) {
        onUpdate(); 
      } else {
        const err = await res.json();
        alert(err.error || "Action failed");
      }
    } catch(e) {
      alert("Error performing action");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDuplicateVersion = async () => {
    setProcessingAction("DUPLICATE");
    try {
      const res = await fetch(`/api/quotations/${quotation.id}/version`, {
        method: "POST",
      });
      if (res.ok) {
        const newQuote = await res.json();
        onUpdate(newQuote.id);
      } else {
        alert("Failed to duplicate version");
      }
    } catch(e) {
      alert("Error creating new version");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCopyQuotation = () => {
    let text = `*Quotation: WK-Q-${quotation.id.substring(0,6).toUpperCase()}*\n`;
    text += `*Valid Until:* ${quotation.validUntil ? format(new Date(quotation.validUntil), "dd MMM yyyy") : "TBD"}\n\n`;
    
    if (itinerary.length > 0) {
      text += `*Day-wise Itinerary:*\n`;
      itinerary.forEach((day) => {
        text += `\nDay ${day.dayNumber}: ${day.title}\n`;
        if (day.destination) text += `Destination: ${day.destination}\n`;
        if (day.description) text += `${day.description}\n`;
        if (day.activities) text += `Activities: ${day.activities}\n`;
        if (day.overnight) text += `Overnight: ${day.overnight}\n`;
      });
      text += `\n`;
    }

    text += `*Services & Inclusions:*\n`;
    items.forEach((item: any) => {
      text += `- ${item.category}: ${item.description} (${item.quantity} ${item.unit})\n`;
    });
    
    text += `\n*Pricing Summary:*\n`;
    if (displayRetailPrice) {
      text += `Actual Price (Retail): Rs. ${displayRetailPrice.toLocaleString("en-IN")}\n`;
    }
    text += `B2B Price: Rs. ${calculatedFinalSelling.toLocaleString("en-IN")}\n`;

    if (terms) {
      text += `\n*Terms & Policies:*\n${terms}\n`;
    }
    
    navigator.clipboard.writeText(text).then(() => {
      alert("Quotation copied successfully (Internal details hidden)!");
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
      <div className="bg-white rounded-2xl w-full max-w-7xl h-[94vh] overflow-hidden flex flex-col shadow-2xl print:shadow-none print:h-auto print:rounded-none">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-900 text-white gap-3 print:hidden">
          <div>
            <h3 className="text-xl font-bold flex flex-wrap items-center gap-2">
              Quotation Builder
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/20">WK-Q-{quotation.id.substring(0,6).toUpperCase()}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">v{quotation.version}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">{quotation.status}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2 print:hidden overflow-x-auto">
            <button onClick={handleCopyQuotation} className="flex whitespace-nowrap items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Copy className="w-4 h-4"/> Copy Text</button>
            <button onClick={() => window.print()} className="flex whitespace-nowrap items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Download className="w-4 h-4"/> Download PDF</button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden print:hidden">
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 pb-20">
            
            {/* PRICING SECTION (Top Level for BA and Admin) */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
              <div className="bg-slate-100/50 p-4 border-b border-slate-200 flex justify-between items-center">
                <h4 className="font-bold text-slate-900">Quotation Pricing Configuration</h4>
              </div>
              <div className="p-5 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Actual Price (Retail) <span className="lowercase text-[10px] text-slate-400 font-normal ml-1">Customer-facing</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">Rs.</span>
                    <input 
                      type="number"
                      min="0"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                      value={retailPrice}
                      onChange={e => setRetailPrice(e.target.value)}
                      readOnly={!isEditable}
                      placeholder="e.g. 65000"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">B2B Price <span className="lowercase text-[10px] text-slate-400 font-normal ml-1">Calculated from services</span></label>
                  <div className="w-full pl-4 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-900">
                    Rs. {calculatedFinalSelling.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>

            {/* DAY-WISE ITINERARY */}
            <div className="flex justify-between items-center mb-4 mt-8">
              <h4 className="text-lg font-bold text-slate-900">Day-wise Itinerary</h4>
              {isEditable && itinerary.length < 10 && (
                <button onClick={handleAddDay} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  <Plus className="w-4 h-4"/> Add Day
                </button>
              )}
            </div>

            {itinerary.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-500 mb-8">
                No itinerary days added yet.
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {itinerary.map((day, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 w-full md:w-32 p-4 flex flex-col items-center justify-center shrink-0">
                      <div className="font-bold text-slate-900 text-lg">DAY {day.dayNumber}</div>
                      {isEditable && (
                        <div className="flex items-center gap-2 mt-3 text-slate-400">
                          <button onClick={() => moveDay(idx, 'up')} disabled={idx === 0} className="hover:text-slate-700 disabled:opacity-30"><ArrowUp className="w-4 h-4"/></button>
                          <button onClick={() => moveDay(idx, 'down')} disabled={idx === itinerary.length - 1} className="hover:text-slate-700 disabled:opacity-30"><ArrowDown className="w-4 h-4"/></button>
                        </div>
                      )}
                    </div>
                    <div className="p-4 md:p-5 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 flex gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Title</label>
                          {isEditable ? (
                            <input type="text" value={day.title} onChange={e=>handleItineraryChange(idx, "title", e.target.value)} placeholder="e.g. Srinagar Arrival" className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50 focus:bg-white" />
                          ) : <div className="font-medium">{day.title || "-"}</div>}
                        </div>
                        <div className="w-1/3">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Destination</label>
                          {isEditable ? (
                            <input type="text" value={day.destination} onChange={e=>handleItineraryChange(idx, "destination", e.target.value)} placeholder="e.g. Srinagar" className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50 focus:bg-white" />
                          ) : <div className="text-sm">{day.destination || "-"}</div>}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Description</label>
                        {isEditable ? (
                          <textarea value={day.description} onChange={e=>handleItineraryChange(idx, "description", e.target.value)} placeholder="Brief description of the day's events..." className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50 focus:bg-white h-20 resize-none" />
                        ) : <div className="text-sm text-slate-600">{day.description || "-"}</div>}
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Activities</label>
                        {isEditable ? (
                          <input type="text" value={day.activities} onChange={e=>handleItineraryChange(idx, "activities", e.target.value)} placeholder="e.g. Shikara Ride" className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50 focus:bg-white" />
                        ) : <div className="text-sm">{day.activities || "-"}</div>}
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Overnight</label>
                        {isEditable ? (
                          <input type="text" value={day.overnight} onChange={e=>handleItineraryChange(idx, "overnight", e.target.value)} placeholder="e.g. Srinagar Hotel" className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50 focus:bg-white" />
                        ) : <div className="text-sm font-medium">{day.overnight || "-"}</div>}
                      </div>
                    </div>
                    {isEditable && (
                      <div className="p-3 flex items-start justify-end md:justify-center border-t md:border-t-0 md:border-l border-slate-100">
                        <button onClick={() => handleDeleteDay(idx)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash className="w-4 h-4"/>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            
            {/* ITINERARY SERVICES */}
            <div className="flex justify-between items-center mb-4 mt-8">
              <h4 className="text-lg font-bold text-slate-900">Services & Inclusions</h4>
              {isEditable && (
                <button onClick={handleAddItem} className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                  <Plus className="w-4 h-4"/> Add Service
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto mb-8">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-slate-100 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 min-w-[200px]">Description</th>
                    <th className="px-4 py-3 w-24">Qty</th>
                    {isAdmin && <th className="px-4 py-3 w-32">Unit Cost</th>}
                    <th className="px-4 py-3 w-32">Unit Sell</th>
                    {isAdmin && <th className="px-4 py-3">Total Cost</th>}
                    <th className="px-4 py-3">Total Sell</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {isEditable ? (
                          <select value={item.category} onChange={e=>handleItemChange(index, "category", e.target.value)} className="w-full border-slate-200 rounded p-1 text-sm bg-slate-50 focus:bg-white border">
                            <option value="HOTEL">Hotel</option>
                            <option value="CAB">Cab</option>
                            <option value="HOUSEBOAT">Houseboat</option>
                            <option value="SIGHTSEEING">Sightseeing</option>
                            <option value="ACTIVITY">Activity</option>
                            <option value="TRANSFER">Transfer</option>
                            <option value="OTHER">Other</option>
                          </select>
                        ) : item.category}
                      </td>
                      <td className="px-4 py-3">
                        {isEditable ? (
                          <input type="text" value={item.description} onChange={e=>handleItemChange(index, "description", e.target.value)} placeholder="E.g. Deluxe Room" className="w-full border border-slate-200 rounded p-1 text-sm bg-slate-50 focus:bg-white" />
                        ) : <span className="text-slate-600">{item.description}</span>}
                      </td>
                      <td className="px-4 py-3 flex items-center gap-1">
                        {isEditable ? (
                          <input type="number" min="1" value={item.quantity} onChange={e=>handleItemChange(index, "quantity", parseInt(e.target.value)||0)} className="w-16 border border-slate-200 rounded p-1 text-sm bg-slate-50 focus:bg-white" />
                        ) : item.quantity}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-red-600">
                          {isEditable ? (
                            <input type="number" value={item.unitCost} onChange={e=>handleItemChange(index, "unitCost", parseFloat(e.target.value)||0)} className="w-24 border border-slate-200 rounded p-1 text-sm bg-slate-50 focus:bg-white" />
                          ) : `Rs. ${item.unitCost}`}
                        </td>
                      )}
                      <td className="px-4 py-3 text-green-600">
                        {isEditable ? (
                          <input type="number" value={item.unitSellingPrice} onChange={e=>handleItemChange(index, "unitSellingPrice", parseFloat(e.target.value)||0)} className="w-24 border border-slate-200 rounded p-1 text-sm bg-slate-50 focus:bg-white" />
                        ) : `Rs. ${item.unitSellingPrice}`}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 font-medium text-red-700">Rs. {(Number(item.quantity||1)*Number(item.unitCost||0)).toLocaleString("en-IN")}</td>
                      )}
                      <td className="px-4 py-3 font-medium text-green-700">Rs. {(Number(item.quantity||1)*Number(item.unitSellingPrice||0)).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right">
                        {isEditable && (
                          <button onClick={() => handleDeleteItem(index)} className="text-slate-400 hover:text-red-500 transition-colors p-1"><Trash className="w-4 h-4"/></button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No services added to this quotation.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <h4 className="font-bold text-slate-900 mb-4">Terms &amp; Policies</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Inclusions, Exclusions &amp; Policies</label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm min-h-[160px] bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500" 
                      value={terms} 
                      onChange={e=>setTerms(e.target.value)}
                      readOnly={!isEditable} 
                      placeholder="Enter inclusions, exclusions, and payment terms here..."
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-0 overflow-hidden flex flex-col h-fit">
                <div className="bg-slate-900 p-4 text-white">
                  <h4 className="font-bold flex items-center justify-between">
                    <span>Internal Financial Breakdown</span>
                    {isAdmin && <span className="text-[10px] bg-red-500/80 px-2 py-0.5 rounded text-white font-bold tracking-widest">ADMIN PREVIEW</span>}
                  </h4>
                </div>
                <div className="p-5 space-y-3 text-sm flex-1">
                  {!isAdmin ? (
                    <div className="text-slate-500 text-center py-6">
                      Detailed financial breakdown is restricted. <br/>
                      <span className="text-xs">You can manage the Retail Price and services above.</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Total Vendor Cost</span>
                        <span className="font-medium text-red-600">Rs. {calculatedTotalCost.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Actual Price (Retail)</span>
                        <span className="font-medium text-slate-900">
                          {displayRetailPrice ? `Rs. ${displayRetailPrice.toLocaleString("en-IN")}` : <span className="text-slate-400 italic">Not Set</span>}
                        </span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Total Selling (Before Discount)</span>
                        <span className="font-medium">Rs. {calculatedTotalSelling.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-100 items-center">
                        <span className="text-slate-500 font-medium">Discount Given</span>
                        <div className="flex items-center gap-2">
                          {isEditable ? (
                            <input type="number" value={discount} onChange={e=>setDiscount(Number(e.target.value))} className="w-20 text-right border border-slate-200 rounded px-2 py-1 text-sm bg-slate-50 focus:bg-white" />
                          ) : (
                            <span className="text-orange-500 font-medium">- Rs. {calculatedDiscountAmount.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-slate-100 pt-2 bg-green-50 p-2 rounded-lg -mx-2 px-2 border-l-4 border-l-green-500">
                        <span className="font-bold text-slate-900">Final B2B Price</span>
                        <span className="font-bold text-green-600 text-lg">Rs. {calculatedFinalSelling.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div>
                          <span className="block text-xs text-slate-500 mb-1">Expected Margin</span>
                          <span className="font-bold text-slate-700 text-base">Rs. {calculatedGrossMargin.toLocaleString("en-IN")}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-slate-500 mb-1">Margin %</span>
                          <span className={`font-bold text-base ${calculatedFinalSelling > 0 && (calculatedGrossMargin/calculatedFinalSelling) >= 0.1 ? 'text-green-600' : 'text-red-500'}`}>
                            {calculatedFinalSelling > 0 ? ((calculatedGrossMargin / calculatedFinalSelling) * 100).toFixed(2) : 0}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="w-full md:w-80 border-t md:border-l border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs text-slate-500">Actions</h4>
              <div className="space-y-3">
                
                {isEditable && (
                  <button onClick={handleSaveDraft} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4"/> {saving ? "Saving..." : "Save Draft"}
                  </button>
                )}

                {canSubmit && (
                  <button onClick={() => handleAction("SUBMIT")} disabled={processingAction === "SUBMIT"} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                    <Send className="w-4 h-4"/> {processingAction === "SUBMIT" ? "Submitting..." : "Submit for Approval"}
                  </button>
                )}

                {canAdminApprove && (
                  <>
                    <button onClick={() => handleAction("APPROVE")} disabled={processingAction !== null} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                      <CheckCircle className="w-4 h-4"/> {processingAction === "APPROVE" ? "Approving..." : "Approve Quotation"}
                    </button>
                    <button onClick={() => handleAction("REQUEST_REVISION")} disabled={processingAction !== null} className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                      <AlertCircle className="w-4 h-4"/> {processingAction === "REQUEST_REVISION" ? "Processing..." : "Request Revision"}
                    </button>
                    <button onClick={() => handleAction("REJECT")} disabled={processingAction !== null} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                      <X className="w-4 h-4"/> {processingAction === "REJECT" ? "Rejecting..." : "Reject Quotation"}
                    </button>
                  </>
                )}

                {(quotation.status === "APPROVED" || quotation.status === "SENT" || quotation.status === "ACCEPTED") && (
                  <button onClick={() => setShowConfirmModal(true)} className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-500/20">
                    <Upload className="w-4 h-4"/> Mark as Confirmed
                  </button>
                )}

                {quotation.status !== "DRAFT" && (
                  <button onClick={handleDuplicateVersion} disabled={processingAction === "DUPLICATE"} className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-medium transition-colors border border-slate-200 disabled:opacity-50 mt-4">
                    <History className="w-4 h-4"/> {processingAction === "DUPLICATE" ? "Duplicating..." : "Revise (New Version)"}
                  </button>
                )}

                {quotation.status === "CONFIRMED" && (
                  <button onClick={handleCreateBooking} disabled={creatingBooking} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-md shadow-green-500/20 mt-4">
                    <CheckCircle className="w-4 h-4"/> {creatingBooking ? "Creating Booking..." : "Create Booking"}
                  </button>
                )}

              </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs text-slate-500">Version Context</h4>
              <div className="space-y-4">
                <div className="p-4 border-2 border-orange-500 rounded-xl bg-orange-50 relative shadow-sm">
                  <span className="absolute -top-2.5 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">VIEWING</span>
                  <div className="font-bold text-slate-900 text-sm">Version {quotation.version}</div>
                  <div className="text-xs text-slate-500 mb-2">{format(new Date(quotation.createdAt),"dd MMM yyyy HH:mm")}</div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-orange-200/50 mt-2">
                    <span className="font-semibold text-slate-800">Rs. {calculatedFinalSelling.toLocaleString("en-IN")}</span>
                    <span className="font-bold text-orange-600 text-[10px] uppercase tracking-wider">{quotation.status}</span>
                  </div>
                </div>
                {quotation.version > 1 && (
                  <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-not-allowed opacity-75">
                    <div className="font-bold text-slate-600 text-sm flex items-center justify-between">
                      <span>Version {quotation.version-1}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase">Historical</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Hidden Print Section - CUSTOMER FACING ONLY */}
        <div className="hidden print:block p-8 bg-white text-black min-h-screen font-sans">
          
          <div className="flex justify-between items-end border-b-2 border-orange-500 pb-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-orange-500 tracking-tight">WanderKashmir</h1>
              <p className="text-sm text-slate-600 mt-1 font-medium">Srinagar, Jammu &amp; Kashmir</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p className="font-bold text-slate-900 text-base">Ref: WK-Q-{quotation.id.substring(0,6).toUpperCase()}</p>
              <p>Date: {format(new Date(quotation.createdAt), "dd MMM yyyy")}</p>
              <p>Valid Until: {quotation.validUntil ? format(new Date(quotation.validUntil), "dd MMM yyyy") : "TBD"}</p>
            </div>
          </div>
          
          {itinerary.length > 0 && (
            <div className="mb-10 page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 border-b border-slate-200 pb-2">Day-wise Itinerary</h2>
              <div className="space-y-6">
                {itinerary.map((day: any) => (
                  <div key={day.dayNumber} className="flex gap-4">
                    <div className="shrink-0 w-16 pt-1">
                      <div className="text-orange-500 font-bold text-sm tracking-wider">DAY {day.dayNumber}</div>
                    </div>
                    <div className="flex-1 pb-4 border-b border-slate-100 last:border-b-0">
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{day.title}</h3>
                      {day.destination && <div className="text-sm font-medium text-slate-500 mb-2">{day.destination}</div>}
                      <p className="text-sm text-slate-700 leading-relaxed mb-2">{day.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs mt-2">
                        {day.activities && (
                          <div className="bg-slate-50 px-3 py-1.5 rounded-full text-slate-600 border border-slate-100 flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">Activities:</span> {day.activities}
                          </div>
                        )}
                        {day.overnight && (
                          <div className="bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 border border-blue-100 flex items-center gap-1.5">
                            <span className="font-semibold text-blue-900">Overnight:</span> {day.overnight}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10 page-break-inside-avoid">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-b border-slate-200 pb-2">Services &amp; Inclusions</h2>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="p-3 border border-slate-200 font-bold w-1/4">Category</th>
                  <th className="p-3 border border-slate-200 font-bold">Description</th>
                  <th className="p-3 border border-slate-200 font-bold w-32 text-center">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-3 border border-slate-200 font-medium">{item.category}</td>
                    <td className="p-3 border border-slate-200">{item.description}</td>
                    <td className="p-3 border border-slate-200 text-center">{item.quantity} {item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mb-12 page-break-inside-avoid">
            <div className="w-80">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {displayRetailPrice && (
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Actual Price (Retail)</span>
                    <span className="text-lg font-bold text-slate-500 line-through decoration-slate-400">Rs. {displayRetailPrice.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="bg-slate-900 text-white p-5 flex flex-col">
                  <span className="text-sm font-medium text-slate-300 mb-1 uppercase tracking-wider">Offer Price (B2B)</span>
                  <span className="text-3xl font-bold">Rs. {calculatedFinalSelling.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
          
          {terms && (
             <div className="mb-6 page-break-inside-avoid">
               <h3 className="text-lg font-bold mb-3 text-slate-900 border-b border-slate-200 pb-2">Terms, Conditions &amp; Exclusions</h3>
               <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-100">{terms}</div>
             </div>
          )}
          
          <div className="mt-16 text-center text-sm text-slate-500 border-t border-slate-200 pt-8">
            <p className="font-medium text-slate-700 mb-1">Thank you for choosing WanderKashmir.</p>
            <p>For any queries, please contact your travel advisor.</p>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:hidden">
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

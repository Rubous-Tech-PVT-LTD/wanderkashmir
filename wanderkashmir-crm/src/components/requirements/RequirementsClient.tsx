"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, FileText, ChevronRight, X } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export type RequirementListItem = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  travelDate: Date | null;
  returnDate: Date | null;
  adults: number;
  children: number;
  destinations: string[];
  status: string;
  createdAt: Date;
  cabRequired: boolean;
  cabType: string | null;
  hotelCategory: string | null;
  sightseeingRequired: boolean;
  houseboatRequired: boolean;
  houseboatNights: number | null;
  specialRequirements: string | null;
  notes: string | null;
  rooms: number;
  customerBudget: number | null;
  currency: string | null;
  partner: {
    companyName: string | null;
    assignedBaId: string | null;
  } | null;
};

export default function RequirementsClient({ requirements }: { requirements: RequirementListItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<RequirementListItem | null>(null);

  const filtered = requirements.filter(r =>
    r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreated = () => {
    setIsCreateModalOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CRM Requirements</h2>
          <p className="text-slate-500">Manage and track customer travel requirements.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-5 h-5" /> Create Requirement
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search requirements..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 font-medium">Req ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Partner / BA</th>
                <th className="px-6 py-4 font-medium">Travel Dates</th>
                <th className="px-6 py-4 font-medium">Pax &amp; Dest</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No requirements found.</td></tr>
              ) : filtered.map(req => (
                <React.Fragment key={req.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors hidden md:table-row">
                    <td className="px-6 py-4 font-medium text-slate-900">WK-R-{req.id.substring(0,6).toUpperCase()}<div className="text-slate-400 text-xs mt-1">{format(new Date(req.createdAt), "MMM d, yyyy")}</div></td>
                    <td className="px-6 py-4"><div className="font-medium text-slate-900">{req.customerName}</div><div className="text-slate-500 text-xs">{req.customerPhone || req.customerEmail || "No contact"}</div></td>
                    <td className="px-6 py-4"><div className="font-medium text-slate-900">{req.partner?.companyName || "N/A"}</div><div className="text-slate-500 text-xs">BA: {req.partner?.assignedBaId || "Unassigned"}</div></td>
                    <td className="px-6 py-4 text-slate-600">{req.travelDate ? format(new Date(req.travelDate), "dd MMM yyyy") : "TBD"}<div className="text-xs text-slate-400">to {req.returnDate ? format(new Date(req.returnDate), "dd MMM yyyy") : "TBD"}</div></td>
                    <td className="px-6 py-4"><div className="text-slate-700">{req.adults}A, {req.children}C</div><div className="text-xs text-slate-500 truncate max-w-[120px]">{req.destinations?.join(", ")}</div></td>
                    <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{req.status}</span></td>
                    <td className="px-6 py-4"><button onClick={() => setSelectedReq(req)} className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1">View <ChevronRight className="w-4 h-4" /></button></td>
                  </tr>
                  <tr className="md:hidden">
                    <td colSpan={7} className="p-0">
                      <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                        <div className="flex justify-between items-start">
                          <div><div className="text-xs text-slate-400 font-medium">WK-R-{req.id.substring(0,6).toUpperCase()}</div><h3 className="font-semibold text-slate-900 text-lg mt-0.5">{req.customerName}</h3></div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{req.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="flex flex-col"><span className="text-xs text-slate-400 uppercase tracking-wider">Travel Date</span><span className="font-medium">{req.travelDate ? format(new Date(req.travelDate), "dd MMM") : "TBD"}</span></div>
                          <div className="flex flex-col"><span className="text-xs text-slate-400 uppercase tracking-wider">Pax</span><span className="font-medium">{req.adults}A, {req.children}C</span></div>
                        </div>
                        <div className="text-sm text-slate-600"><span className="text-xs text-slate-400 uppercase tracking-wider block">Destinations</span><span className="font-medium">{req.destinations?.join(", ") || "None"}</span></div>
                        <div className="pt-3 border-t border-slate-100"><button onClick={() => setSelectedReq(req)} className="w-full flex items-center justify-center gap-1 py-2.5 bg-orange-50 text-orange-600 rounded-lg font-medium active:bg-orange-100 transition-colors">View Requirement <ChevronRight className="w-4 h-4" /></button></div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedReq && <RequirementDetailModal requirement={selectedReq} onClose={() => setSelectedReq(null)} />}
      {isCreateModalOpen && <CreateRequirementModal onClose={() => setIsCreateModalOpen(false)} onCreated={handleCreated} />}
    </div>
  );
}

function RequirementDetailModal({ requirement, onClose }: { requirement: RequirementListItem; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("details");
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const router = useRouter();

  const handleQuotation = async () => {
    setLoadingQuotation(true);
    try {
      const res = await fetch(`/api/quotations?requirementId=${requirement.id}`);
      const data = await res.json();
      if (data && data.length > 0) {
        router.push(`/dashboard/quotations?reqId=${requirement.id}`);
      } else {
        const createRes = await fetch("/api/quotations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirementId: requirement.id }),
        });
        if (createRes.ok) {
          router.push(`/dashboard/quotations?reqId=${requirement.id}`);
        } else {
          const err = await createRes.json();
          alert("Failed to create quotation: " + (err.error || "Unknown error"));
        }
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setLoadingQuotation(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">Requirement: WK-R-{requirement.id.substring(0,6).toUpperCase()}<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{requirement.status}</span></h3>
            <p className="text-slate-500 text-sm mt-1">Customer: {requirement.customerName} &bull; Phone: {requirement.customerPhone}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="flex border-b border-slate-100 px-6 bg-slate-50">
          <button onClick={() => setActiveTab("details")} className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab==="details"?"border-orange-500 text-orange-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>Details &amp; Specs</button>
          <button onClick={() => setActiveTab("timeline")} className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab==="timeline"?"border-orange-500 text-orange-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>Quotations &amp; Timeline</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {activeTab==="details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div><h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Travel Info</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500">Travel Dates:</span><span className="font-medium">{requirement.travelDate?format(new Date(requirement.travelDate),"dd MMM yyyy"):"TBD"} - {requirement.returnDate?format(new Date(requirement.returnDate),"dd MMM yyyy"):"TBD"}</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500">Pax:</span><span className="font-medium">{requirement.adults} Adults, {requirement.children} Children</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500">Rooms:</span><span className="font-medium">{requirement.rooms}</span></div>
                  </div>
                </div>
                <div><h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Service Needs</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {requirement.cabRequired&&<span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">Cab: {requirement.cabType||"Any"}</span>}
                    {requirement.hotelCategory&&<span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">{requirement.hotelCategory} Hotels</span>}
                    {requirement.sightseeingRequired&&<span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">Sightseeing</span>}
                    {requirement.houseboatRequired&&<span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-200">Houseboat: {requirement.houseboatNights}N</span>}
                  </div>
                  {requirement.specialRequirements&&<div className="bg-slate-50 p-3 rounded-lg border border-slate-100"><span className="text-xs font-semibold text-slate-500 block mb-1">Special Requirements:</span><p className="text-sm text-slate-700">{requirement.specialRequirements}</p></div>}
                  {requirement.notes&&<div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2"><span className="text-xs font-semibold text-slate-500 block mb-1">Notes:</span><p className="text-sm text-slate-700">{requirement.notes}</p></div>}
                </div>
              </div>
              <div className="space-y-6">
                <div><h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Budget &amp; Destinations</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500">Budget:</span><span className="font-medium">{requirement.customerBudget?`${requirement.customerBudget} ${requirement.currency||"INR"}`:"Not Specified"}</span></div>
                    <div className="flex flex-col border-b border-slate-50 pb-2"><span className="text-slate-500 mb-1">Destinations:</span><span className="font-medium">{requirement.destinations?.join(", ")||"None selected"}</span></div>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100"><button onClick={handleQuotation} disabled={loadingQuotation} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50">{loadingQuotation ? "Processing..." : "Create/View Quotation"}</button></div>
              </div>
            </div>
          )}
          {activeTab==="timeline"&&(<div className="text-center py-12 text-slate-500"><FileText className="w-12 h-12 mx-auto text-slate-300 mb-3"/><p>Quotations workflow will appear here.</p></div>)}
        </div>
      </div>
    </div>
  );
}

function CreateRequirementModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const DESTINATIONS_LIST = ["Srinagar","Gulmarg","Pahalgam","Sonamarg","Doodhpathri","Other"];
  const [formData, setFormData] = useState({ partnerId:"",customerName:"",customerPhone:"",customerEmail:"",travelDate:"",returnDate:"",adults:2,children:0,rooms:1,destinations:[] as string[],hotelCategory:"",mealPlan:"",preferredHotel:"",cabRequired:true,cabType:"",pickupLocation:"",dropLocation:"",sightseeingRequired:true,houseboatRequired:false,houseboatCategory:"",houseboatNights:0,customerBudget:"",currency:"INR",specialRequirements:"",notes:"" });
  useEffect(()=>{fetch("/api/partners").then(r=>r.json()).then(d=>{if(Array.isArray(d))setPartners(d);}).catch(console.error);},[]);
  const handleDestToggle=(dest:string)=>setFormData(p=>({...p,destinations:p.destinations.includes(dest)?p.destinations.filter(d=>d!==dest):[...p.destinations,dest]}));
  const handleSubmit=async()=>{
    if(!formData.partnerId)return alert("Please select a partner.");
    if(!formData.customerName)return alert("Please enter customer name.");
    if(!formData.travelDate||!formData.returnDate)return alert("Please select travel dates.");
    if(new Date(formData.returnDate)<new Date(formData.travelDate))return alert("End Date cannot be before Start Date.");
    if(formData.adults<1)return alert("At least 1 adult is required.");
    if(formData.rooms<1)return alert("At least 1 room is required.");
    setLoading(true);
    try{
      const payload={...formData,customerBudget:formData.customerBudget?parseFloat(formData.customerBudget):null};
      const res=await fetch("/api/requirements",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(res.ok){onCreated();}else{const e=await res.json();alert("Failed to create: "+(e.error||"Unknown error"));}
    }catch(e){console.error(e);alert("An error occurred");}finally{setLoading(false);}
  };
  const f=formData;
  const set=(k:keyof typeof formData,v:any)=>setFormData(p=>({...p,[k]:v}));
  return(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
          <h3 className="text-xl font-bold text-slate-900">New Requirement</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500"/></button>
        </div>
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          <section><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Partner</h4>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Partner *</label>
            <select value={f.partnerId} onChange={e=>set("partnerId",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl bg-white text-[16px] md:text-sm">
              <option value="">Search and select partner...</option>
              {partners.map(p=><option key={p.id} value={p.id}>{p.companyName} ({p.contactPerson}) - {p.phone}</option>)}
            </select>
          </section>
          <section><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Customer Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label><input type="text" value={f.customerName} onChange={e=>set("customerName",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm" placeholder="Name"/></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Customer Phone</label><input type="text" value={f.customerPhone} onChange={e=>set("customerPhone",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm" placeholder="Phone"/></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Customer Email</label><input type="email" value={f.customerEmail} onChange={e=>set("customerEmail",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm" placeholder="Email"/></div>
            </div>
          </section>
          <section><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Travel &amp; Pax</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label><input type="date" value={f.travelDate} onChange={e=>set("travelDate",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"/></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label><input type="date" value={f.returnDate} onChange={e=>set("returnDate",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"/></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Adults *</label><input type="number" min="1" value={f.adults} onChange={e=>set("adults",parseInt(e.target.value)||1)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"/></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Children</label><input type="number" min="0" value={f.children} onChange={e=>set("children",parseInt(e.target.value)||0)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"/></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Rooms *</label><input type="number" min="1" value={f.rooms} onChange={e=>set("rooms",parseInt(e.target.value)||1)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"/></div>
            </div>
          </section>
          <section><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Destinations</h4>
            <div className="flex flex-wrap gap-3">{DESTINATIONS_LIST.map(d=><label key={d} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"><input type="checkbox" checked={f.destinations.includes(d)} onChange={()=>handleDestToggle(d)} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"/><span className="text-sm font-medium text-slate-700">{d}</span></label>)}</div>
          </section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Hotel</h4>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Hotel Category</label><select value={f.hotelCategory} onChange={e=>set("hotelCategory",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"><option value="">Select Category</option><option value="3 Star">3 Star</option><option value="4 Star">4 Star</option><option value="5 Star">5 Star</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Meal Plan</label><select value={f.mealPlan} onChange={e=>set("mealPlan",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"><option value="">Select Meal Plan</option><option value="CP">CP (Breakfast only)</option><option value="MAP">MAP (Breakfast &amp; Dinner)</option><option value="AP">AP (All meals)</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Preferred Hotel</label><input type="text" value={f.preferredHotel} onChange={e=>set("preferredHotel",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm" placeholder="e.g. Radisson Srinagar"/></div>
              </div>
            </section>
            <section><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Transport &amp; Sightseeing</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl"><span className="text-sm font-medium text-slate-700">Cab Required</span><input type="checkbox" checked={f.cabRequired} onChange={e=>set("cabRequired",e.target.checked)} className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"/></div>
                {f.cabRequired&&<div><label className="block text-sm font-medium text-slate-700 mb-1">Cab Type</label><select value={f.cabType} onChange={e=>set("cabType",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"><option value="">Any</option><option value="Sedan">Sedan</option><option value="SUV (Innova)">SUV (Innova)</option><option value="Tempo Traveller">Tempo Traveller</option></select></div>}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Pickup Location</label><input type="text" value={f.pickupLocation} onChange={e=>set("pickupLocation",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"/></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Drop Location</label><input type="text" value={f.dropLocation} onChange={e=>set("dropLocation",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"/></div>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl mt-4"><span className="text-sm font-medium text-slate-700">Sightseeing Required</span><input type="checkbox" checked={f.sightseeingRequired} onChange={e=>set("sightseeingRequired",e.target.checked)} className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"/></div>
              </div>
            </section>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Houseboat</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl"><span className="text-sm font-medium text-slate-700">Houseboat Required</span><input type="checkbox" checked={f.houseboatRequired} onChange={e=>set("houseboatRequired",e.target.checked)} className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"/></div>
                {f.houseboatRequired&&<div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select value={f.houseboatCategory} onChange={e=>set("houseboatCategory",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"><option value="">Select Category</option><option value="Deluxe">Deluxe</option><option value="Premium">Premium</option><option value="Luxury">Luxury</option></select></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Nights</label><input type="number" min="0" value={f.houseboatNights} onChange={e=>set("houseboatNights",parseInt(e.target.value)||0)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"/></div></div>}
              </div>
            </section>
            <section><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Budget</h4>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Customer Budget</label><input type="number" value={f.customerBudget} onChange={e=>set("customerBudget",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm" placeholder="Amount"/></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Currency</label><select value={f.currency} onChange={e=>set("currency",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm"><option value="INR">INR</option><option value="USD">USD</option><option value="AED">AED</option><option value="EUR">EUR</option></select></div>
              </div>
            </section>
          </div>
          <section><h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-t pt-6 border-slate-100">Additional Requirements</h4>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Special Requirements / Sightseeing Details</label><textarea rows={3} value={f.specialRequirements} onChange={e=>set("specialRequirements",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm" placeholder="Any specific requests..."/></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes (Internal)</label><textarea rows={2} value={f.notes} onChange={e=>set("notes",e.target.value)} className="w-full p-3 md:p-2.5 border border-slate-200 rounded-xl text-[16px] md:text-sm" placeholder="BA notes..."/></div>
            </div>
          </section>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-40 md:relative md:bg-slate-50 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
          <button disabled={loading} onClick={handleSubmit} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-medium disabled:opacity-50 transition-colors shadow-sm">{loading?"Submitting...":"Create Requirement"}</button>
        </div>
      </div>
    </div>
  );
}

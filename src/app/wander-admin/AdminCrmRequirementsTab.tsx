"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, UserPlus, FileEdit, CheckCircle, ChevronRight, X, User } from "lucide-react";
import { format } from "date-fns";

export default function AdminCrmRequirementsTab() {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/requirements");
      if (res.ok) {
        const data = await res.json();
        setRequirements(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = requirements.filter(r => 
    r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CRM Requirements</h2>
          <p className="text-slate-500">Manage and track customer travel requirements.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" /> Create Requirement
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search requirements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Req ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Partner / BA</th>
                <th className="px-6 py-4 font-medium">Travel Dates</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading requirements...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No requirements found.</td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      WK-R-{req.id.substring(0,6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{req.customerName}</div>
                      <div className="text-slate-500 text-xs">{req.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{req.partner?.businessName || "N/A"}</div>
                      <div className="text-slate-500 text-xs">BA: {req.partner?.assignedBaId || "Unassigned"}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {req.travelDate ? format(new Date(req.travelDate), "dd MMM yyyy") : "TBD"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedReq(req)}
                        className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1"
                      >
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReq && (
        <RequirementDetailModal 
          requirement={selectedReq} 
          onClose={() => setSelectedReq(null)}
          onUpdate={fetchRequirements}
        />
      )}
      
      {isCreateModalOpen && (
        <CreateRequirementModal 
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            fetchRequirements();
          }}
        />
      )}
    </div>
  );
}

function RequirementDetailModal({ requirement, onClose, onUpdate }: any) {
  const [activeTab, setActiveTab] = useState("details");
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Requirement: WK-R-{requirement.id.substring(0,6).toUpperCase()}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {requirement.status}
              </span>
            </h3>
            <p className="text-slate-500 text-sm mt-1">Customer: {requirement.customerName} • Phone: {requirement.customerPhone}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="flex border-b border-slate-100 px-6 bg-slate-50">
          <button onClick={() => setActiveTab("details")} className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Details & Specs</button>
          <button onClick={() => setActiveTab("timeline")} className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Quotations & Timeline</button>
          <button onClick={() => setActiveTab("assignment")} className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'assignment' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Operations Assignment</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {activeTab === "details" && (
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Travel Info</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Travel Dates:</span>
                      <span className="font-medium">{requirement.travelDate ? format(new Date(requirement.travelDate), "dd MMM yyyy") : "TBD"} - {requirement.returnDate ? format(new Date(requirement.returnDate), "dd MMM yyyy") : "TBD"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Pax:</span>
                      <span className="font-medium">{requirement.adults} Adults, {requirement.children} Children</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Rooms:</span>
                      <span className="font-medium">{requirement.rooms}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Service Needs</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {requirement.cabRequired && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">Cab Required</span>}
                    {requirement.hotelCategory && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">{requirement.hotelCategory} Hotels</span>}
                    {requirement.sightseeingRequired && <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">Sightseeing</span>}
                    {requirement.houseboatRequired && <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-200">Houseboat</span>}
                  </div>
                  {requirement.specialRequirements && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 block mb-1">Special Requirements:</span>
                      <p className="text-sm text-slate-700">{requirement.specialRequirements}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                 <div>
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Logistics</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Pickup:</span>
                      <span className="font-medium">{requirement.pickupLocation || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Drop:</span>
                      <span className="font-medium">{requirement.dropLocation || "N/A"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition-colors">
                    Create Quotation
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No quotations created yet.</p>
              <button className="mt-4 text-orange-500 font-medium hover:underline">Generate First Quotation</button>
            </div>
          )}

          {activeTab === "assignment" && (
            <div className="max-w-md mx-auto py-8">
              <h4 className="font-medium text-slate-900 mb-4">Assign Operations Manager</h4>
              <select className="w-full p-3 border border-slate-200 rounded-xl mb-4 bg-white">
                <option value="">Select Ops User...</option>
                <option value="ops-1">John (Operations)</option>
                <option value="ops-2">Sarah (Operations)</option>
              </select>
              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium">Assign Requirement</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateRequirementModal({ onClose, onCreated }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    partnerId: "", // We need a partner ID
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const handleSubmit = async () => {
    if (!formData.customerName || !formData.customerPhone) {
      alert("Please fill in the customer name and phone.");
      return;
    }
    
    // For testing, if no partnerId is provided, we can either throw error or use a fallback
    // Since this is just for testing the UI, let's just send what we have.
    // However, the schema requires partnerId. We should let them type it or select.
    // For now, let's let them type the partner ID or default to "TEST_PARTNER_123" if they don't know it.
    
    setLoading(true);
    try {
      const res = await fetch("/api/crm/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          partnerId: formData.partnerId || "test-partner-id", // fallback for testing
          cabRequired: true,
          sightseeingRequired: true,
          houseboatRequired: false
        }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const error = await res.json();
        alert("Failed to create: " + (error.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">New Requirement</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <input type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl" placeholder="Enter name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Phone</label>
              <input type="text" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl" placeholder="Enter phone" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adults</label>
              <input type="number" min="1" value={formData.adults} onChange={e => setFormData({...formData, adults: parseInt(e.target.value)})} className="w-full p-2.5 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rooms</label>
              <input type="number" min="1" value={formData.rooms} onChange={e => setFormData({...formData, rooms: parseInt(e.target.value)})} className="w-full p-2.5 border border-slate-200 rounded-xl" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Partner ID (Optional for testing)</label>
              <input type="text" value={formData.partnerId} onChange={e => setFormData({...formData, partnerId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl" placeholder="Leave empty for test-partner-id" />
            </div>
          </div>
          <button disabled={loading} onClick={handleSubmit} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium mt-4 disabled:opacity-50 transition-colors">
            {loading ? "Submitting..." : "Submit Requirement"}
          </button>
        </div>
      </div>
    </div>
  );
}

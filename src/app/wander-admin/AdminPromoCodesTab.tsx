"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle, Check, X } from "lucide-react";
import { 
  getPromoCodes, 
  createPromoCode, 
  togglePromoCodeStatus, 
  approvePromoCode,
  deletePromoCode, 
  getToursForPromo 
} from "@/actions/promo-codes";
import toast from "react-hot-toast";

export default function AdminPromoCodesTab() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [targetType, setTargetType] = useState("GLOBAL");
  const [targetId, setTargetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [promoRes, targetsRes] = await Promise.all([
      getPromoCodes(),
      getToursForPromo()
    ]);

    if (promoRes.success) setPromoCodes(promoRes.data || []);
    if (targetsRes.success) {
      setTours(targetsRes.tours || []);
      setProperties(targetsRes.properties || []);
      setVehicles(targetsRes.vehicles || []);
      setGuides(targetsRes.guides || []);
    }
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountPercent) {
      toast.error("Code and discount are required");
      return;
    }

    let targets = {};
    if (targetType === "TOUR" && targetId) targets = { tourId: targetId };
    if (targetType === "PROPERTY" && targetId) targets = { propertyId: targetId };
    if (targetType === "VEHICLE" && targetId) targets = { vehicleId: targetId };
    if (targetType === "GUIDE" && targetId) targets = { guideProfileId: targetId };

    setIsSubmitting(true);
    const res = await createPromoCode(code.toUpperCase(), parseFloat(discountPercent), targets, null, true);
    if (res.success) {
      toast.success("Promo code created");
      setCode("");
      setDiscountPercent("");
      setTargetType("GLOBAL");
      setTargetId("");
      fetchData();
    } else {
      toast.error(res.error || "Failed to create promo code");
    }
    setIsSubmitting(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await togglePromoCodeStatus(id, !currentStatus);
    if (res.success) {
      toast.success("Status updated");
      fetchData();
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleApprove = async (id: string, isApproved: boolean) => {
    const res = await approvePromoCode(id, isApproved);
    if (res.success) {
      toast.success(isApproved ? "Promo code approved" : "Promo code rejected");
      fetchData();
    } else {
      toast.error("Failed to update approval status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    
    const res = await deletePromoCode(id);
    if (res.success) {
      toast.success("Promo code deleted");
      fetchData();
    } else {
      toast.error("Failed to delete promo code");
    }
  };

  const getTargetLabel = (promo: any) => {
    if (promo.tour) return `Tour: ${promo.tour.title}`;
    if (promo.property) return `Property: ${promo.property.name}`;
    if (promo.vehicle) return `Vehicle: ${promo.vehicle.make} ${promo.vehicle.model}`;
    if (promo.guideProfile) return `Guide: ${promo.guideProfile.vendorProfile?.user?.name || 'Unknown'}`;
    return "Global (All Services)";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Create Promo Code</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Code</label>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WANDER20"
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Discount %</label>
            <input 
              type="number" 
              value={discountPercent} 
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="e.g. 10"
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Target Type</label>
            <select 
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                setTargetId("");
              }}
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="GLOBAL">Global (All Services)</option>
              <option value="TOUR">Tours</option>
              <option value="PROPERTY">Hotels / Homestays</option>
              <option value="VEHICLE">Taxis</option>
              <option value="GUIDE">Guides</option>
            </select>
          </div>
          {targetType !== "GLOBAL" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Target Item</label>
              <select 
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white shadow-sm ring-2 ring-orange-100"
              >
                <option value="">
                  {targetType === "TOUR" && "Select a specific Tour Package"}
                  {targetType === "PROPERTY" && "Select a specific Hotel/Homestay"}
                  {targetType === "VEHICLE" && "Select a specific Taxi"}
                  {targetType === "GUIDE" && "Select a specific Guide"}
                </option>
                {targetType === "TOUR" && tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                {targetType === "PROPERTY" && properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                {targetType === "VEHICLE" && vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
                {targetType === "GUIDE" && guides.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-orange-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Manage Promo Codes</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading promo codes...</div>
        ) : promoCodes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No promo codes created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Discount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Target</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Vendor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Active</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">{promo.code}</td>
                    <td className="px-6 py-4 text-slate-700">{promo.discountPercent}%</td>
                    <td className="px-6 py-4 text-slate-700">{getTargetLabel(promo)}</td>
                    <td className="px-6 py-4 text-slate-700">{promo.vendorProfile?.businessName || "Admin"}</td>
                    <td className="px-6 py-4">
                      {promo.status === "PENDING" ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">PENDING</span>
                      ) : promo.status === "REJECTED" ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">REJECTED</span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">APPROVED</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggle(promo.id, promo.isActive)}
                        disabled={promo.status !== "APPROVED"}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${promo.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} disabled:opacity-50`}
                      >
                        {promo.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {promo.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {promo.status === "PENDING" && (
                        <>
                          <button 
                            onClick={() => handleApprove(promo.id, true)}
                            className="text-emerald-600 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-50 transition-colors mr-1"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleApprove(promo.id, false)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors mr-2"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Plus, Tag, CheckCircle, Clock } from "lucide-react";
import { getVendorPromoCodes, createPromoCode } from "@/actions/promo-codes";
import toast from "react-hot-toast";

interface VendorPromoCodesTabProps {
  vendorProfileId: string;
  vendorType: string;
  properties: any[];
  vehicles: any[];
  guideProfile: any;
}

export default function VendorPromoCodesTab({ 
  vendorProfileId, 
  vendorType, 
  properties, 
  vehicles, 
  guideProfile 
}: VendorPromoCodesTabProps) {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [targetId, setTargetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [vendorProfileId]);

  const fetchData = async () => {
    setIsLoading(true);
    const res = await getVendorPromoCodes(vendorProfileId);
    if (res.success) setPromoCodes(res.data || []);
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountPercent || !targetId) {
      toast.error("Code, discount, and target service are required");
      return;
    }

    let targets = {};
    if (vendorType === "HOTEL" || vendorType === "HOMESTAY") targets = { propertyId: targetId };
    if (vendorType === "TAXI") targets = { vehicleId: targetId };
    if (vendorType === "GUIDE") targets = { guideProfileId: targetId };

    setIsSubmitting(true);
    const res = await createPromoCode(
      code.toUpperCase(), 
      parseFloat(discountPercent), 
      targets, 
      vendorProfileId,
      false // isAdmin = false
    );
    
    if (res.success) {
      toast.success("Promo code requested successfully");
      setCode("");
      setDiscountPercent("");
      setTargetId("");
      fetchData();
    } else {
      toast.error(res.error || "Failed to request promo code");
    }
    setIsSubmitting(false);
  };

  const getTargetLabel = (promo: any) => {
    if (promo.property) return `Property: ${promo.property.name}`;
    if (promo.vehicle) return `Vehicle: ${promo.vehicle.make} ${promo.vehicle.model}`;
    if (promo.guideProfile) return `Guide Services`;
    return "Unknown Service";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-500" />
          Request a Promo Code
        </h2>
        <p className="text-sm text-slate-500 mb-6">Create promotional offers to attract more bookings. Promo codes require admin approval before they go live.</p>
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Promo Code</label>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER10"
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Discount %</label>
            <input 
              type="number" 
              value={discountPercent} 
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="e.g. 10"
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Target Service</label>
            <select 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="">Select an item</option>
              {(vendorType === "HOTEL" || vendorType === "HOMESTAY") && properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              {vendorType === "TAXI" && vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registrationNum})</option>
              ))}
              {vendorType === "GUIDE" && guideProfile && (
                <option value={guideProfile.id}>My Guide Profile</option>
              )}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">My Promo Codes</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading promo codes...</div>
        ) : promoCodes.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No promo codes requested yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Code</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Discount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Target Service</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Live</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">{promo.code}</td>
                    <td className="px-6 py-4 text-slate-700">{promo.discountPercent}%</td>
                    <td className="px-6 py-4 text-slate-700">{getTargetLabel(promo)}</td>
                    <td className="px-6 py-4">
                      {promo.status === "PENDING" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold w-max">
                          <Clock className="w-3.5 h-3.5" /> Pending Approval
                        </span>
                      ) : promo.status === "REJECTED" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold w-max">
                          Rejected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold w-max">
                          <CheckCircle className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {promo.isActive ? (
                        <span className="text-emerald-600 font-bold text-sm">Yes</span>
                      ) : (
                        <span className="text-slate-400 text-sm">No</span>
                      )}
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

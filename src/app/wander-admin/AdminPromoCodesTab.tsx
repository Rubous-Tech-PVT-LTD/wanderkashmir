"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { 
  getPromoCodes, 
  createPromoCode, 
  togglePromoCodeStatus, 
  deletePromoCode, 
  getToursForPromo 
} from "@/actions/promo-codes";
import toast from "react-hot-toast";

export default function AdminPromoCodesTab() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [tourId, setTourId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [promoRes, toursRes] = await Promise.all([
      getPromoCodes(),
      getToursForPromo()
    ]);

    if (promoRes.success) setPromoCodes(promoRes.data || []);
    if (toursRes.success) setTours(toursRes.data || []);
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountPercent) {
      toast.error("Code and discount are required");
      return;
    }

    setIsSubmitting(true);
    const res = await createPromoCode(code.toUpperCase(), parseFloat(discountPercent), tourId || null);
    if (res.success) {
      toast.success("Promo code created");
      setCode("");
      setDiscountPercent("");
      setTourId("");
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Create Promo Code</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
            <label className="block text-sm font-bold text-slate-700 mb-1">Target Tour (Optional)</label>
            <select 
              value={tourId}
              onChange={(e) => setTourId(e.target.value)}
              className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">Applies to All Tours</option>
              {tours.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Target Tour</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">{promo.code}</td>
                    <td className="px-6 py-4 text-slate-700">{promo.discountPercent}%</td>
                    <td className="px-6 py-4 text-slate-700">{promo.tour ? promo.tour.title : "All Tours"}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggle(promo.id, promo.isActive)}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${promo.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {promo.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {promo.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
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

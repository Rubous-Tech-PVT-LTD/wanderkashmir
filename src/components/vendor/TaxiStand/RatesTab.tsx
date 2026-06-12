"use client";

import { useState } from "react";
import { Plus, IndianRupee, Save, MapPin } from "lucide-react";
import { addRateOverride } from "@/actions/taxiStand";
import toast from "react-hot-toast";

export default function RatesTab({ rateOverrides }: { rateOverrides: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [routePlace, setRoutePlace] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await addRateOverride({ routePlace, customPrice: Number(customPrice) });
    setLoading(false);
    
    if (res.success) {
      toast.success("Rate override added successfully!");
      setIsAdding(false);
      setRoutePlace("");
      setCustomPrice("");
    } else {
      toast.error(res.error || "Failed to add rate");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Custom Rate Overrides</h3>
          <p className="text-sm text-slate-500">Set specific rates for standard routes/places</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Rate
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900">New Custom Rate</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Route / Place Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={routePlace}
                  onChange={(e) => setRoutePlace(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., Srinagar Airport to Gulmarg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Custom Price (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="2500"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : "Save Rate"}
            </button>
          </div>
        </form>
      )}

      {rateOverrides.length === 0 && !isAdding ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <IndianRupee className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Custom Rates</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Set custom prices for specific routes to override the standard rates.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-8 py-4 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
          >
            Add First Rate
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-600 text-sm">Route / Place</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Custom Price</th>
              </tr>
            </thead>
            <tbody>
              {rateOverrides.map((rate) => (
                <tr key={rate.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{rate.routePlace}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-bold text-emerald-600 flex items-center justify-end">
                      <IndianRupee className="w-4 h-4 mr-1" />
                      {rate.customPrice.toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

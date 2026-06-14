"use client";

import { useState } from "react";
import { Plus, IndianRupee, Save, MapPin } from "lucide-react";
import { addRateOverride } from "@/actions/taxiStand";
import toast from "react-hot-toast";

export default function RatesTab({ 
  rateOverrides = [],
  standardRates = [],
  vehicles = []
}: { 
  rateOverrides?: any[];
  standardRates?: any[];
  vehicles?: any[];
}) {
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
      toast.success("Rate override saved successfully!");
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
            onClick={() => {
              setRoutePlace("");
              setCustomPrice("");
              setIsAdding(true);
            }}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Custom Route
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900">Edit Custom Rate</h4>
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-600 text-sm">Route / Place</th>
              <th className="p-4 font-semibold text-slate-600 text-sm text-right">Standard Price</th>
              <th className="p-4 font-semibold text-slate-600 text-sm text-right">Your Price</th>
              <th className="p-4 font-semibold text-slate-600 text-sm text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {standardRates.map((rate) => {
              const override = rateOverrides.find((ro: any) => ro.routePlace === rate.place);
              const vehicleType = vehicles.length > 0 ? vehicles[0].type : "CRYSTA";
              const standardPrice = rate.rates?.[vehicleType] || 0;
              
              return (
                <tr key={rate.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{rate.place}</div>
                    {rate.duration && <div className="text-xs text-slate-500">{rate.duration}</div>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-slate-600 flex items-center justify-end">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {standardPrice.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {override ? (
                      <div className="font-bold text-emerald-600 flex items-center justify-end">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        {override.customPrice.toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-sm">Standard</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setRoutePlace(rate.place);
                        setCustomPrice(override ? String(override.customPrice) : String(standardPrice));
                        setIsAdding(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-sky-600 hover:text-sky-800 text-sm font-bold"
                    >
                      {override ? "Edit" : "Override"}
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {/* Show any overrides that don't match standard rates */}
            {rateOverrides.filter((ro: any) => !standardRates.find((sr: any) => sr.place === ro.routePlace)).map((override: any) => (
              <tr key={override.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{override.routePlace}</div>
                  <div className="text-xs text-slate-500">Custom Route</div>
                </td>
                <td className="p-4 text-right">
                  <span className="text-slate-400 italic text-sm">N/A</span>
                </td>
                <td className="p-4 text-right">
                  <div className="font-bold text-emerald-600 flex items-center justify-end">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {override.customPrice.toLocaleString()}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => {
                      setRoutePlace(override.routePlace);
                      setCustomPrice(String(override.customPrice));
                      setIsAdding(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-sky-600 hover:text-sky-800 text-sm font-bold"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

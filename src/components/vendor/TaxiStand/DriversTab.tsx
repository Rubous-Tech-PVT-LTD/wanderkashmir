"use client";

import { useState } from "react";
import { Plus, CheckCircle2, User, Phone, Save } from "lucide-react";
import { addDriver } from "@/actions/taxiStand";
import toast from "react-hot-toast";

export default function DriversTab({ drivers }: { drivers: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await addDriver({ name, phone, drivingLicense });
    setLoading(false);
    
    if (res.success) {
      toast.success("Driver added successfully!");
      setIsAdding(false);
      setName("");
      setPhone("");
      setDrivingLicense("");
    } else {
      toast.error(res.error || "Failed to add driver");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Manage Drivers</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900">New Driver Details</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Driving License No.</label>
              <input
                type="text"
                required
                value={drivingLicense}
                onChange={(e) => setDrivingLicense(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="DL-XXXX-XXXXXXX"
              />
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
              {loading ? "Saving..." : "Save Driver"}
            </button>
          </div>
        </form>
      )}

      {drivers.length === 0 && !isAdding ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-sky-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Drivers Added</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Add drivers to your Taxi Stand so you can assign them to bookings.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-8 py-4 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20"
          >
            Add First Driver
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map(driver => (
            <div key={driver.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-lg">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{driver.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Phone className="w-3 h-3" /> {driver.phone}
                  </div>
                </div>
              </div>
              <div className="text-sm border-t border-slate-100 pt-3">
                <span className="text-slate-500">License: </span>
                <span className="font-semibold">{driver.drivingLicense}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${driver.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {driver.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

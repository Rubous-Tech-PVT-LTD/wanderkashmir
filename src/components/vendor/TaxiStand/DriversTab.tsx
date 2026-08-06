"use client";

import { useState } from "react";
import { Plus, CheckCircle2, User, Phone, Save, Edit, Trash2 } from "lucide-react";
import { addDriver, updateDriver, deleteDriver } from "@/actions/taxiStand";
import { useVendor } from "@/context/VendorContext";
import toast from "react-hot-toast";

export default function DriversTab({ drivers }: { drivers: any[] }) {
  const { subscriptionPlan } = useVendor();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [loading, setLoading] = useState(false);

  const hasReachedDriverLimit = subscriptionPlan === "Free" && drivers.length >= 1;

  const handleAddNewClick = () => {
    if (hasReachedDriverLimit) {
      toast.error("You have reached the maximum limit of 1 driver on the Free plan. Please upgrade to add more drivers.", { duration: 5000 });
      return;
    }
    setEditingId(null);
    setName("");
    setPhone("");
    setDrivingLicense("");
    setIsAdding(true);
  };

  const handleEditClick = (driver: any) => {
    setEditingId(driver.id);
    setName(driver.name);
    setPhone(driver.phone);
    setDrivingLicense(driver.drivingLicense);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      const res = await deleteDriver(id);
      if (res.success) {
        toast.success("Driver deleted successfully");
      } else {
        toast.error("Failed to delete driver: " + res.error);
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let res;
    if (editingId) {
      res = await updateDriver(editingId, { name, phone, drivingLicense });
    } else {
      res = await addDriver({ name, phone, drivingLicense });
    }
    setLoading(false);
    
    if (res.success) {
      toast.success(`Driver ${editingId ? 'updated' : 'added'} successfully!`);
      setIsAdding(false);
      setEditingId(null);
      setName("");
      setPhone("");
      setDrivingLicense("");
    } else {
      toast.error(res.error || `Failed to ${editingId ? 'update' : 'add'} driver`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Manage Drivers</h3>
          {hasReachedDriverLimit && !isAdding && (
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded uppercase mt-1 inline-block">Plan Limit Reached</span>
          )}
        </div>
        {!isAdding && (
          <button
            onClick={handleAddNewClick}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-orange-500 transition-colors"
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
                  className="pl-10 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="pl-10 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="px-6 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-500 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? "Saving..." : "Save Driver"}
            </button>
          </div>
        </form>
      )}

      {drivers.length === 0 && !isAdding ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Drivers Added</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            Add drivers to your Taxi Stand so you can assign them to bookings.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20"
          >
            Add First Driver
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map(driver => (
            <div key={driver.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-orange-500 font-bold text-lg">
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
              <div className="mt-3 flex items-center gap-2 text-sm justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${driver.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {driver.status}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick(driver)} className="text-slate-500 hover:text-orange-500 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(driver.id)} className="text-slate-500 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

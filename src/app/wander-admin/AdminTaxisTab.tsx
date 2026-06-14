import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Percent, Car, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const VEHICLE_TYPES = ["CRYSTA", "INNOVA", "ERTIGA", "TAVEERA", "ETIOS GLANZA", "SWIFT DZIRE", "ECCO", "ALTO K10", "SUMO"];

export default function AdminTaxisTab() {
  const [activeSubTab, setActiveSubTab] = useState("rates");
  const [rates, setRates] = useState<any[]>([]);
  const [taxiImages, setTaxiImages] = useState<Record<string, string>>({});
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Form State for Rate Card
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateForm, setRateForm] = useState<any>({ place: "", rates: {} });

  useEffect(() => {
    fetchRates();
    fetchImages();
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/admin/taxis/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (e) {
      console.error("Failed to fetch vehicles", e);
    }
  };

  const handleVehicleAction = async (id: string, action: string, reason?: string) => {
    setIsProcessing(id);
    try {
      const res = await fetch(`/api/admin/taxis/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason })
      });
      if (res.ok) {
        toast.success(`Vehicle ${action.toLowerCase()} successfully`);
        fetchVehicles();
      } else {
        toast.error("Failed to update vehicle");
      }
    } catch (e) {
      toast.error("Error updating vehicle");
    } finally {
      setIsProcessing(null);
    }
  };

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/admin/taxis/images");
      const data = await res.json();
      const map: Record<string, string> = {};
      data.forEach((img: any) => map[img.type] = img.imageUrl);
      setTaxiImages(map);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/admin/taxis");
      const data = await res.json();
      setRates(data);
    } catch (e) {
      toast.error("Failed to load rates");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRate = (rate: any) => {
    setEditingRateId(rate.id);
    setRateForm({ place: rate.place, rates: rate.rates });
    setIsAddingRate(true);
  };

  const handleDeleteRate = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/taxis/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        setRates(rates.filter(r => r.id !== id));
      }
    } catch (e) {
      toast.error("Failed to delete");
    }
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingRateId) {
        res = await fetch(`/api/admin/taxis/${editingRateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rateForm),
        });
      } else {
        res = await fetch("/api/admin/taxis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rateForm),
        });
      }

      if (res.ok) {
        toast.success("Rate card saved!");
        fetchRates();
        setIsAddingRate(false);
        setEditingRateId(null);
      } else {
        toast.error("Failed to save");
      }
    } catch (e) {
      toast.error("Error saving rate card");
    }
  };

  const handleRateChange = (vehicle: string, value: string) => {
    setRateForm((prev: any) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [vehicle]: Number(value) || 0
      }
    }));
  };

  const handleSaveImage = async (type: string, value: string) => {
    try {
      const res = await fetch("/api/admin/taxis/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, imageUrl: value }),
      });
      if (res.ok) {
        toast.success(`Image updated for ${type}`);
        fetchImages();
      } else {
        toast.error("Failed to update image");
      }
    } catch (e) {
      toast.error("Error saving image");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Sub navigation */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          className={`pb-3 px-2 font-medium border-b-2 transition-colors ${activeSubTab === 'rates' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveSubTab('rates')}
        >
          Rate Card Master
        </button>
        <button 
          className={`pb-3 px-2 font-medium border-b-2 transition-colors ${activeSubTab === 'images' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveSubTab('images')}
        >
          Car Images (Cloudinary URLs)
        </button>
        <button 
          className={`pb-3 px-2 font-medium border-b-2 transition-colors ${activeSubTab === 'commission' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveSubTab('commission')}
        >
          Vehicle & Commissions
        </button>
        <button 
          className={`pb-3 px-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === 'vehicles' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveSubTab('vehicles')}
        >
          Vehicle Approvals
          {vehicles.filter(v => v.status === "PENDING").length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {vehicles.filter(v => v.status === "PENDING").length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === "rates" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Standard Taxi Rate Card</h3>
              <p className="text-sm text-slate-500">Manage drop/tour prices for different vehicle types.</p>
            </div>
            {!isAddingRate && (
              <button onClick={() => { setIsAddingRate(true); setEditingRateId(null); setRateForm({ place: "", rates: {} }) }} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-slate-800">
                <Plus className="w-4 h-4" /> Add Route Price
              </button>
            )}
          </div>

          {isAddingRate ? (
            <div className="p-6">
              <form onSubmit={handleSaveRate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Place / Route Name</label>
                  <input required type="text" className="w-full border rounded-lg p-2 max-w-md" placeholder="e.g. LOCAL PAHALGAM FULL DAY" value={rateForm.place} onChange={e => setRateForm({...rateForm, place: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-3 mt-6">Pricing per Vehicle Type (₹)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {VEHICLE_TYPES.map(vt => (
                      <div key={vt}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{vt}</label>
                        <input type="number" className="w-full border rounded-lg p-2" placeholder="0" value={rateForm.rates[vt] || ""} onChange={e => handleRateChange(vt, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddingRate(false)} className="px-6 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Save Rate</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase sticky left-0 bg-slate-50">PLACES</th>
                    {VEHICLE_TYPES.map(vt => (
                      <th key={vt} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">{vt}</th>
                    ))}
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map(rate => (
                    <tr key={rate.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-sm sticky left-0 bg-white shadow-[1px_0_0_0_#f1f5f9]">{rate.place}</td>
                      {VEHICLE_TYPES.map(vt => (
                        <td key={vt} className="px-4 py-3 text-sm text-slate-600">
                          {rate.rates[vt] ? `₹${rate.rates[vt]}` : "-"}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditRate(rate)} className="p-1.5 bg-sky-50 text-sky-600 rounded-md hover:bg-sky-100">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteRate(rate.id)} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rates.length === 0 && (
                    <tr>
                      <td colSpan={VEHICLE_TYPES.length + 2} className="px-6 py-12 text-center text-slate-500">
                        No rate card entries found. Add your first route price.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "images" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-900">Manage Car Images</h3>
            <p className="text-sm text-slate-500">Paste Cloudinary or any direct image URL for each vehicle type. These images will be shown on the public Taxis page.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {VEHICLE_TYPES.map(vt => (
                <div key={vt} className="border border-slate-200 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800">{vt}</span>
                  </div>
                  <div className="h-32 bg-slate-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {taxiImages[vt] ? (
                      <img src={taxiImages[vt]} alt={vt} className="max-h-full object-contain mix-blend-multiply" />
                    ) : (
                      <Car className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/..."
                    defaultValue={taxiImages[vt] || ""}
                    onBlur={(e) => handleSaveImage(vt, e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Paste URL and click outside to save</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "commission" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <Percent className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Platform Commission Management</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Database schema has been updated with `platformCommissionRate` (default 10%) on the Vehicle model. You can now edit each vendor's taxi commission from their profile.
          </p>
          <p className="text-sm text-slate-400">
            * Note: Vehicle list fetching is available from the Live Vendors tab.
          </p>
        </div>
      )}
      {activeSubTab === "vehicles" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-900">Vehicle Approvals</h3>
            <p className="text-sm text-slate-500">Approve or reject vehicles added by Taxi Vendors.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Features</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{vehicle.make} {vehicle.model}</div>
                      <div className="text-sm font-mono text-slate-500 mt-1 uppercase">{vehicle.registrationNumber}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{vehicle.category || "Sedan"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{vehicle.vendorProfile?.businessName || "Unknown Vendor"}</div>
                      <div className="text-sm text-slate-500">{vehicle.vendorProfile?.user?.name}</div>
                      <div className="text-xs text-slate-400">{vehicle.vendorProfile?.user?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {vehicle.seatingCapacity} Seats
                        </span>
                        {vehicle.hasAc && (
                          <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            AC
                          </span>
                        )}
                        {vehicle.hasCarrier && (
                          <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            Carrier
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {vehicle.status === "LIVE" || vehicle.isApproved ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : vehicle.status === "REJECTED" ? (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      ) : vehicle.status === "SUSPENDED" ? (
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                          <AlertCircle className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                          <AlertCircle className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {vehicle.rejectionReason && (
                        <div className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={vehicle.rejectionReason}>
                          {vehicle.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {vehicle.status !== "LIVE" && !vehicle.isApproved && (
                          <button 
                            onClick={() => handleVehicleAction(vehicle.id, "APPROVE")}
                            disabled={isProcessing === vehicle.id}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {vehicle.status === "PENDING" && (
                          <button 
                            onClick={() => {
                              const reason = prompt("Enter rejection reason:");
                              if (reason) handleVehicleAction(vehicle.id, "REJECT", reason);
                            }}
                            disabled={isProcessing === vehicle.id}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                        {(vehicle.status === "LIVE" || vehicle.isApproved) && (
                          <button 
                            onClick={() => {
                              const reason = prompt("Enter suspension reason:");
                              if (reason) handleVehicleAction(vehicle.id, "SUSPEND", reason);
                            }}
                            disabled={isProcessing === vehicle.id}
                            className="text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

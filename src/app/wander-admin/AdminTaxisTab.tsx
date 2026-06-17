import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Percent, Car, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getPaginatedTaxis } from "@/actions/admin-data";
import { Search } from "lucide-react";

const VEHICLE_TYPES = ["CRYSTA", "INNOVA", "ERTIGA", "TAVEERA", "ETIOS GLANZA", "SWIFT DZIRE", "ECCO", "ALTO K10", "SUMO", "BOLERO"];

export default function AdminTaxisTab() {
  const [activeSubTab, setActiveSubTab] = useState("vehicles");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currentVehiclePage, setCurrentVehiclePage] = useState(1);
  const [totalVehiclePages, setTotalVehiclePages] = useState(1);
  const [totalVehicleItems, setTotalVehicleItems] = useState(0);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [vehicleSearchInput, setVehicleSearchInput] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [currentVehiclePage, vehicleSearchQuery]);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const res = await getPaginatedTaxis({ page: currentVehiclePage, limit: 10, search: vehicleSearchQuery });
      if (res.data) {
        setVehicles(res.data);
        setTotalVehiclePages(res.totalPages);
        setTotalVehicleItems(res.totalCount);
      }
    } catch (e) {
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoadingVehicles(false);
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

  return (
    <div className="space-y-6">
      {/* Sub navigation */}
      <div className="flex gap-4 border-b border-slate-200">
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
      {activeSubTab === "vehicles" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-900">Vehicle Approvals</h3>
            <p className="text-sm text-slate-500">Approve or reject vehicles added by Taxi Vendors.</p>
            <div className="flex gap-2 w-full max-w-md mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={vehicleSearchInput}
                  onChange={(e) => setVehicleSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setVehicleSearchQuery(vehicleSearchInput)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <button
                onClick={() => setVehicleSearchQuery(vehicleSearchInput)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </div>
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
                {loadingVehicles ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading vehicles...</td></tr>
                ) : vehicles.map((vehicle) => (
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

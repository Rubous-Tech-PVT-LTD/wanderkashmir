"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Route, Download, CheckCircle2 } from "lucide-react";
import { assignDriverAndVehicle } from "@/actions/taxiStand";
import toast from "react-hot-toast";

export default function TripsTab({ 
  bookings, 
  isStand, 
  drivers, 
  vehicles 
}: { 
  bookings: any[];
  isStand: boolean;
  drivers?: any[];
  vehicles?: any[];
}) {
  const [assigningBooking, setAssigningBooking] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async (bookingId: string) => {
    if (!selectedDriver || !selectedVehicle) {
      toast.error("Please select both a driver and a vehicle.");
      return;
    }
    
    setLoading(true);
    const res = await assignDriverAndVehicle(bookingId, selectedDriver, selectedVehicle);
    setLoading(false);
    
    if (res.success) {
      toast.success("Driver and vehicle assigned successfully!");
      setAssigningBooking(null);
      setSelectedDriver("");
      setSelectedVehicle("");
    } else {
      toast.error(res.error || "Failed to assign.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{isStand ? "Dispatch Board & Trips" : "Your Recent Trips"}</h2>
          <p className="text-sm text-slate-500 mt-1">Manage all your upcoming rides and airport transfers.</p>
        </div>
        <button className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sky-600 transition-colors">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>
      
      <div className="p-0">
        {bookings && bookings.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Passenger Details</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Route / Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Vehicle & Driver</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Fare Amount</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{booking.guestName || "Passenger"}</div>
                    <div className="text-sm text-slate-500">{booking.guestPhone || "No contact"}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <div className="font-medium text-slate-800">{booking.routePlace || "Standard Trip"}</div>
                    <div>{booking.checkIn ? format(new Date(booking.checkIn), "MMM dd, yyyy") : "N/A"}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-700 max-w-xs">
                    {assigningBooking === booking.id ? (
                      <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-inner">
                        <select 
                          className="w-full text-sm p-2 border rounded-md"
                          value={selectedDriver}
                          onChange={(e) => setSelectedDriver(e.target.value)}
                        >
                          <option value="">-- Select Driver --</option>
                          {drivers?.filter(d => d.status === "ACTIVE").map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                          ))}
                        </select>
                        <select 
                          className="w-full text-sm p-2 border rounded-md"
                          value={selectedVehicle}
                          onChange={(e) => setSelectedVehicle(e.target.value)}
                        >
                          <option value="">-- Select Vehicle --</option>
                          {vehicles?.map(v => (
                            <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registrationNum})</option>
                          ))}
                        </select>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleAssign(booking.id)} disabled={loading} className="flex-1 bg-emerald-600 text-white text-xs py-1.5 rounded font-bold hover:bg-emerald-700">Assign</button>
                          <button onClick={() => setAssigningBooking(null)} className="flex-1 bg-slate-200 text-slate-700 text-xs py-1.5 rounded font-bold hover:bg-slate-300">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-slate-900">{booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : "Unassigned"}</div>
                        {isStand && (
                          <div className="text-xs text-slate-500">
                            Driver: {booking.driver ? booking.driver.name : "Unassigned"}
                          </div>
                        )}
                        {isStand && (!booking.vehicle || !booking.driver) && booking.status !== "CANCELLED" && (
                          <button 
                            onClick={() => setAssigningBooking(booking.id)}
                            className="mt-2 text-xs bg-sky-100 text-sky-700 font-bold px-2 py-1 rounded border border-sky-200 hover:bg-sky-200"
                          >
                            Assign Dispatch
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">₹{booking.taxiAmount?.toLocaleString() || booking.amount?.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">
                      Payout: <span className={booking.taxiPayoutStatus === "PAID" ? "text-emerald-600 font-bold" : "text-orange-600 font-bold"}>{booking.taxiPayoutStatus || "PENDING"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                      booking.status === "PENDING" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {booking.status}
                    </span>
                    {isStand && booking.standApprovalStatus === "PENDING" && (
                      <div className="mt-1 text-[10px] font-bold text-orange-600 uppercase">Needs Dispatch</div>
                    )}
                    {isStand && booking.standApprovalStatus === "APPROVED" && (
                      <div className="mt-1 text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Dispatched</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Route className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Trips Yet</h3>
            <p className="text-slate-500 mt-1 max-w-sm">When tourists book your taxi, the rides will appear here along with your payout status.</p>
          </div>
        )}
      </div>
    </div>
  );
}

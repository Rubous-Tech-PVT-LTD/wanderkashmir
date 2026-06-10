"use client";

import { CalendarCheck, Eye, Search, Filter, IndianRupee, Car, Map, Home } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function BookingsView() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { name: true, vendorProfile: { select: { businessName: true } } } },
      vehicle: { select: { make: true, model: true, vendorProfile: { select: { businessName: true } } } },
      guideProfile: { select: { vendorProfile: { select: { businessName: true } } } },
      user: { select: { name: true } },
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Central Bookings</h1>
          <p className="text-slate-500 mt-1">Manage and track all bookings across the platform.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search booking ID..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
          <button className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Booking ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Service & Vendor</th>
              <th className="p-4">Dates</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking: any) => (
              <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-xs font-bold text-slate-900">{booking.id.slice(-8).toUpperCase()}</td>
                <td className="p-4">
                  <div className="text-sm font-bold text-slate-900">{booking.guestName || booking.user?.name || "Guest"}</div>
                  <div className="text-xs text-slate-500">{booking.guestPhone}</div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {booking.property && (
                      <div className="flex items-start gap-1">
                        <Home className="w-3 h-3 text-sky-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{booking.property.name}</p>
                          <p className="text-[10px] text-slate-500">by {booking.property.vendorProfile?.businessName}</p>
                        </div>
                      </div>
                    )}
                    {booking.vehicle && (
                      <div className="flex items-start gap-1">
                        <Car className="w-3 h-3 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{booking.vehicle.make} {booking.vehicle.model}</p>
                          <p className="text-[10px] text-slate-500">by {booking.vehicle.vendorProfile?.businessName}</p>
                        </div>
                      </div>
                    )}
                    {booking.guideProfile && (
                      <div className="flex items-start gap-1">
                        <Map className="w-3 h-3 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Tour Guide</p>
                          <p className="text-[10px] text-slate-500">by {booking.guideProfile.vendorProfile?.businessName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-xs text-slate-600">
                  <div>In: {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "-"}</div>
                  <div>Out: {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "-"}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-black text-slate-900 mb-1 border-b border-slate-100 pb-1">₹{booking.amount?.toLocaleString()}</div>
                  <div className="space-y-0.5">
                    {booking.baseAmount > 0 && <div className="text-[10px] flex justify-between"><span className="text-sky-600 font-medium">Hotel</span> <span>₹{booking.baseAmount}</span></div>}
                    {booking.taxiAmount > 0 && <div className="text-[10px] flex justify-between"><span className="text-emerald-600 font-medium">Taxi</span> <span>₹{booking.taxiAmount}</span></div>}
                    {booking.guideAmount > 0 && <div className="text-[10px] flex justify-between"><span className="text-orange-600 font-medium">Guide</span> <span>₹{booking.guideAmount}</span></div>}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    booking.status === 'CONFIRMED' ? "bg-emerald-100 text-emerald-700" :
                    booking.status === 'PENDING' ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="View Details">
                    <Eye className="w-5 h-5" />
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

"use client";

import React, { useState } from "react";
import { Search, ChevronRight, Download, Eye } from "lucide-react";
import { format } from "date-fns";

export default function BookingsClient({ bookings, isAdmin }: { bookings: any[]; isAdmin: boolean }) {
  const [search, setSearch] = useState("");

  const filtered = bookings.filter(b =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.partner.companyName.toLowerCase().includes(search.toLowerCase()) ||
    (b.requirement?.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CRM Bookings</h2>
          <p className="text-slate-500">Manage confirmed bookings, payments, and operations.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 font-medium">Booking ID</th>
                <th className="px-6 py-4 font-medium">Customer / Partner</th>
                <th className="px-6 py-4 font-medium">Travel Dates</th>
                <th className="px-6 py-4 font-medium">Value</th>
                {isAdmin && <th className="px-6 py-4 font-medium">Gross Margin</th>}
                <th className="px-6 py-4 font-medium">Status / Payment</th>
                {isAdmin && <th className="px-6 py-4 font-medium">Assigned BA</th>}
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={isAdmin ? 8 : 6} className="px-6 py-8 text-center text-slate-500">No bookings found.</td></tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors hidden md:table-row">
                  <td className="px-6 py-4 font-medium text-slate-900">WK-B-{b.id.substring(0,6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{b.requirement?.customerName || "N/A"}</div>
                    <div className="text-slate-500 text-xs">{b.partner.companyName}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {b.travelDate ? format(new Date(b.travelDate), "dd MMM") : "TBD"} to {b.returnDate ? format(new Date(b.returnDate), "dd MMM yyyy") : "TBD"}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">Rs. {b.partnerPrice?.toLocaleString("en-IN")||0}</td>
                  
                  {isAdmin && (
                    <td className="px-6 py-4 font-medium text-green-600">
                      Rs. {(b.partnerPrice - b.totalCost)?.toLocaleString("en-IN")||0}
                    </td>
                  )}
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {b.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${b.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.paymentStatus === 'PARTIAL' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        PAY: {b.paymentStatus}
                      </span>
                    </div>
                  </td>
                  
                  {isAdmin && (
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {b.baName}
                    </td>
                  )}

                  <td className="px-6 py-4">
                    <button className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1">
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

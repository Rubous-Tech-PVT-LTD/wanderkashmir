"use client";

import { useBookingStore } from "@/store/bookingStore";
import Link from "next/link";

interface AddonsSelectorClientProps {
  taxis: any[];
  guides: any[];
}

export default function AddonsSelectorClient({ taxis, guides }: AddonsSelectorClientProps) {
  const { selectedTaxiId, selectedGuideId, setSelectedTaxi, setSelectedGuide } = useBookingStore();

  return (
    <div className="pt-6 border-t border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-2">Enhance Your Trip</h3>
      <p className="text-sm text-slate-500 mb-6">Select these trusted local services to add to your booking.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Taxis */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
            <div>
              <Link href="/taxis" className="font-bold text-slate-900 hover:text-emerald-700 hover:underline transition-colors cursor-pointer">
                Local Taxis & Cabs <span className="inline-block ml-1 text-xs">↗</span>
              </Link>
              <p className="text-xs text-slate-500">{taxis?.length || 0} vehicles available</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="addonTaxiPage"
                checked={selectedTaxiId !== ""}
                disabled={!taxis || taxis.length === 0}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setSelectedTaxi("", 0);
                  } else if (taxis && taxis.length > 0) {
                    setSelectedTaxi(taxis[0].id, 2000); 
                  }
                }}
                className="w-4 h-4 text-emerald-600 rounded disabled:opacity-50"
              />
              <label htmlFor="addonTaxiPage" className="text-sm font-semibold text-slate-700">Add a Taxi / Cab</label>
            </div>
            
            {selectedTaxiId !== "" && taxis && taxis.length > 0 && (
              <div className="ml-6">
                <select 
                  value={selectedTaxiId}
                  onChange={(e) => {
                    setSelectedTaxi(e.target.value, 2000);
                  }}
                  className="w-full text-sm border border-emerald-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {taxis.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.vendorProfile?.businessName || "Taxi"} ({t.make} {t.model}) - ₹2,000/day
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Guides */}
        <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <Link href="/guides" className="font-bold text-slate-900 hover:text-orange-700 hover:underline transition-colors cursor-pointer">
                Expert Tour Guides <span className="inline-block ml-1 text-xs">↗</span>
              </Link>
              <p className="text-xs text-slate-500">{guides?.length || 0} guides available</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="addonGuidePage"
                checked={selectedGuideId !== ""}
                disabled={!guides || guides.length === 0}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setSelectedGuide("", 0);
                  } else if (guides && guides.length > 0) {
                    setSelectedGuide(guides[0].id, guides[0].pricePerDay);
                  }
                }}
                className="w-4 h-4 text-orange-600 rounded disabled:opacity-50"
              />
              <label htmlFor="addonGuidePage" className="text-sm font-semibold text-slate-700">Add a Local Tour Guide</label>
            </div>
            
            {selectedGuideId !== "" && guides && guides.length > 0 && (
              <div className="ml-6">
                <select 
                  value={selectedGuideId}
                  onChange={(e) => {
                    const g = guides.find(g => g.id === e.target.value);
                    setSelectedGuide(e.target.value, g ? g.pricePerDay : 0);
                  }}
                  className="w-full text-sm border border-orange-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  {guides.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.vendorProfile?.businessName || "Guide"} - ₹{g.pricePerDay}/day
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

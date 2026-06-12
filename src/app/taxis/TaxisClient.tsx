"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, MapPin, Info, ArrowRight } from "lucide-react";

const DEFAULT_IMAGES: Record<string, string> = {
  "CRYSTA": "https://imgd.aeplcdn.com/664x374/n/cw/ec/139651/innova-crysta-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "INNOVA": "https://imgd.aeplcdn.com/664x374/n/cw/ec/140809/innova-hycross-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "ERTIGA": "https://imgd.aeplcdn.com/664x374/n/cw/ec/115025/ertiga-exterior-right-front-three-quarter-3.jpeg?isig=0&q=80",
  "TAVERA": "https://imgd.aeplcdn.com/664x374/ec/30/16/10271/img/m/Chevrolet-Tavera-Neo-3-Right-Front-Three-Quarter-48419_ol.jpg?v=201711021421&q=80",
  "ETIOS": "https://imgd.aeplcdn.com/664x374/ec/4B/7D/10398/img/m/Toyota-Platinum-Etios-Right-Front-Three-Quarter-83344_ol.jpg?v=201711021421&q=80",
  "SWIFT": "https://imgd.aeplcdn.com/664x374/n/cw/ec/170173/swift-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "ECCO": "https://imgd.aeplcdn.com/664x374/n/cw/ec/131151/eeco-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "ALTO": "https://imgd.aeplcdn.com/664x374/n/cw/ec/127563/alto-k10-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "SUMO": "https://imgd.aeplcdn.com/664x374/ec/14/C8/10410/img/m/Tata-Sumo-Gold-Right-Front-Three-Quarter-51206_ol.jpg?v=201711021421&q=80"
};

const VEHICLE_TYPES = Object.keys(DEFAULT_IMAGES);

export default function TaxisClient({ rateCards, imagesMap = {} }: { rateCards: any[], imagesMap?: Record<string, string> }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("INNOVA");
  const [searchRoute, setSearchRoute] = useState("");

  const filteredRoutes = rateCards.filter(r => r.place.toLowerCase().includes(searchRoute.toLowerCase()));

  return (
    <div className="pt-24 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Kashmir Taxi Rates</h1>
          <p className="text-lg text-slate-600">Standard union rates for sightseeing, airport drops, and full-day tours across Kashmir. Select a vehicle to view its prices.</p>
        </div>

        {/* Vehicle Selection */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Car className="w-6 h-6 text-orange-500" />
            1. Select Your Vehicle
          </h2>
          
          <div className="flex overflow-x-auto pb-6 gap-4 snap-x hide-scrollbar">
            {VEHICLE_TYPES.map(vt => (
              <button
                key={vt}
                onClick={() => setSelectedVehicle(vt)}
                className={`flex-shrink-0 snap-start w-40 rounded-2xl border-2 transition-all overflow-hidden ${
                  selectedVehicle === vt ? 'border-orange-500 ring-4 ring-orange-500/10 scale-105 shadow-md' : 'border-slate-200 hover:border-slate-300 bg-white opacity-80 hover:opacity-100'
                }`}
              >
                <div className="h-24 bg-slate-100 p-2 flex items-center justify-center">
                  <img src={imagesMap[vt] || DEFAULT_IMAGES[vt]} alt={vt} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                </div>
                <div className={`p-3 text-center font-bold text-sm ${selectedVehicle === vt ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-700'}`}>
                  {vt}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rate Card Display */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-sky-500" />
              2. Explore Tour Rates for <span className="text-orange-600">{selectedVehicle}</span>
            </h2>
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search route (e.g. Pahalgam)"
                value={searchRoute}
                onChange={e => setSearchRoute(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Route / Destination</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40 text-right">Standard Rate</th>
                  <th className="px-6 py-4 w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoutes.map((rate) => {
                  const price = rate.rates[selectedVehicle];
                  return (
                    <tr key={rate.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-slate-800 text-sm md:text-base">
                        {rate.place}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {price && price > 0 ? `₹${price.toLocaleString('en-IN')}` : <span className="text-slate-400 font-normal">N/A</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {price && price > 0 && (
                          <Link href={`/checkout?type=taxi&vehicle=${selectedVehicle}&route=${encodeURIComponent(rate.place)}`} className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Book <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredRoutes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      No routes found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex items-start gap-2 text-sm text-slate-500 bg-sky-50 p-4 rounded-xl">
            <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <p>
              These are standard union rates. Actual booking prices may have slight variations depending on exact pickup/drop locations and seasonal demand. Tolls and parking are extra unless specified.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

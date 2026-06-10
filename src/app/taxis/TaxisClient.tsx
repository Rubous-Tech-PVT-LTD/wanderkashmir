"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, Search, Star, MapPin, CheckCircle2 } from "lucide-react";

export interface TaxiItem {
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  featured: boolean;
  registrationNum: string;
}

export default function TaxisClient({ initialTaxis, initialQuery = "" }: { initialTaxis: TaxiItem[], initialQuery?: string }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState("Recommended");

  const types = ["Sedan", "SUV", "Hatchback", "Traveller"];

  const handleTypeToggle = (t: string) => {
    setSelectedType(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  // Filter Logic
  let filtered = initialTaxis.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedType.length > 0 && !selectedType.includes(p.type)) return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  // Sort Logic
  if (sortBy === "Price: Low to High") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "Price: High to Low") filtered = [...filtered].sort((a, b) => b.price - a.price);

  return (
    <div className="pt-24 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Taxis & Cabs in Kashmir</h1>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} vehicles found</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-[var(--primary)]"
              >
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── SIDEBAR FILTERS ────────────────────────── */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg">Filters</h3>
                <button 
                  onClick={() => {
                    setSearchQuery(""); setSelectedType([]); setMaxPrice(5000);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-[var(--primary)]"
                >
                  Reset
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900 mb-3">Search Model</p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Innova, Etios"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Price Range */}
              <div className="mb-6 pt-6 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-3">Price Per Day</p>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>₹0</span>
                  <span className="font-semibold text-slate-900">₹{maxPrice.toLocaleString("en-IN")}+</span>
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="pt-6 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-3">Vehicle Type</p>
                <div className="space-y-2.5">
                  {types.map((t) => (
                    <label key={t} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedType.includes(t)}
                        onChange={() => handleTypeToggle(t)}
                        className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]" 
                      />
                      <span className="text-sm text-slate-600">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* ─── LISTINGS ────────────────────────── */}
          <div className="flex-1 space-y-6">
            {filtered.map((taxi) => (
              <div key={taxi.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-72 h-48 md:h-auto rounded-xl overflow-hidden relative flex-shrink-0 bg-slate-100">
                  <img src={taxi.image} alt={taxi.name} className="w-full h-full object-cover" />
                  {taxi.featured && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="badge bg-[var(--primary)] text-white shadow-sm border-none">
                        Top Rated
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 hover:text-[var(--primary)] transition-colors cursor-pointer">
                        {taxi.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {taxi.location}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Star className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
                        <span className="font-bold text-[var(--primary)]">{taxi.rating}</span>
                        <span className="text-xs">({taxi.reviews} trips)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-50 rounded-md text-slate-600 border border-slate-100 capitalize">
                      {taxi.type}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-green-50 rounded-md text-green-700 border border-green-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Driver
                    </span>
                  </div>

                  <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100 mt-4">
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        ₹{taxi.price.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-slate-500">/ day</p>
                    </div>
                    {/* Reusing checkout flow but passing vehicle type */}
                    <Link href={`/checkout?id=${taxi.id}&type=taxi`} className="btn-primary">
                      Book Taxi
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">No taxis found</h3>
                <p className="text-slate-500">Try adjusting your filters to see more results.</p>
                <button 
                  onClick={() => {
                    setSearchQuery(""); setSelectedType([]); setMaxPrice(5000);
                  }}
                  className="mt-6 btn-primary mx-auto"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

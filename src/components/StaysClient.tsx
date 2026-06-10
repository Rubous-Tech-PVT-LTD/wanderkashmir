"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Search, Star, Heart } from "lucide-react";

export interface PropertyItem {
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  featured: boolean;
}

export default function StaysClient({ initialProperties, initialQuery = "" }: { initialProperties: PropertyItem[], initialQuery?: string }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState("Recommended");

  const types = ["Hotel", "Homestay", "Guest House", "Houseboat", "Villa"];
  const amenities = ["Free WiFi", "Parking", "Breakfast", "Room Service", "Pet Friendly"];
  const ratings = [4.5, 4.0, 3.5, 3.0];

  const handleTypeToggle = (t: string) => {
    setSelectedType(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const handleAmenityToggle = (a: string) => {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  // Filter Logic
  let filtered = initialProperties.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedType.length > 0 && !selectedType.includes(p.type)) return false;
    if (minRating && p.rating < minRating) return false;
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
            <h1 className="text-3xl font-bold text-slate-900">Stays in Kashmir</h1>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} properties found</p>
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
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <MapPin className="w-4 h-4" /> Map View
            </button>
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
                    setSearchQuery(""); setSelectedType([]); setSelectedAmenities([]); setMinRating(null); setMaxPrice(10000);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-[var(--primary)]"
                >
                  Reset
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900 mb-3">Search by name</p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search property name"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Price Range */}
              <div className="mb-6 pt-6 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-3">Price Range</p>
                <input
                  type="range"
                  min="1000"
                  max="50000"
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

              {/* Property Type */}
              <div className="mb-6 pt-6 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-3">Property Type</p>
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

              {/* Amenities */}
              <div className="mb-6 pt-6 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-3">Popular Amenities</p>
                <div className="space-y-2.5">
                  {amenities.map((a) => (
                    <label key={a} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedAmenities.includes(a)}
                        onChange={() => handleAmenityToggle(a)}
                        className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]" 
                      />
                      <span className="text-sm text-slate-600">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* User Rating */}
              <div className="pt-6 border-t border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-3">User Rating</p>
                <div className="space-y-2.5">
                  {ratings.map((r) => (
                    <label key={r} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="rating"
                        checked={minRating === r}
                        onChange={() => setMinRating(r)}
                        className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]" 
                      />
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                        {r} & above
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* ─── LISTINGS ────────────────────────── */}
          <div className="flex-1 space-y-6">
            {filtered.map((property) => (
              <div key={property.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-72 h-48 md:h-auto rounded-xl overflow-hidden relative flex-shrink-0 bg-slate-100">
                  <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-slate-400 hover:text-orange-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  {property.featured && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="badge bg-orange-500 text-white shadow-sm border-none">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 hover:text-[var(--primary)] transition-colors cursor-pointer">
                        {property.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {property.location}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Star className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" />
                        <span className="font-bold text-[var(--primary)]">{property.rating}</span>
                        <span className="text-xs">({property.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-50 rounded-md text-slate-600 border border-slate-100 capitalize">
                      {property.type.toLowerCase()}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-50 rounded-md text-slate-600 border border-slate-100">
                      Free WiFi
                    </span>
                  </div>

                  <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100 mt-4">
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        ₹{property.price.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-slate-500">/ night</p>
                    </div>
                    <Link href={`/stays/${property.id}`} className="btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">No properties found</h3>
                <p className="text-slate-500">Try adjusting your filters to see more results.</p>
                <button 
                  onClick={() => {
                    setSearchQuery(""); setSelectedType([]); setSelectedAmenities([]); setMinRating(null); setMaxPrice(10000);
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

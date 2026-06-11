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
              <div key={property.id} className="bg-white border border-sky-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row">
                
                {/* Left: Image */}
                <div className="w-full md:w-[260px] md:min-w-[260px] h-64 md:h-auto relative flex-shrink-0 group">
                  <img src={property.image} alt={property.name} className="w-full h-full object-cover md:rounded-l-lg rounded-t-lg md:rounded-tr-none" />
                  
                  {/* Heart Icon */}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors z-10">
                    <Heart className="w-4 h-4" />
                  </button>
                  
                  {/* Photos Pill */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <div className="bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      12 Photos & Videos &rarr;
                    </div>
                  </div>

                  {/* Gradient Overlay for bottom text/pills */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent md:rounded-bl-lg"></div>
                </div>

                {/* Middle: Details */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-slate-900 cursor-pointer hover:text-sky-600 transition-colors">
                        {property.name}
                      </h3>
                      <div className="flex text-slate-400 text-xs">
                        {/* Fake Stars */}
                        <Star className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                        <Star className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                        <Star className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                        <Star className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
                        <Star className="w-3.5 h-3.5 fill-slate-200 text-slate-200" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">
                      <span className="text-sky-600 hover:underline cursor-pointer">{property.location}</span> <span className="text-slate-300 mx-1">|</span> 
                      {property.type === "Houseboat" ? "Scenic lake views" : "Prime location in the valley"}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs font-medium px-2.5 py-1 border border-slate-300 rounded text-slate-600">
                        Couple Friendly
                      </span>
                      <span className="text-xs font-medium px-2.5 py-1 border border-slate-300 rounded text-slate-600">
                        {property.type}
                      </span>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex items-start gap-2 text-sm text-emerald-700 font-medium">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                        </svg>
                        <span className="line-clamp-1">Enjoy local Kashmiri Kahwa on arrival</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-blue-800">
                        <svg className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.8-6.3 4.8 2.3-7.4-6-4.6h7.6z" />
                        </svg>
                        <span className="line-clamp-1">Stunning ambiance, delightful local cuisine, family-friendly activities.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Rating */}
                <div className="w-full md:w-56 p-5 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between bg-white md:rounded-r-lg relative">
                  {/* Rating Top Right */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-sky-800">Very Good</span>
                      <div className="bg-blue-700 text-white text-sm font-bold px-2 py-1 rounded">
                        {property.rating}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">({property.reviews} Ratings)</span>
                  </div>

                  {/* Pricing Bottom Right */}
                  <div className="mt-8 flex flex-col items-end text-right">
                    <div className="flex items-start gap-1">
                      <span className="text-2xl font-bold text-slate-900">₹ {(property.price).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">+ ₹ {Math.round(property.price * 0.12).toLocaleString("en-IN")} taxes & fees</p>
                    <p className="text-xs text-slate-500 mb-4">Per Night</p>
                    
                    <Link href={`/stays/${property.id}`} className="text-sm font-bold text-sky-500 hover:text-sky-600 hover:underline">
                      View Details & Book Now &rarr;
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

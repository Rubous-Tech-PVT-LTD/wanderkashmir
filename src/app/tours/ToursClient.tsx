"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Star, Clock, Users, MapPin, CheckCircle2, Heart, Filter } from "lucide-react";
import CustomizeTourModal from "@/components/CustomizeTourModal";

// Categories are now generated dynamically in the component

// Removed hardcoded tours array

export default function ToursClient({ initialTours, dbCategories = [] }: { initialTours: any[], dbCategories?: any[] }) {
  const [selectedCat, setSelectedCat] = useState("All");

  // Extract all unique categories from the tours to handle any custom categories added by admin
  const usedCategories = new Set<string>();
  initialTours.forEach(tour => {
    if (tour.category) {
      tour.category.split(',').forEach((c: string) => {
        const trimmed = c.trim();
        if (trimmed) usedCategories.add(trimmed);
      });
    }
  });

  const baseCategories = dbCategories.length > 0 
    ? dbCategories.map(c => c.name)
    : ["Honeymoon", "Family", "Adventure", "Pilgrimage", "Culture"];
  
  // Combine "All Packages" + base categories + any extra custom categories used by tours
  const categories = ["All Packages", ...Array.from(new Set([...baseCategories, ...Array.from(usedCategories)]))];
  const [sortBy, setSortBy] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const tours = initialTours;

  const filtered = tours.filter(
    (t) => selectedCat === "All Packages" || selectedCat === "All" || (t.category && t.category.toLowerCase().includes(selectedCat.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTours = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  const handleCatChange = (cat: string) => {
    setSelectedCat(cat);
    setCurrentPage(1);
  };

  return (
    <main>
      <Navbar />
      <div className="pt-20 min-h-screen">
        {/* Header */}
        <div
          className="relative py-16 overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600"
        >
          <div className="container-custom text-center text-white relative z-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-100 mb-3">
              Curated Experiences
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 text-white">
              Tour Packages in Kashmir
            </h1>
            <p className="text-orange-50 text-base max-w-xl mx-auto mb-6">
              Hand-crafted itineraries by local experts. Everything included — stays, meals, transfers & guides.
            </p>
            <div className="flex justify-center">
              <CustomizeTourModal />
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          {/* Filter bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex gap-2 flex-wrap items-center">
              <label htmlFor="category-select" className="text-sm font-semibold text-slate-600 hidden md:block">
                Category:
              </label>
              <select
                id="category-select"
                value={selectedCat}
                onChange={(e) => handleCatChange(e.target.value)}
                className="text-sm font-semibold border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm hover:border-orange-300 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 bg-white"
              >
                {["Recommended", "Price: Low to High", "Price: High to Low", "Highest Rated"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tour cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTours.map((tour, index) => (
              <Link
                key={tour.id}
                href={tour.isLive ? `/tours/${tour.slug}` : `https://wa.me/916005888754?text=I'm%20interested%20in%20the%20${encodeURIComponent(tour.title)}`}
                target={tour.isLive ? undefined : "_blank"}
                className="group block"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full transform hover:-translate-y-1">
                  {/* Image Container */}
                  <div className="relative h-52 overflow-hidden flex-shrink-0">
                    <Image 
                      src={tour.images[0] || "https://i.ibb.co/DfbJP98Q/OIP.webp"} 
                      alt={tour.title} 
                      fill 
                      unoptimized
                      priority={index < 4}
                      className="object-cover transition-transform duration-500 hover:scale-105" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap pr-12">
                      {tour.badge && (
                        <span className="badge bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-sm">
                          {tour.badge}
                        </span>
                      )}
                      {(() => {
                        const categories = tour.category ? tour.category.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
                        const maxCats = tour.badge ? 1 : 2;
                        const visibleCats = categories.slice(0, maxCats);
                        const hiddenCount = categories.length - maxCats;
                        
                        return (
                          <>
                            {visibleCats.map((cat: string, idx: number) => (
                              <span key={idx} className="badge bg-orange-500 text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-sm">
                                {cat}
                              </span>
                            ))}
                            {hiddenCount > 0 && (
                              <span className="badge bg-slate-900/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-sm" title={categories.slice(maxCats).join(', ')}>
                                +{hiddenCount}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
                      <Heart className="w-4 h-4 text-slate-400" />
                    </button>
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-xs text-white/80">{tour.duration}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {tour.destinations.slice(0, 3).map((d: string) => (
                          <span key={d} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" /> 
                            <span className="truncate max-w-[120px]">{d}</span>
                          </span>
                        ))}
                        {tour.destinations.length > 3 && (
                          <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center" title={tour.destinations.slice(3).join(', ')}>
                            +{tour.destinations.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2 leading-tight">{tour.title}</h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: "rgba(232,99,26,0.12)" }}>
                        <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        <span className="text-xs font-bold text-orange-700">4.8</span>
                      </div>
                      <span className="text-xs text-slate-400">(412 reviews)</span>
                    </div>

                    {/* Inclusions */}
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {tour.inclusions.slice(0, 4).map((inc: string) => (
                        <span key={inc} className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-orange-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{inc}</span>
                        </span>
                      ))}
                      {tour.inclusions.length > 4 && (
                        <span 
                          className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-slate-500 cursor-help"
                          title={tour.inclusions.slice(4).join(', ')}
                        >
                          +{tour.inclusions.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100">
                      <div>
                        {tour.originalPrice && (
                          <p className="text-xs text-slate-400 line-through">₹{tour.originalPrice.toLocaleString("en-IN")}</p>
                        )}
                        <p className="text-lg font-bold text-slate-900">
                          ₹{tour.price.toLocaleString("en-IN")}
                          <span className="text-xs font-normal text-slate-400">/person</span>
                        </p>
                      </div>
                      {tour.isLive ? (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm">
                          View Details
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded text-amber-700 bg-amber-100 uppercase tracking-wider">
                            Coming Soon
                          </span>
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-100 shadow-sm flex items-center gap-1 hover:bg-emerald-200 transition-colors">
                            WhatsApp Now
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                      currentPage === idx + 1
                        ? "bg-orange-500 text-white shadow-md"
                        : "border border-slate-200 text-slate-600 hover:bg-orange-500 hover:text-orange-500"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

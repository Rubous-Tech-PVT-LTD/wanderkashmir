"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Star, Clock, Users, MapPin, CheckCircle2, Heart, Filter } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import CustomizeTourModal from "@/components/CustomizeTourModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Categories are now generated dynamically in the component
// Removed hardcoded tours array

export default function ToursClient({ initialTours, dbCategories = [] }: { initialTours: any[], dbCategories?: any[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams.get("category");
  const monthParam = searchParams.get("month");
  const destinationParam = searchParams.get("destination");

  const [selectedCat, setSelectedCat] = useState(categoryParam || "All Packages");
  const [selectedMonth, setSelectedMonth] = useState(monthParam || "All Months");
  const [selectedDest, setSelectedDest] = useState(destinationParam || "All Destinations");

  useEffect(() => {
    if (categoryParam) setSelectedCat(categoryParam);
    if (monthParam) setSelectedMonth(monthParam);
    if (destinationParam) setSelectedDest(destinationParam);
  }, [categoryParam, monthParam, destinationParam]);

  // Extract all unique categories and months from the tours
  const usedCategories = new Set<string>();
  const usedMonths = new Set<string>();
  
  initialTours.forEach(tour => {
    if (tour.category) {
      tour.category.split(',').forEach((c: string) => {
        const trimmed = c.trim();
        if (trimmed) {
          if (MONTHS.includes(trimmed)) {
            usedMonths.add(trimmed);
          } else {
            usedCategories.add(trimmed);
          }
        }
      });
    }
  });

  const baseCategories = dbCategories.length > 0 
    ? dbCategories.map(c => c.name).filter(c => !MONTHS.includes(c))
    : ["Upcoming", "Honeymoon", "Family", "Adventure", "Pilgrimage", "Culture"];
  
  // Combine "All Packages" + base categories + any extra custom categories used by tours (excluding months)
  const categories = ["All Packages", ...Array.from(new Set([...baseCategories, ...Array.from(usedCategories)]))];
  
  // Sort used months chronologically
  const sortedUsedMonths = Array.from(usedMonths).sort((a, b) => MONTHS.indexOf(a) - MONTHS.indexOf(b));
  const months = ["All Months", ...sortedUsedMonths];
  
  // Extract all unique destinations
  const usedDestinations = new Set<string>();
  initialTours.forEach(tour => {
    if (tour.destinations && Array.isArray(tour.destinations)) {
      tour.destinations.forEach((d: string) => {
        const trimmed = d.trim();
        if (trimmed) usedDestinations.add(trimmed);
      });
    }
  });
  const destinations = ["All Destinations", ...Array.from(usedDestinations).sort()];

  const [sortBy, setSortBy] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const tours = initialTours;

  const filtered = tours.filter((t) => {
    const matchCat = selectedCat === "All Packages" || selectedCat === "All" || (t.category && t.category.toLowerCase().includes(selectedCat.toLowerCase()));
    const matchMonth = selectedMonth === "All Months" || selectedMonth === "All" || (t.category && t.category.includes(selectedMonth));
    
    let matchDest = true;
    if (selectedDest !== "All Destinations" && selectedDest !== "All") {
      const targetSlug = selectedDest.toLowerCase().replace(/\s+/g, '-');
      matchDest = t.destinations && t.destinations.some((d: string) => d.toLowerCase().replace(/\s+/g, '-') === targetSlug);
    }
    
    return matchCat && matchMonth && matchDest;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTours = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCatChange = (cat: string) => {
    setSelectedCat(cat);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All Packages") params.delete("category");
    else params.set("category", cat);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (month === "All Months") params.delete("month");
    else params.set("month", month);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDestChange = (dest: string) => {
    setSelectedDest(dest);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (dest === "All Destinations") params.delete("destination");
    else params.set("destination", dest);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <main>
      <Navbar />
      <div className="pt-20 min-h-screen">
        {/* Header */}
        <div
          className="relative py-24 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('https://res.cloudinary.com/dcmoseix9/image/upload/f_auto,q_auto/v1788713063/IMG_E0814_ascrcw.heic')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/60 z-0"></div>
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
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-wrap">
              <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2 w-full md:w-auto">
                <label htmlFor="category-select" className="text-xs md:text-sm font-semibold text-slate-500 md:text-slate-600 pl-1 md:pl-0">
                  Category
                </label>
                <select
                  id="category-select"
                  value={selectedCat}
                  onChange={(e) => handleCatChange(e.target.value)}
                  className="w-full md:w-auto text-sm font-semibold border border-slate-200 rounded-xl px-4 py-3 md:py-2.5 bg-white text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm hover:border-orange-300 transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {months.length > 1 && (
                <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2 w-full md:w-auto">
                  <label htmlFor="month-select" className="text-xs md:text-sm font-semibold text-slate-500 md:text-slate-600 pl-1 md:pl-0 md:ml-2">
                    Month
                  </label>
                  <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => handleMonthChange(e.target.value)}
                    className="w-full md:w-auto text-sm font-semibold border border-slate-200 rounded-xl px-4 py-3 md:py-2.5 bg-white text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm hover:border-orange-300 transition-colors"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2 w-full md:w-auto">
                <label htmlFor="destination-select" className="text-xs md:text-sm font-semibold text-slate-500 md:text-slate-600 pl-1 md:pl-0 md:ml-2">
                  Destination
                </label>
                <select
                  id="destination-select"
                  value={selectedDest}
                  onChange={(e) => handleDestChange(e.target.value)}
                  className="w-full md:w-auto text-sm font-semibold border border-slate-200 rounded-xl px-4 py-3 md:py-2.5 bg-white text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm hover:border-orange-300 transition-colors"
                >
                  {destinations.map((dest) => (
                    <option key={dest} value={dest}>
                      {dest}
                    </option>
                  ))}
                </select>
              </div>
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
          {paginatedTours.length > 0 ? (
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
                      {tour.category?.includes('Instagram') && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                          <InstagramIcon className="w-3 h-3" /> Insta
                        </div>
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
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm col-span-full">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No Packages Found</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">
                No tour packages are currently available for this destination or category combination.
              </p>
              <button onClick={() => { 
                setSelectedCat("All Packages"); 
                setSelectedDest("All Destinations"); 
                setCurrentPage(1); 
                router.push(window.location.pathname, { scroll: false }); 
              }} className="inline-block px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                View All Tours
              </button>
            </div>
          )}
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

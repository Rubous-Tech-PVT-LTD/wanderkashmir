"use client";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, Suspense, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, Clock, Users, MapPin, CheckCircle2, Heart, Filter } from "lucide-react";



function TourParamsHydrator({ 
  onParamsLoad 
}: { 
  onParamsLoad: (cat: string | null, month: string | null, dest: string | null) => void 
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    onParamsLoad(
      searchParams.get("category"),
      searchParams.get("month"),
      searchParams.get("destination")
    );
  }, [searchParams, onParamsLoad]);
  
  return null;
}

export type TourMeta = {
  id: string;
  category: string | null;
  destinations: string[];
};

export type TourCardNode = {
  id: string;
  node: ReactNode;
};

export default function ToursClient({ 
  metadata,
  cards,
  precomputedCategories,
  precomputedMonths,
  precomputedDestinations
}: { 
  metadata: TourMeta[],
  cards: TourCardNode[],
  precomputedCategories: string[],
  precomputedMonths: string[],
  precomputedDestinations: string[]
}) {
  const router = useRouter();
  
  const [selectedCat, setSelectedCat] = useState("All Packages");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedDest, setSelectedDest] = useState("All Destinations");

  const handleParamsLoad = useCallback((cat: string | null, month: string | null, dest: string | null) => {
    setSelectedCat(cat || "All Packages");
    setSelectedMonth(month || "All Months");
    setSelectedDest(dest || "All Destinations");
  }, []);

  const categories = precomputedCategories;
  const months = precomputedMonths;
  const destinations = precomputedDestinations;

  const [sortBy, setSortBy] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = useMemo(() => {
    return metadata.filter((t) => {
      const matchCat = selectedCat === "All Packages" || selectedCat === "All" || (t.category && t.category.toLowerCase().includes(selectedCat.toLowerCase()));
      const matchMonth = selectedMonth === "All Months" || selectedMonth === "All" || (t.category && t.category.includes(selectedMonth));
      
      let matchDest = true;
      if (selectedDest !== "All Destinations" && selectedDest !== "All") {
        const targetSlug = selectedDest.toLowerCase().replace(/\s+/g, '-');
        matchDest = t.destinations && t.destinations.some((d: string) => d.toLowerCase().replace(/\s+/g, '-') === targetSlug);
      }
      
      return matchCat && matchMonth && matchDest;
    });
  }, [metadata, selectedCat, selectedMonth, selectedDest]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMetadata = filtered.slice(startIndex, startIndex + itemsPerPage);

  const paginatedNodes = useMemo(() => {
    return paginatedMetadata.map(meta => {
      const card = cards.find(c => c.id === meta.id);
      return card ? card.node : null;
    });
  }, [paginatedMetadata, cards]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCatChange = (cat: string) => {
    setSelectedCat(cat);
    setCurrentPage(1);
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : "");
    if (cat === "All Packages") params.delete("category");
    else params.set("category", cat);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setCurrentPage(1);
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : "");
    if (month === "All Months") params.delete("month");
    else params.set("month", month);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDestChange = (dest: string) => {
    setSelectedDest(dest);
    setCurrentPage(1);
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : "");
    if (dest === "All Destinations") params.delete("destination");
    else params.set("destination", dest);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="container-custom py-8">
      <Suspense fallback={null}>
        <TourParamsHydrator onParamsLoad={handleParamsLoad} />
      </Suspense>
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
      {paginatedNodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedNodes}
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
  );
}

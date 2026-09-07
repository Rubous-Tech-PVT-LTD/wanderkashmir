"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

export default function TourFilters({ 
  precomputedCategories,
  precomputedMonths,
  precomputedDestinations
}: { 
  precomputedCategories: string[],
  precomputedMonths: string[],
  precomputedDestinations: string[]
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCat = searchParams.get("category") || "All Packages";
  const selectedMonth = searchParams.get("month") || "All Months";
  const selectedDest = searchParams.get("destination") || "All Destinations";
  const sortBy = searchParams.get("sort") || "Recommended";

  const updateParam = (key: string, value: string, defaultVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultVal) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== "page") {
       params.delete("page");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-wrap">
          <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2 w-full md:w-auto">
            <label htmlFor="category-select" className="text-xs md:text-sm font-semibold text-slate-500 md:text-slate-600 pl-1 md:pl-0">
              Category
            </label>
            <select
              id="category-select"
              value={selectedCat}
              onChange={(e) => updateParam("category", e.target.value, "All Packages")}
              className="w-full md:w-auto text-sm font-semibold border border-slate-200 rounded-xl px-4 py-3 md:py-2.5 bg-white text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm hover:border-orange-300 transition-colors"
            >
              {precomputedCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {precomputedMonths.length > 1 && (
            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-2 w-full md:w-auto">
              <label htmlFor="month-select" className="text-xs md:text-sm font-semibold text-slate-500 md:text-slate-600 pl-1 md:pl-0 md:ml-2">
                Month
              </label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => updateParam("month", e.target.value, "All Months")}
                className="w-full md:w-auto text-sm font-semibold border border-slate-200 rounded-xl px-4 py-3 md:py-2.5 bg-white text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm hover:border-orange-300 transition-colors"
              >
                {precomputedMonths.map((month) => (
                  <option key={month} value={month}>{month}</option>
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
              onChange={(e) => updateParam("destination", e.target.value, "All Destinations")}
              className="w-full md:w-auto text-sm font-semibold border border-slate-200 rounded-xl px-4 py-3 md:py-2.5 bg-white text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm hover:border-orange-300 transition-colors"
            >
              {precomputedDestinations.map((dest) => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => updateParam("sort", e.target.value, "Recommended")}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 bg-white"
          >
            {["Recommended", "Price: Low to High", "Price: High to Low", "Highest Rated"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
  );
}

export function TourPagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  if (totalPages <= 1) return null;

  return (
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
  );
}

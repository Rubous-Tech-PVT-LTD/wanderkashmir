"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TourPackageDetail } from "@/data/liveToursData";
import TourCardCompact from "./TourCardCompact";
import ToursFilterSidebar from "./ToursFilterSidebar";
import { SlidersHorizontal, RotateCcw, Compass } from "lucide-react";
import Link from "next/link";

interface ToursInventoryViewProps {
  tours: TourPackageDetail[];
  category?: string;
  duration?: string;
  destination?: string;
  maxPrice?: number;
  sort?: string;
}

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "duration-asc", label: "Duration: Short to Long" },
  { value: "duration-desc", label: "Duration: Long to Short" },
  { value: "rating", label: "Highest Rated" },
];

export default function ToursInventoryView({
  tours,
  category,
  duration,
  destination,
  maxPrice,
  sort,
}: ToursInventoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (newSort) {
      params.set("sort", newSort);
    } else {
      params.delete("sort");
    }
    const qs = params.toString();
    router.push(qs ? `/tours?${qs}` : "/tours", { scroll: false });
  };

  const activeFilterCount = [
    category,
    duration,
    destination,
    maxPrice && maxPrice < 24000 ? maxPrice : null,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* ========================================= */}
        {/* LEFT COLUMN: Filter Sidebar (Desktop)     */}
        {/* ========================================= */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24">
          <ToursFilterSidebar
            category={category}
            duration={duration}
            destination={destination}
            maxPrice={maxPrice}
          />
        </aside>

        {/* ========================================= */}
        {/* MOBILE FILTER MODAL / DRAWER              */}
        {/* ========================================= */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden">
            <div className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <ToursFilterSidebar
                category={category}
                duration={duration}
                destination={destination}
                maxPrice={maxPrice}
                onCloseMobile={() => setMobileFilterOpen(false)}
              />
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* RIGHT COLUMN: Results Header + Tour Grid  */}
        {/* ========================================= */}
        <div className="flex-1 min-w-0 w-full">
          {/* Top Bar: Count + Mobile Filter Trigger + Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[var(--season-border,#E5E7EB)]">
            {/* Dynamic Result Count */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--season-text,#111827)] font-display tracking-tight">
                {tours.length} Kashmir Tour{tours.length === 1 ? "" : "s"} Found
              </h2>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--season-text)] bg-white border border-[var(--season-border)] shadow-2xs hover:bg-slate-50"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--season-primary)]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4.5 h-4.5 rounded-full bg-[var(--season-primary)] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-xs text-[var(--season-muted,#6B7280)] font-medium whitespace-nowrap hidden sm:inline"
                >
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sort || ""}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[var(--season-border)] text-[var(--season-text)] focus:ring-[var(--season-primary)] focus:border-[var(--season-primary)] cursor-pointer shadow-2xs"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tour Cards Grid: 3 columns desktop, 2 columns tablet, 1 column mobile */}
          {tours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {tours.map((tour) => (
                <TourCardCompact key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-slate-50/50 p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto my-6">
              <div className="w-12 h-12 rounded-full bg-[var(--season-primary-light,#ECFDF5)] text-[var(--season-primary)] flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--season-text)] font-display">
                No Tours Match Your Current Filters
              </h3>
              <p className="text-xs sm:text-sm text-[var(--season-muted)] max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find any tour packages matching your exact criteria. Try adjusting your duration, category, or price range.
              </p>
              <div className="pt-2">
                <Link
                  href="/tours"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

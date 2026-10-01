"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowRight,
  Heart,
  Hotel,
  Car,
  Anchor,
  Utensils,
  Compass,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ImageOff,
} from "lucide-react";
import { HELP_ME_CHOOSE_CONFIG } from "@/components/HelpMeChoose";
import {
  FilterTourInclusion,
  FilterTourPackage,
  FILTER_TOURS_CATALOG,
} from "@/data/filterToursData";

export type { FilterTourInclusion, FilterTourPackage };
export { FILTER_TOURS_CATALOG };

// Helper to format Indian Rupee
function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to render inclusion icon
function renderInclusionIcon(type: FilterTourInclusion["type"]) {
  const iconClass = "w-3.5 h-3.5 shrink-0";
  switch (type) {
    case "hotel":
      return <Hotel className={iconClass} style={{ color: "var(--season-secondary)" }} />;
    case "cab":
      return <Car className={iconClass} style={{ color: "var(--season-secondary)" }} />;
    case "houseboat":
      return <Anchor className={iconClass} style={{ color: "var(--season-secondary)" }} />;
    case "meals":
      return <Utensils className={iconClass} style={{ color: "var(--season-secondary)" }} />;
    default:
      return <Compass className={iconClass} style={{ color: "var(--season-secondary)" }} />;
  }
}

// =============================================================================
// MAIN COMPONENT: FilterTours
// =============================================================================
interface FilterToursProps {
  initialTours?: FilterTourPackage[];
}

export default function FilterTours({ initialTours }: FilterToursProps = {}) {
  // Wishlist heart toggle states
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Active filter states
  const [durationFilter, setDurationFilter] = useState<string>("any");
  const [destinationFilter, setDestinationFilter] = useState<string>("any");
  const [travelStyleFilter, setTravelStyleFilter] = useState<string>("any");
  const [monthFilter, setMonthFilter] = useState<string>("any");
  const [budgetFilter, setBudgetFilter] = useState<string>("any");
  const [sortBy, setSortBy] = useState<string>("popular");

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAllFilters = () => {
    setDurationFilter("any");
    setDestinationFilter("any");
    setTravelStyleFilter("any");
    setMonthFilter("any");
    setBudgetFilter("any");
    setSortBy("popular");
  };

  const activeFiltersCount =
    (durationFilter !== "any" ? 1 : 0) +
    (destinationFilter !== "any" ? 1 : 0) +
    (travelStyleFilter !== "any" ? 1 : 0) +
    (monthFilter !== "any" ? 1 : 0) +
    (budgetFilter !== "any" ? 1 : 0);

  const toursList = initialTours && initialTours.length > 0 ? initialTours : FILTER_TOURS_CATALOG;

  // Filtered and sorted tours calculation
  const filteredTours = useMemo(() => {
    return toursList.filter((tour) => {
      // 1. Duration filter
      if (durationFilter !== "any") {
        if (durationFilter === "short" && tour.daysCount > 4) return false;
        if (durationFilter === "medium" && (tour.daysCount < 5 || tour.daysCount > 6)) return false;
        if (durationFilter === "long" && tour.daysCount < 7) return false;
      }

      // 2. Destination filter
      if (destinationFilter !== "any") {
        const matchesDest = tour.destinations.some(
          (d) => d.toLowerCase() === destinationFilter.toLowerCase()
        );
        if (!matchesDest) return false;
      }

      // 3. Travel Style filter
      if (travelStyleFilter !== "any") {
        const matchesStyle = tour.travelStyles.some(
          (s) => s.toLowerCase() === travelStyleFilter.toLowerCase()
        );
        if (!matchesStyle) return false;
      }

      // 4. Month filter
      if (monthFilter !== "any") {
        const matchesMonth =
          tour.months.includes("All") ||
          tour.months.some((m) => m.toLowerCase() === monthFilter.toLowerCase());
        if (!matchesMonth) return false;
      }

      // 5. Budget filter
      if (budgetFilter !== "any") {
        if (budgetFilter === "under15k" && tour.price >= 15000) return false;
        if (budgetFilter === "15k-25k" && (tour.price < 15000 || tour.price > 25000)) return false;
        if (budgetFilter === "25k-35k" && (tour.price < 25000 || tour.price > 35000)) return false;
        if (budgetFilter === "above35k" && tour.price <= 35000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "duration") return a.daysCount - b.daysCount;
      // Default: popular
      return b.reviewsCount - a.reviewsCount;
    });
  }, [durationFilter, destinationFilter, travelStyleFilter, monthFilter, budgetFilter, sortBy]);

  return (
    <section
      aria-labelledby="filter-tours-heading"
      data-analytics-section="filter-tours"
      className="bg-white border-b transition-colors duration-200"
      style={{
        borderColor: "var(--season-border)",
        paddingTop: "8px",
        paddingBottom: "16px",
      }}
    >
      <div
        className="w-full mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: HELP_ME_CHOOSE_CONFIG.containerMaxWidth }}
      >
        {/* ===================================================================
            1. HEADER: Title, Subtitle, & Sort By Dropdown (Ultra-Compact)
        =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 mb-2 sm:mb-2.5">
          <div>
            <h2
              id="filter-tours-heading"
              className="font-display text-lg sm:text-xl font-extrabold text-[#17211D] tracking-tight leading-none"
            >
              Filter Tours
            </h2>
            <p className="text-[11px] text-[#56635E] font-sans mt-0.5 font-medium flex items-center gap-2">
              <span>
                Showing {Math.min(filteredTours.length, 3)} {Math.min(filteredTours.length, 3) === 1 ? "package" : "packages"}
              </span>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors"
                  style={{ color: "var(--season-primary)" }}
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset filters</span>
                </button>
              )}
            </p>
          </div>

          {/* Sort by selector */}
          <div className="flex items-center gap-1 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-[#56635E] whitespace-nowrap">
              Sort by:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort tour packages"
                className="appearance-none bg-white border rounded-lg pl-2 pr-6 py-0.5 text-[11.5px] font-bold text-[#17211D] focus:outline-hidden transition-all cursor-pointer shadow-2xs hover:border-[var(--season-primary)]"
                style={{ borderColor: "var(--season-border)" }}
              >
                <option value="popular">Popular</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#56635E] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. FILTER ROW: 5 Filter Controls (Balanced Text Alignment)
               (Duration, Destination, Travel Style, Month, Budget)
        =================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
          {/* 1. Duration */}
          <div
            className="h-[42px] flex flex-col justify-between bg-white rounded-lg border px-3 py-1.5 shadow-2xs transition-all hover:border-[var(--season-primary)] focus-within:border-[var(--season-primary)]"
            style={{ borderColor: durationFilter !== "any" ? "var(--season-primary)" : "var(--season-border)" }}
          >
            <label htmlFor="filter-duration" className="text-[9px] font-bold text-[#65766F] uppercase tracking-wider block leading-none select-none">
              Duration
            </label>
            <div className="relative flex items-center">
              <select
                id="filter-duration"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full appearance-none bg-transparent text-[11.5px] font-bold text-[#17211D] pr-4 py-0 m-0 border-0 outline-hidden focus:outline-hidden cursor-pointer leading-tight"
              >
                <option value="any">Any</option>
                <option value="short">3 - 4 Days</option>
                <option value="medium">5 - 6 Days</option>
                <option value="long">7+ Days</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#56635E] absolute right-0 pointer-events-none" />
            </div>
          </div>

          {/* 2. Destination */}
          <div
            className="h-[42px] flex flex-col justify-between bg-white rounded-lg border px-3 py-1.5 shadow-2xs transition-all hover:border-[var(--season-primary)] focus-within:border-[var(--season-primary)]"
            style={{ borderColor: destinationFilter !== "any" ? "var(--season-primary)" : "var(--season-border)" }}
          >
            <label htmlFor="filter-destination" className="text-[9px] font-bold text-[#65766F] uppercase tracking-wider block leading-none select-none">
              Destination
            </label>
            <div className="relative flex items-center">
              <select
                id="filter-destination"
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="w-full appearance-none bg-transparent text-[11.5px] font-bold text-[#17211D] pr-4 py-0 m-0 border-0 outline-hidden focus:outline-hidden cursor-pointer leading-tight"
              >
                <option value="any">Any</option>
                <option value="srinagar">Srinagar</option>
                <option value="gulmarg">Gulmarg</option>
                <option value="pahalgam">Pahalgam</option>
                <option value="sonamarg">Sonamarg</option>
                <option value="doodhpathri">Doodhpathri</option>
                <option value="gurez">Gurez Valley</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#56635E] absolute right-0 pointer-events-none" />
            </div>
          </div>

          {/* 3. Travel Style */}
          <div
            className="h-[42px] flex flex-col justify-between bg-white rounded-lg border px-3 py-1.5 shadow-2xs transition-all hover:border-[var(--season-primary)] focus-within:border-[var(--season-primary)]"
            style={{ borderColor: travelStyleFilter !== "any" ? "var(--season-primary)" : "var(--season-border)" }}
          >
            <label htmlFor="filter-style" className="text-[9px] font-bold text-[#65766F] uppercase tracking-wider block leading-none select-none">
              Travel Style
            </label>
            <div className="relative flex items-center">
              <select
                id="filter-style"
                value={travelStyleFilter}
                onChange={(e) => setTravelStyleFilter(e.target.value)}
                className="w-full appearance-none bg-transparent text-[11.5px] font-bold text-[#17211D] pr-4 py-0 m-0 border-0 outline-hidden focus:outline-hidden cursor-pointer leading-tight"
              >
                <option value="any">Any</option>
                <option value="family">Family</option>
                <option value="couples">Couples / Honeymoon</option>
                <option value="adventure">Adventure & Trekking</option>
                <option value="cultural">Cultural & Heritage</option>
                <option value="solo">Solo Travel</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#56635E] absolute right-0 pointer-events-none" />
            </div>
          </div>

          {/* 4. Month */}
          <div
            className="h-[42px] flex flex-col justify-between bg-white rounded-lg border px-3 py-1.5 shadow-2xs transition-all hover:border-[var(--season-primary)] focus-within:border-[var(--season-primary)]"
            style={{ borderColor: monthFilter !== "any" ? "var(--season-primary)" : "var(--season-border)" }}
          >
            <label htmlFor="filter-month" className="text-[9px] font-bold text-[#65766F] uppercase tracking-wider block leading-none select-none">
              Month
            </label>
            <div className="relative flex items-center">
              <select
                id="filter-month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full appearance-none bg-transparent text-[11.5px] font-bold text-[#17211D] pr-4 py-0 m-0 border-0 outline-hidden focus:outline-hidden cursor-pointer leading-tight"
              >
                <option value="any">Any</option>
                <option value="jan">January</option>
                <option value="feb">February</option>
                <option value="mar">March</option>
                <option value="apr">April</option>
                <option value="may">May</option>
                <option value="jun">June</option>
                <option value="jul">July</option>
                <option value="aug">August</option>
                <option value="sep">September</option>
                <option value="oct">October</option>
                <option value="nov">November</option>
                <option value="dec">December</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#56635E] absolute right-0 pointer-events-none" />
            </div>
          </div>

          {/* 5. Budget */}
          <div
            className="col-span-2 sm:col-span-1 h-[42px] flex flex-col justify-between bg-white rounded-lg border px-3 py-1.5 shadow-2xs transition-all hover:border-[var(--season-primary)] focus-within:border-[var(--season-primary)]"
            style={{ borderColor: budgetFilter !== "any" ? "var(--season-primary)" : "var(--season-border)" }}
          >
            <label htmlFor="filter-budget" className="text-[9px] font-bold text-[#65766F] uppercase tracking-wider block leading-none select-none">
              Budget
            </label>
            <div className="relative flex items-center">
              <select
                id="filter-budget"
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="w-full appearance-none bg-transparent text-[11.5px] font-bold text-[#17211D] pr-4 py-0 m-0 border-0 outline-hidden focus:outline-hidden cursor-pointer leading-tight"
              >
                <option value="any">Any</option>
                <option value="under15k">Under ₹15,000</option>
                <option value="15k-25k">₹15,000 - ₹25,000</option>
                <option value="25k-35k">₹25,000 - ₹35,000</option>
                <option value="above35k">Above ₹35,000</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#56635E] absolute right-0 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ===================================================================
            3. CARDS GRID: 3 Compact Cards (100% Fully Visible in Viewport)
        =================================================================== */}
        {filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {filteredTours.slice(0, 3).map((tour) => {
              const isFav = favorites[tour.id];

              return (
                <div
                  key={tour.id}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--season-primary)]"
                  style={{
                    borderColor: "var(--season-border)",
                  }}
                >
                  {/* Image Container with Tag and Floating Heart (Calibrated Height: 120-128px) */}
                  <div className="relative w-full h-28 sm:h-32 overflow-hidden shrink-0 bg-slate-100">
                    {tour.imageUrl && tour.imageUrl.trim() ? (
                      <Image
                        src={tour.imageUrl}
                        alt={tour.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-1 p-2 text-center select-none border-b border-slate-100">
                        <ImageOff className="w-5 h-5 text-slate-400 stroke-[1.5]" aria-hidden="true" />
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                          Image yet to be assigned
                        </span>
                      </div>
                    )}

                    {/* Single Tag on Image (Top Left) */}
                    {tour.badge && (
                      <div className="absolute top-1.5 left-1.5 z-10">
                        <span
                          className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider text-white shadow-xs"
                          style={{ backgroundColor: "var(--season-primary)" }}
                        >
                          {tour.badge}
                        </span>
                      </div>
                    )}

                    {/* Wishlist Heart Button (Top Right - Thin Outline Floating) */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, tour.id)}
                      aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                      className="absolute top-1.5 right-1.5 z-10 p-1 cursor-pointer transition-transform duration-200 hover:scale-115 active:scale-90 focus:outline-hidden group/heart"
                    >
                      <Heart
                        strokeWidth={1.8}
                        className={`w-4.5 h-4.5 transition-all duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
                          isFav
                            ? "fill-[var(--season-primary)] stroke-[var(--season-primary)] scale-105"
                            : "stroke-white fill-black/35 group-hover/heart:fill-[var(--season-primary)] group-hover/heart:stroke-[var(--season-primary)]"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Body (Ultra-Crisp, Fully Visible) */}
                  <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Duration */}
                      <span className="text-[10.5px] text-[#56635E] font-medium block">
                        {tour.duration}
                      </span>

                      {/* Title */}
                      <h3 className="font-display font-extrabold text-[14px] sm:text-[14.5px] text-[#17211D] group-hover:text-[var(--season-primary)] transition-colors duration-200 leading-tight mt-0.5">
                        <Link href={`/tours/${tour.slug}`} className="focus:outline-hidden">
                          {tour.title}
                        </Link>
                      </h3>

                      {/* Route Path with Arrows */}
                      <div className="flex items-center gap-1 flex-wrap text-[10.5px] text-[#56635E] mt-0.5">
                        {tour.route.map((city, idx) => (
                          <React.Fragment key={city}>
                            <span className="font-medium">{city}</span>
                            {idx < tour.route.length - 1 && (
                              <ArrowRight className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Star Rating & Review Count */}
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-bold text-[#17211D]">
                          {tour.rating.toFixed(1)}
                        </span>
                        <span className="text-[10.5px] text-[#56635E]">
                          ({tour.reviewsCount})
                        </span>
                      </div>

                      {/* Inclusions 2x2 Grid (1 2 / 3 4) */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1.5 pt-1.5 border-t border-slate-100">
                        {tour.inclusions.slice(0, 4).map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-1 min-w-0"
                          >
                            {renderInclusionIcon(item.type)}
                            <span
                              className="font-medium text-[10.5px] text-[#2C3834] truncate"
                              title={item.label}
                            >
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Price & View Itinerary CTA */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[15px] sm:text-[16px] font-black text-[#17211D] leading-none">
                          {formatINR(tour.price)}
                        </span>
                        <span className="text-[10px] text-[#56635E] font-medium">
                          /person
                        </span>
                      </div>

                      <Link
                        href={`/tours/${tour.slug}`}
                        className="btn-season-primary inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs transition-all duration-200 active:scale-95 group/btn"
                      >
                        <span>View Itinerary</span>
                        <ArrowRight className="w-2.5 h-2.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state when no packages match the filters */
          <div className="bg-slate-50 border border-dashed rounded-2xl p-8 sm:p-12 text-center" style={{ borderColor: "var(--season-border)" }}>
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 bg-white shadow-xs">
              <Sparkles className="w-6 h-6" style={{ color: "var(--season-primary)" }} />
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-[#17211D]">
              No packages match these specific filters
            </h3>
            <p className="text-xs sm:text-sm text-[#56635E] mt-1 max-w-md mx-auto">
              Try adjusting your duration, destination, or budget criteria to explore more Kashmir itineraries.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="btn-season-primary mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

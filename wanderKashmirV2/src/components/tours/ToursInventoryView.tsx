"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TourPackageDetail } from "@/data/liveToursData";
import TourCardCompact from "./TourCardCompact";
import ToursFilterSidebar, { TourCategoryFilterOption, TravelStyleFilterOption } from "./ToursFilterSidebar";
import { SlidersHorizontal, RotateCcw, Compass } from "lucide-react";

interface ToursInventoryViewProps {
  tours: TourPackageDetail[];
  categories?: TourCategoryFilterOption[];
  travelStyles?: TravelStyleFilterOption[];
  category?: string;
  style?: string;
  duration?: string;
  destination?: string;
  maxPrice?: number;
  minPriceBound?: number;
  maxPriceBound?: number;
  availableDurations?: { value: string; label: string; count?: number }[];
  availableDestinations?: { name: string; label: string }[];
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

/**
 * Isolated Client Component that reads useSearchParams.
 * Wrapped in <Suspense> so the parent ToursInventoryView and the entire
 * tours catalog can be statically prerendered into the initial HTML.
 */
function ToursUrlSync({
  onSync,
}: {
  onSync: (filters: {
    category?: string;
    style?: string;
    duration?: string;
    destination?: string;
    maxPrice?: number | null;
    sort?: string;
  }) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const category = searchParams.get("category") || "";
      const style = searchParams.get("style") || "";
      const duration = searchParams.get("duration") || "";
      const destination = searchParams.get("destination") || "";
      const maxPriceStr = searchParams.get("maxPrice");
      const maxPrice = maxPriceStr ? parseInt(maxPriceStr, 10) : null;
      const sort = searchParams.get("sort") || "";
      onSync({ category, style, duration, destination, maxPrice, sort });
    }
  }, [searchParams, onSync]);

  return null;
}

export default function ToursInventoryView({
  tours,
  categories,
  travelStyles,
  category,
  style,
  duration,
  destination,
  maxPrice,
  minPriceBound,
  maxPriceBound,
  availableDurations,
  availableDestinations,
  sort,
}: ToursInventoryViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>(() => category || "");
  const [activeStyle, setActiveStyle] = useState<string>(() => style || "");
  const [activeDuration, setActiveDuration] = useState<string>(() => duration || "");
  const [activeDestination, setActiveDestination] = useState<string>(() => destination || "");
  const [activeMaxPrice, setActiveMaxPrice] = useState<number | null>(() => maxPrice ?? null);
  const [activeSort, setActiveSort] = useState<string>(() => sort || "");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Synchronize state when browser Back/Forward (popstate) occurs
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      setActiveCategory(urlParams.get("category") || "");
      setActiveStyle(urlParams.get("style") || "");
      setActiveDuration(urlParams.get("duration") || "");
      setActiveDestination(urlParams.get("destination") || "");
      const p = urlParams.get("maxPrice");
      setActiveMaxPrice(p ? parseInt(p, 10) : null);
      setActiveSort(urlParams.get("sort") || "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update browser URL query params without triggering a full server reload
  const updateUrlParams = useCallback((newFilters: {
    category?: string | null;
    style?: string | null;
    duration?: string | null;
    destination?: string | null;
    maxPrice?: number | null;
    sort?: string | null;
  }) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (newFilters.category && newFilters.category !== "all") params.set("category", newFilters.category);
    if (newFilters.style && newFilters.style !== "all") params.set("style", newFilters.style);
    if (newFilters.duration) params.set("duration", newFilters.duration);
    if (newFilters.destination) params.set("destination", newFilters.destination);
    if (newFilters.maxPrice !== null && newFilters.maxPrice !== undefined) {
      params.set("maxPrice", String(newFilters.maxPrice));
    }
    if (newFilters.sort) params.set("sort", newFilters.sort);

    const qs = params.toString();
    const pathname = window.location.pathname;
    const newPath = qs ? `${pathname}?${qs}` : pathname;
    window.history.pushState(null, "", newPath);
  }, []);

  // Synchronize state from isolated ToursUrlSync component
  const handleUrlSync = useCallback(
    (filters: {
      category?: string;
      style?: string;
      duration?: string;
      destination?: string;
      maxPrice?: number | null;
      sort?: string;
    }) => {
      setActiveCategory(filters.category || "");
      setActiveStyle(filters.style || "");
      setActiveDuration(filters.duration || "");
      setActiveDestination(filters.destination || "");
      setActiveMaxPrice(filters.maxPrice ?? null);
      setActiveSort(filters.sort || "");
    },
    []
  );

  const handleFilterChange = useCallback((newParams: Record<string, string | null>) => {
    setActiveCategory((prev) => ("category" in newParams ? (newParams.category || "") : prev));
    setActiveStyle((prev) => ("style" in newParams ? (newParams.style || "") : prev));
    setActiveDuration((prev) => ("duration" in newParams ? (newParams.duration || "") : prev));
    setActiveDestination((prev) => ("destination" in newParams ? (newParams.destination || "") : prev));
    setActiveMaxPrice((prev) => {
      if ("maxPrice" in newParams) {
        return newParams.maxPrice ? parseInt(newParams.maxPrice, 10) : null;
      }
      return prev;
    });

    const nextCategory = "category" in newParams ? (newParams.category || "") : activeCategory;
    const nextStyle = "style" in newParams ? (newParams.style || "") : activeStyle;
    const nextDuration = "duration" in newParams ? (newParams.duration || "") : activeDuration;
    const nextDestination = "destination" in newParams ? (newParams.destination || "") : activeDestination;
    const nextMaxPrice = "maxPrice" in newParams ? (newParams.maxPrice ? parseInt(newParams.maxPrice, 10) : null) : activeMaxPrice;

    updateUrlParams({
      category: nextCategory,
      style: nextStyle,
      duration: nextDuration,
      destination: nextDestination,
      maxPrice: nextMaxPrice,
      sort: activeSort,
    });
  }, [activeCategory, activeStyle, activeDuration, activeDestination, activeMaxPrice, activeSort, updateUrlParams]);

  const handleSortChange = (newSort: string) => {
    setActiveSort(newSort);
    updateUrlParams({
      category: activeCategory,
      style: activeStyle,
      duration: activeDuration,
      destination: activeDestination,
      maxPrice: activeMaxPrice,
      sort: newSort,
    });
  };

  const handleResetFilters = () => {
    setActiveCategory("");
    setActiveStyle("");
    setActiveDuration("");
    setActiveDestination("");
    setActiveMaxPrice(null);
    setActiveSort("");
    updateUrlParams({
      category: null,
      style: null,
      duration: null,
      destination: null,
      maxPrice: null,
      sort: null,
    });
  };

  // Filter and sort catalog in-memory
  const filteredTours = useMemo(() => {
    let result = [...tours];

    // Resolve Category filter
    let matchedCategoryId: string | undefined = undefined;
    let resolvedCategorySlug: string | undefined = undefined;
    let resolvedStyleSlug = activeStyle && activeStyle !== "all" ? activeStyle.toLowerCase().trim() : undefined;

    if (activeCategory && activeCategory !== "all") {
      const cleanCat = activeCategory.toLowerCase().trim();
      const matchedCat = categories?.find(
        (c) => c.slug.toLowerCase() === cleanCat || c.id === activeCategory
      );
      if (matchedCat) {
        matchedCategoryId = matchedCat.id;
        resolvedCategorySlug = matchedCat.slug;
      } else if (!resolvedStyleSlug && travelStyles?.some((s) => s.slug.toLowerCase() === cleanCat)) {
        resolvedStyleSlug = cleanCat;
      } else {
        resolvedCategorySlug = cleanCat;
      }
    }

    if (matchedCategoryId || resolvedCategorySlug) {
      result = result.filter((t) => {
        if (matchedCategoryId && (t.categoryId === matchedCategoryId || t.tourCategory?.id === matchedCategoryId)) return true;
        if (resolvedCategorySlug && t.tourCategory?.slug?.toLowerCase() === resolvedCategorySlug.toLowerCase()) return true;
        if (resolvedCategorySlug && t.category?.toLowerCase() === resolvedCategorySlug.toLowerCase()) return true;
        return false;
      });
    }

    if (resolvedStyleSlug) {
      result = result.filter((t) => {
        if (Array.isArray(t.travelStyles) && t.travelStyles.length > 0) {
          const hasStyle = t.travelStyles.some(
            (ts) => ts.travelStyle?.slug?.toLowerCase() === resolvedStyleSlug
          );
          if (hasStyle) return true;
        }
        if (t.badge?.toLowerCase() === resolvedStyleSlug) return true;
        if (t.category?.toLowerCase() === resolvedStyleSlug) return true;
        return false;
      });
    }

    if (activeDuration) {
      const dur = activeDuration.toLowerCase().trim();
      const durNum = parseInt(dur, 10);
      if (!isNaN(durNum)) {
        if (dur === "2" || dur.includes("weekend")) {
          result = result.filter((t) => t.daysCount <= 2);
        } else if (dur.includes("short")) {
          result = result.filter((t) => t.daysCount >= 3 && t.daysCount <= 4);
        } else if (dur.includes("week")) {
          result = result.filter((t) => t.daysCount >= 5);
        } else {
          result = result.filter((t) => t.daysCount === durNum);
        }
      } else if (dur.includes("weekend")) {
        result = result.filter((t) => t.daysCount <= 2);
      } else if (dur.includes("short")) {
        result = result.filter((t) => t.daysCount >= 3 && t.daysCount <= 4);
      } else if (dur.includes("week")) {
        result = result.filter((t) => t.daysCount >= 5);
      }
    }

    if (activeDestination) {
      const dest = activeDestination.toLowerCase().trim();
      result = result.filter((t) =>
        t.destinations.some((d) => d.toLowerCase().includes(dest))
      );
    }

    if (activeMaxPrice) {
      result = result.filter((t) => t.price <= activeMaxPrice);
    }

    if (activeSort) {
      switch (activeSort) {
        case "price-asc":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          result.sort((a, b) => b.price - a.price);
          break;
        case "duration-asc":
          result.sort((a, b) => a.daysCount - b.daysCount);
          break;
        case "duration-desc":
          result.sort((a, b) => b.daysCount - a.daysCount);
          break;
        case "rating":
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          break;
      }
    }

    return result;
  }, [tours, categories, travelStyles, activeCategory, activeStyle, activeDuration, activeDestination, activeMaxPrice, activeSort]);

  const activeFilterCount = [
    activeCategory,
    activeStyle,
    activeDuration,
    activeDestination,
    activeMaxPrice && activeMaxPrice < (maxPriceBound ?? 50000) ? activeMaxPrice : null,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Isolated URL search params listener wrapped in Suspense for static prerendering */}
      <Suspense fallback={null}>
        <ToursUrlSync onSync={handleUrlSync} />
      </Suspense>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* ========================================= */}
        {/* LEFT COLUMN: Filter Sidebar (Desktop)     */}
        {/* ========================================= */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24">
          <ToursFilterSidebar
            categories={categories}
            travelStyles={travelStyles}
            category={activeCategory}
            style={activeStyle}
            duration={activeDuration}
            destination={activeDestination}
            maxPrice={activeMaxPrice ?? undefined}
            minPriceBound={minPriceBound}
            maxPriceBound={maxPriceBound}
            availableDurations={availableDurations}
            availableDestinations={availableDestinations}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* ========================================= */}
        {/* MOBILE FILTER MODAL / DRAWER              */}
        {/* ========================================= */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden">
            <div className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <ToursFilterSidebar
                categories={categories}
                travelStyles={travelStyles}
                category={activeCategory}
                style={activeStyle}
                duration={activeDuration}
                destination={activeDestination}
                maxPrice={activeMaxPrice ?? undefined}
                minPriceBound={minPriceBound}
                maxPriceBound={maxPriceBound}
                availableDurations={availableDurations}
                availableDestinations={availableDestinations}
                onCloseMobile={() => setMobileFilterOpen(false)}
                onFilterChange={handleFilterChange}
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
                {filteredTours.length} Kashmir Tour{filteredTours.length === 1 ? "" : "s"} Found
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
                  value={activeSort || ""}
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
          {filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {filteredTours.map((tour) => (
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
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

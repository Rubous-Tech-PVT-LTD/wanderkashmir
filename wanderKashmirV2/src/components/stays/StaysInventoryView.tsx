"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Home,
  Check,
} from "lucide-react";
import StayCard, { StayPropertyItem } from "./StayCard";
import StaysFilterSidebar, { FilterCountOption } from "./StaysFilterSidebar";

interface StaysInventoryViewProps {
  initialProperties: StayPropertyItem[];
  initialType?: string;
  initialLocation?: string;
  initialMaxPrice?: number | null;
}

export default function StaysInventoryView({
  initialProperties,
  initialType,
  initialLocation,
  initialMaxPrice,
}: StaysInventoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Normalize initial inputs
  const parseType = (val?: string | null) => {
    if (!val) return "ALL";
    const lower = val.toLowerCase();
    if (lower.includes("resort")) return "RESORT";
    if (lower.includes("houseboat")) return "HOUSEBOAT";
    if (lower.includes("homestay")) return "HOMESTAY";
    if (lower.includes("hotel")) return "HOTEL";
    return val.toUpperCase();
  };

  const [activeType, setActiveType] = useState<string>(() => parseType(initialType || searchParams?.get("type")));
  const [activeLocation, setActiveLocation] = useState<string>(() => initialLocation || searchParams?.get("location") || "ALL");
  const [activeMaxPrice, setActiveMaxPrice] = useState<number | null>(() => {
    if (initialMaxPrice) return initialMaxPrice;
    const p = searchParams?.get("maxPrice");
    return p ? parseInt(p, 10) : null;
  });
  const [activeAmenities, setActiveAmenities] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Helper to categorize any property based on Property.propertyType
  const getPropertyCategory = (prop: StayPropertyItem) => {
    if (prop.propertyType) {
      const pt = prop.propertyType.toUpperCase();
      if (pt === "RESORT") return "RESORT";
      if (pt === "HOTEL") return "HOTEL";
      if (pt === "HOUSEBOAT") return "HOUSEBOAT";
      if (pt === "HOMESTAY") return "HOMESTAY";
    }
    if (
      prop.name.toLowerCase().includes("houseboat") ||
      prop.location.toLowerCase().includes("lake") ||
      prop.location.toLowerCase().includes("nigeen") ||
      prop.location.toLowerCase().includes("dal")
    ) {
      return "HOUSEBOAT";
    }
    if (prop.vendorType === "HOMESTAY") return "HOMESTAY";
    return "HOTEL";
  };

  // Helper to extract clean destination hub from location string
  const getPropertyHub = (prop: StayPropertyItem) => {
    const locLower = prop.location.toLowerCase();
    if (locLower.includes("pahalgam") || locLower.includes("phalgham")) return "Pahalgam";
    if (locLower.includes("srinagar") || locLower.includes("dal lake") || locLower.includes("nigeen")) return "Srinagar";
    if (locLower.includes("gulmarg")) return "Gulmarg";
    if (locLower.includes("sonamarg")) return "Sonamarg";
    if (locLower.includes("gurez")) return "Gurez Valley";
    if (locLower.includes("doodhpathri")) return "Doodhpathri";
    if (locLower.includes("kupwara") || locLower.includes("keran")) return "Kupwara";
    return "Other";
  };

  // 1. Calculate filter counts dynamically across all properties
  const { typeOptions, locationOptions, availableAmenities, maxPriceLimit } = useMemo(() => {
    let hotelCount = 0;
    let resortCount = 0;
    let houseboatCount = 0;
    let homestayCount = 0;
    const locMap: Record<string, number> = {};
    const amenitySet = new Set<string>();
    let maxPrice = 0;

    initialProperties.forEach((p) => {
      const cat = getPropertyCategory(p);
      if (cat === "RESORT") resortCount++;
      else if (cat === "HOUSEBOAT") houseboatCount++;
      else if (cat === "HOMESTAY") homestayCount++;
      else hotelCount++;

      const hub = getPropertyHub(p);
      locMap[hub] = (locMap[hub] || 0) + 1;

      if (p.pricePerNight > maxPrice) maxPrice = p.pricePerNight;

      (p.amenities || []).forEach((am) => {
        if (am && am.trim()) amenitySet.add(am.trim());
      });
    });

    const types: FilterCountOption[] = [
      { key: "ALL", name: "All Accommodations", count: initialProperties.length },
      { key: "HOTEL", name: "Hotels", count: hotelCount },
      { key: "RESORT", name: "Resorts", count: resortCount },
      { key: "HOUSEBOAT", name: "Lake Houseboats", count: houseboatCount },
      { key: "HOMESTAY", name: "Heritage Homestays", count: homestayCount },
    ];

    const popularHubs = ["Srinagar", "Pahalgam", "Gurez Valley", "Doodhpathri", "Kupwara", "Gulmarg", "Sonamarg"];
    const locs: FilterCountOption[] = [
      { key: "ALL", name: "All Kashmir Destinations", count: initialProperties.length },
      ...popularHubs
        .filter((hub) => locMap[hub] > 0)
        .map((hub) => ({
          key: hub,
          name: hub,
          count: locMap[hub] || 0,
        })),
    ];

    return {
      typeOptions: types,
      locationOptions: locs,
      availableAmenities: Array.from(amenitySet).slice(0, 8),
      maxPriceLimit: maxPrice || 10000,
    };
  }, [initialProperties]);

  // 2. Synchronize URL query params quietly
  const updateUrlParams = (newType: string, newLoc: string, newMaxPrice: number | null) => {
    const params = new URLSearchParams();
    if (newType !== "ALL") params.set("type", newType.toLowerCase());
    if (newLoc !== "ALL") params.set("location", newLoc);
    if (newMaxPrice !== null) params.set("maxPrice", newMaxPrice.toString());

    const qs = params.toString();
    const newPath = qs ? `/stays?${qs}` : "/stays";
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", newPath);
    }
  };

  // Filter handlers
  const handleSelectType = (typeKey: string) => {
    setActiveType(typeKey);
    updateUrlParams(typeKey, activeLocation, activeMaxPrice);
  };

  const handleSelectLocation = (locKey: string) => {
    setActiveLocation(locKey);
    updateUrlParams(activeType, locKey, activeMaxPrice);
  };

  const handleSelectMaxPrice = (price: number | null) => {
    setActiveMaxPrice(price);
    updateUrlParams(activeType, activeLocation, price);
  };

  const handleToggleAmenity = (amenity: string) => {
    setActiveAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetAll = () => {
    setActiveType("ALL");
    setActiveLocation("ALL");
    setActiveMaxPrice(null);
    setActiveAmenities([]);
    setSearchQuery("");
    setSortBy("recommended");
    updateUrlParams("ALL", "ALL", null);
  };

  // 3. Filtered and Sorted properties
  const filteredProperties = useMemo(() => {
    let result = [...initialProperties];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (activeType !== "ALL") {
      result = result.filter((p) => getPropertyCategory(p) === activeType);
    }

    // Location filter
    if (activeLocation !== "ALL") {
      result = result.filter((p) => getPropertyHub(p).toLowerCase() === activeLocation.toLowerCase());
    }

    // Price filter
    if (activeMaxPrice !== null) {
      result = result.filter((p) => p.pricePerNight <= activeMaxPrice);
    }

    // Amenities filter
    if (activeAmenities.length > 0) {
      result = result.filter((p) =>
        activeAmenities.every((reqAm) =>
          (p.amenities || []).some((am) => am.toLowerCase() === reqAm.toLowerCase())
        )
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case "price-desc":
        result.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        break;
      case "recommended":
      default:
        // Prioritize properties with verified photography and rich amenity counts
        result.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
        break;
    }

    return result;
  }, [
    initialProperties,
    searchQuery,
    activeType,
    activeLocation,
    activeMaxPrice,
    activeAmenities,
    sortBy,
  ]);

  const activeFiltersCount =
    (activeType !== "ALL" ? 1 : 0) +
    (activeLocation !== "ALL" ? 1 : 0) +
    (activeMaxPrice !== null ? 1 : 0) +
    activeAmenities.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Search Bar & Quick Bar */}
      <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-white border border-[var(--season-border,#E5E7EB)] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hotel name, landmark, or location (e.g. Pahalgam, Nigeen Lake)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <button
          type="button"
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[var(--season-primary)] text-white text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* ========================================= */}
        {/* LEFT COLUMN: Filter Sidebar (Desktop)     */}
        {/* ========================================= */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24">
          <StaysFilterSidebar
            activeType={activeType}
            activeLocation={activeLocation}
            activeMaxPrice={activeMaxPrice}
            activeAmenities={activeAmenities}
            types={typeOptions}
            locations={locationOptions}
            availableAmenities={availableAmenities}
            maxPriceLimit={maxPriceLimit}
            onSelectType={handleSelectType}
            onSelectLocation={handleSelectLocation}
            onSelectMaxPrice={handleSelectMaxPrice}
            onToggleAmenity={handleToggleAmenity}
            onResetAll={handleResetAll}
          />
        </aside>

        {/* ========================================= */}
        {/* MOBILE DRAWER MODAL                        */}
        {/* ========================================= */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden">
            <div className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--season-border,#E5E7EB)] mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--season-primary)]" />
                  <h3 className="text-base font-bold text-[var(--season-text,#111827)] font-display">
                    Filter Kashmir Stays
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-black rounded-lg cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <StaysFilterSidebar
                activeType={activeType}
                activeLocation={activeLocation}
                activeMaxPrice={activeMaxPrice}
                activeAmenities={activeAmenities}
                types={typeOptions}
                locations={locationOptions}
                availableAmenities={availableAmenities}
                maxPriceLimit={maxPriceLimit}
                onSelectType={handleSelectType}
                onSelectLocation={handleSelectLocation}
                onSelectMaxPrice={handleSelectMaxPrice}
                onToggleAmenity={handleToggleAmenity}
                onResetAll={handleResetAll}
                onCloseMobile={() => setMobileFilterOpen(false)}
              />

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                  style={{ backgroundColor: "var(--season-primary)" }}
                >
                  Apply & View {filteredProperties.length} Stays
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* RIGHT COLUMN: Results Header + Grid       */}
        {/* ========================================= */}
        <div className="flex-1 min-w-0 w-full">
          {/* Top Bar: Count + Active Filter Pills + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[var(--season-border,#E5E7EB)]">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--season-text,#111827)] font-display tracking-tight">
                {filteredProperties.length} Stay{filteredProperties.length === 1 ? "" : "s"} & Resorts Found
              </h2>

              {/* Active Filter Pills */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">Filtered by:</span>

                  {activeType !== "ALL" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary)] border border-[var(--season-primary)]/20">
                      <span>{activeType === "HOTEL" ? "Hotels" : activeType === "RESORT" ? "Resorts" : activeType === "HOUSEBOAT" ? "Houseboats" : "Homestays"}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectType("ALL")}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {activeLocation !== "ALL" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span>{activeLocation}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectLocation("ALL")}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {activeMaxPrice !== null && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <span>Under ₹{activeMaxPrice.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleSelectMaxPrice(null)}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {activeAmenities.map((am) => (
                    <span
                      key={am}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <span>{am}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAmenity(am)}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-[11px] font-semibold text-[var(--season-primary)] hover:underline flex items-center gap-0.5 ml-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear all</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <label htmlFor="sort-select" className="text-xs text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort:</span>
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden focus:border-[var(--season-primary)]"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Cards Grid or Empty State */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <StayCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Home className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 font-display">
                  No accommodations match your filter criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We couldn't find any stays matching your selected combination of property type, destination, and budget. Try loosening your filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-2xs hover:shadow-xs cursor-pointer transition-all"
                style={{ backgroundColor: "var(--season-primary)" }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

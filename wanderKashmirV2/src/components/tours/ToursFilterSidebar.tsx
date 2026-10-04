"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, RotateCcw, X, SlidersHorizontal } from "lucide-react";

export interface TourCategoryFilterOption {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

export interface TravelStyleFilterOption {
  id: string;
  name: string;
  slug: string;
}

interface ToursFilterSidebarProps {
  categories?: TourCategoryFilterOption[];
  travelStyles?: TravelStyleFilterOption[];
  category?: string;
  style?: string;
  duration?: string;
  destination?: string;
  maxPrice?: number;
  onCloseMobile?: () => void;
}

const DEFAULT_CATEGORIES: TourCategoryFilterOption[] = [
  { id: "cmsn21tdo0000xem8q480rezs", name: "Classic Kashmir", slug: "classic-kashmir", displayOrder: 1 },
];

const DEFAULT_TRAVEL_STYLES: TravelStyleFilterOption[] = [
  { id: "style-1", slug: "culture", name: "Culture" },
  { id: "style-2", slug: "spiritual", name: "Spiritual" },
  { id: "style-3", slug: "nature", name: "Nature" },
  { id: "style-4", slug: "family", name: "Family" },
  { id: "style-5", slug: "adventure", name: "Adventure" },
  { id: "style-6", slug: "trekking", name: "Trekking" },
];

const DURATIONS = [
  { value: "2", label: "2 Days" },
  { value: "3", label: "3 Days" },
  { value: "4", label: "4 Days" },
  { value: "5", label: "5 Days" },
  { value: "6", label: "6 Days" },
  { value: "7", label: "7 Days" },
];

const DESTINATIONS = [
  { name: "Srinagar", label: "Srinagar" },
  { name: "Gulmarg", label: "Gulmarg" },
  { name: "Pahalgam", label: "Pahalgam" },
  { name: "Sonamarg", label: "Sonamarg" },
];

const MIN_TOUR_PRICE = 6999;
const MAX_TOUR_PRICE = 24000;

export default function ToursFilterSidebar({
  categories = DEFAULT_CATEGORIES,
  travelStyles = DEFAULT_TRAVEL_STYLES,
  category,
  style,
  duration,
  destination,
  maxPrice,
  onCloseMobile,
}: ToursFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Accordion state
  const [openTourCategories, setOpenTourCategories] = useState(false);
  const [openTravelStyles, setOpenTravelStyles] = useState(false);
  const [openDuration, setOpenDuration] = useState(false);
  const [openDestinations, setOpenDestinations] = useState(false);
  const [openPrice, setOpenPrice] = useState(true);

  // Local price state for smooth slider dragging
  const currentMaxPrice = maxPrice ? Number(maxPrice) : MAX_TOUR_PRICE;
  const [localPrice, setLocalPrice] = useState<number>(currentMaxPrice);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `/tours?${queryString}` : "/tours", { scroll: false });
  };

  const handleCategoryToggle = (slug: string) => {
    if (category?.toLowerCase() === slug.toLowerCase()) {
      updateFilters({ category: null });
    } else {
      updateFilters({ category: slug });
    }
  };

  const handleStyleToggle = (styleSlug: string) => {
    if (style?.toLowerCase() === styleSlug.toLowerCase()) {
      updateFilters({ style: null });
    } else {
      updateFilters({ style: styleSlug });
    }
  };

  const handleDurationToggle = (val: string) => {
    if (duration === val) {
      updateFilters({ duration: null });
    } else {
      updateFilters({ duration: val });
    }
  };

  const handleDestinationToggle = (dest: string) => {
    if (destination?.toLowerCase() === dest.toLowerCase()) {
      updateFilters({ destination: null });
    } else {
      updateFilters({ destination: dest });
    }
  };

  const handlePriceChange = (val: number) => {
    setLocalPrice(val);
  };

  const handlePriceCommit = () => {
    if (localPrice >= MAX_TOUR_PRICE) {
      updateFilters({ maxPrice: null });
    } else {
      updateFilters({ maxPrice: String(localPrice) });
    }
  };

  const clearAllFilters = () => {
    setLocalPrice(MAX_TOUR_PRICE);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.delete("category");
    params.delete("style");
    params.delete("duration");
    params.delete("destination");
    params.delete("maxPrice");
    const qs = params.toString();
    router.push(qs ? `/tours?${qs}` : "/tours", { scroll: false });
  };

  const hasActiveFilters = Boolean(
    category || style || duration || destination || (maxPrice && maxPrice < MAX_TOUR_PRICE)
  );

  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const displayStyles = travelStyles.length > 0 ? travelStyles : DEFAULT_TRAVEL_STYLES;

  return (
    <div className="bg-white rounded-2xl border border-[var(--season-border,#E5E7EB)] p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[var(--season-border,#E5E7EB)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--season-primary)]" />
          <h3 className="text-base font-bold text-[var(--season-text,#111827)] font-display">
            Filter Tours
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-[var(--season-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close filters"
              className="p-1 text-[var(--season-muted,#6B7280)] hover:text-black lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. TOUR CATEGORIES ACCORDION (FIRST) */}
      <div className="border-b border-[var(--season-border,#F3F4F6)] pb-4">
        <button
          type="button"
          onClick={() => setOpenTourCategories(!openTourCategories)}
          className="w-full flex items-center justify-between py-1 text-sm font-bold text-[var(--season-text,#111827)]"
        >
          <span>Tour Categories</span>
          {openTourCategories ? (
            <ChevronUp className="w-4 h-4 text-[var(--season-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--season-muted)]" />
          )}
        </button>

        {openTourCategories && (
          <div className="mt-3 space-y-2.5">
            {displayCategories.map((cat) => {
              const isChecked =
                category?.toLowerCase() === cat.slug.toLowerCase() ||
                category === cat.id;
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-2.5 text-xs text-[var(--season-text,#374151)] font-medium cursor-pointer hover:text-[var(--season-primary)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat.slug)}
                    className="w-4 h-4 rounded text-[var(--season-primary)] border-[var(--season-border)] focus:ring-[var(--season-primary)] cursor-pointer"
                  />
                  <span>{cat.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. HELP ME CHOOSE (TRAVEL STYLES) ACCORDION (SECOND) */}
      <div className="border-b border-[var(--season-border,#F3F4F6)] pb-4">
        <button
          type="button"
          onClick={() => setOpenTravelStyles(!openTravelStyles)}
          className="w-full flex items-center justify-between py-1 text-sm font-bold text-[var(--season-text,#111827)]"
        >
          <span>Help Me Choose (Travel Styles)</span>
          {openTravelStyles ? (
            <ChevronUp className="w-4 h-4 text-[var(--season-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--season-muted)]" />
          )}
        </button>

        {openTravelStyles && (
          <div className="mt-3 space-y-2.5">
            {displayStyles.map((styleItem) => {
              const isChecked = style?.toLowerCase() === styleItem.slug.toLowerCase();
              return (
                <label
                  key={styleItem.slug}
                  className="flex items-center gap-2.5 text-xs text-[var(--season-text,#374151)] font-medium cursor-pointer hover:text-[var(--season-primary)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleStyleToggle(styleItem.slug)}
                    className="w-4 h-4 rounded text-[var(--season-primary)] border-[var(--season-border)] focus:ring-[var(--season-primary)] cursor-pointer"
                  />
                  <span>{styleItem.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Duration Accordion */}
      <div className="border-b border-[var(--season-border,#F3F4F6)] pb-4">
        <button
          type="button"
          onClick={() => setOpenDuration(!openDuration)}
          className="w-full flex items-center justify-between py-1 text-sm font-bold text-[var(--season-text,#111827)]"
        >
          <span>Duration</span>
          {openDuration ? <ChevronUp className="w-4 h-4 text-[var(--season-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--season-muted)]" />}
        </button>

        {openDuration && (
          <div className="mt-3 space-y-2.5">
            {DURATIONS.map((dur) => {
              const isChecked = duration === dur.value;
              return (
                <label
                  key={dur.value}
                  className="flex items-center gap-2.5 text-xs text-[var(--season-text,#374151)] font-medium cursor-pointer hover:text-[var(--season-primary)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleDurationToggle(dur.value)}
                    className="w-4 h-4 rounded text-[var(--season-primary)] border-[var(--season-border)] focus:ring-[var(--season-primary)] cursor-pointer"
                  />
                  <span>{dur.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Destinations Accordion */}
      <div className="border-b border-[var(--season-border,#F3F4F6)] pb-4">
        <button
          type="button"
          onClick={() => setOpenDestinations(!openDestinations)}
          className="w-full flex items-center justify-between py-1 text-sm font-bold text-[var(--season-text,#111827)]"
        >
          <span>Destinations</span>
          {openDestinations ? <ChevronUp className="w-4 h-4 text-[var(--season-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--season-muted)]" />}
        </button>

        {openDestinations && (
          <div className="mt-3 space-y-2.5">
            {DESTINATIONS.map((dest) => {
              const isChecked = destination?.toLowerCase() === dest.name.toLowerCase();
              return (
                <label
                  key={dest.name}
                  className="flex items-center gap-2.5 text-xs text-[var(--season-text,#374151)] font-medium cursor-pointer hover:text-[var(--season-primary)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleDestinationToggle(dest.name)}
                    className="w-4 h-4 rounded text-[var(--season-primary)] border-[var(--season-border)] focus:ring-[var(--season-primary)] cursor-pointer"
                  />
                  <span>{dest.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Price Range (Per Person) Accordion */}
      <div className="pb-1">
        <button
          type="button"
          onClick={() => setOpenPrice(!openPrice)}
          className="w-full flex items-center justify-between py-1 text-sm font-bold text-[var(--season-text,#111827)]"
        >
          <span>Price Range (per person)</span>
          {openPrice ? <ChevronUp className="w-4 h-4 text-[var(--season-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--season-muted)]" />}
        </button>

        {openPrice && (
          <div className="mt-3 space-y-3">
            <input
              type="range"
              min={MIN_TOUR_PRICE}
              max={MAX_TOUR_PRICE}
              step={1000}
              value={localPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              onMouseUp={handlePriceCommit}
              onTouchEnd={handlePriceCommit}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--season-primary)]"
            />
            <div className="flex items-center justify-between text-xs text-[var(--season-muted,#6B7280)] font-medium">
              <span>₹{MIN_TOUR_PRICE.toLocaleString()}</span>
              <span className="font-bold text-[var(--season-primary)]">
                Up to ₹{localPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Apply Filters (useful on mobile or for quick close) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            handlePriceCommit();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] transition-colors text-center shadow-xs"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

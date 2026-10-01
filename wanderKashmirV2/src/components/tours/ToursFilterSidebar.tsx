"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, RotateCcw, X, SlidersHorizontal } from "lucide-react";

interface ToursFilterSidebarProps {
  category?: string;
  duration?: string;
  destination?: string;
  maxPrice?: number;
  onCloseMobile?: () => void;
}

const CATEGORIES = [
  { slug: "culture", label: "Culture" },
  { slug: "spiritual", label: "Spiritual" },
  { slug: "nature", label: "Nature" },
  { slug: "family", label: "Family" },
  { slug: "adventure", label: "Adventure" },
  { slug: "trekking", label: "Trekking" },
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
  category,
  duration,
  destination,
  maxPrice,
  onCloseMobile,
}: ToursFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Accordion state
  const [openCategory, setOpenCategory] = useState(true);
  const [openDuration, setOpenDuration] = useState(true);
  const [openDestinations, setOpenDestinations] = useState(true);
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
    if (category === slug) {
      updateFilters({ category: null });
    } else {
      updateFilters({ category: slug });
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
    params.delete("duration");
    params.delete("destination");
    params.delete("maxPrice");
    const qs = params.toString();
    router.push(qs ? `/tours?${qs}` : "/tours", { scroll: false });
  };

  const hasActiveFilters = Boolean(category || duration || destination || (maxPrice && maxPrice < MAX_TOUR_PRICE));

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

      {/* 1. Category Accordion */}
      <div className="border-b border-[var(--season-border,#F3F4F6)] pb-4">
        <button
          type="button"
          onClick={() => setOpenCategory(!openCategory)}
          className="w-full flex items-center justify-between py-1 text-sm font-bold text-[var(--season-text,#111827)]"
        >
          <span>Help Me Choose (Travel Styles)</span>
          {openCategory ? <ChevronUp className="w-4 h-4 text-[var(--season-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--season-muted)]" />}
        </button>

        {openCategory && (
          <div className="mt-3 space-y-2.5">
            {CATEGORIES.map((cat) => {
              const isChecked = category?.toLowerCase() === cat.slug.toLowerCase();
              return (
                <Link
                  key={cat.slug}
                  href={isChecked ? "/tours" : `/tours/${cat.slug}`}
                  className="flex items-center gap-2.5 text-xs text-[var(--season-text,#374151)] font-medium cursor-pointer hover:text-[var(--season-primary)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-4 h-4 rounded text-[var(--season-primary)] border-[var(--season-border)] focus:ring-[var(--season-primary)] cursor-pointer pointer-events-none"
                  />
                  <span>{cat.label}</span>
                </Link>
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

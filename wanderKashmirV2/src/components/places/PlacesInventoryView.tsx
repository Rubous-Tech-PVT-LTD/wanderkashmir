"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, ArrowRight, Compass, X, Sparkles } from "lucide-react";

export interface PlaceCardItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  destinationName: string;
  destinationSlug: string;
  canonicalUrl: string;
}

export interface DestinationFilterItem {
  id: string;
  slug: string;
  name: string;
  count: number;
}

interface PlacesInventoryViewProps {
  places: PlaceCardItem[];
  destinations: DestinationFilterItem[];
}

export default function PlacesInventoryView({
  places,
  destinations,
}: PlacesInventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<string>("ALL");

  // Client-side filtering for instant response without layout thrashing
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // 1. Destination filter
      if (selectedDestination !== "ALL") {
        if (place.destinationSlug !== selectedDestination) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = place.name.toLowerCase().includes(query);
        const destMatch = place.destinationName.toLowerCase().includes(query);
        const descMatch = place.description
          ? place.description.toLowerCase().includes(query)
          : false;

        if (!nameMatch && !destMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [places, selectedDestination, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedDestination("ALL");
  };

  const isFiltered = searchQuery.trim() !== "" || selectedDestination !== "ALL";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── Editorial Hero ────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-24 pb-16 sm:pt-28 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 20%, var(--season-primary, #065F46) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[var(--season-secondary-light,#E5F2F9)] tracking-wide uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kashmir Sightseeing & Heritage Directory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight text-white leading-tight">
            Places to Visit in Kashmir
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl text-slate-300 font-sans max-w-3xl mx-auto leading-relaxed">
            Explore Kashmir’s iconic Mughal terraced gardens, historic shrines,
            scenic alpine viewpoints, and tranquil lake shores. Verified local
            attractions curated for mindful travelers.
          </p>

          {/* Search Box */}
          <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by attraction name, garden, or keyword..."
                className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-white/95 text-slate-900 placeholder-slate-400 rounded-2xl text-sm sm:text-base font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--season-primary,#164E3B)] transition-all border border-white/20"
                aria-label="Search places to visit"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Catalog Section ──────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Destination Filter Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--season-primary,#164E3B)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Filter by Region:
              </span>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-[var(--season-primary,#164E3B)] hover:text-[var(--season-primary-hover,#0D3028)] hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none whitespace-nowrap">
            <button
              type="button"
              onClick={() => setSelectedDestination("ALL")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                selectedDestination === "ALL"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Regions ({places.length})
            </button>

            {destinations.map((dest) => (
              <button
                key={dest.id}
                type="button"
                onClick={() => setSelectedDestination(dest.slug)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedDestination === dest.slug
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {dest.name} ({dest.count})
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Showing{" "}
            <span className="text-slate-900 font-bold">
              {filteredPlaces.length}
            </span>{" "}
            {filteredPlaces.length === 1 ? "attraction" : "attractions"}
            {selectedDestination !== "ALL" && (
              <span>
                {" "}
                in{" "}
                <span className="text-slate-900 font-bold">
                  {destinations.find((d) => d.slug === selectedDestination)?.name || selectedDestination}
                </span>
              </span>
            )}
          </p>
        </div>

        {/* Places Grid */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPlaces.map((place) => (
              <Link
                key={place.id}
                href={place.canonicalUrl}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[var(--season-border,#E5E7EB)] shadow-sm hover:shadow-lg hover:border-[var(--season-primary,#164E3B)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Aspect Box */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {place.imageUrl ? (
                    <Image
                      src={place.imageUrl}
                      alt={place.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                      <MapPin className="w-8 h-8 stroke-[1.5]" />
                      <span className="text-xs font-medium">Photo coming soon</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-xs">
                      <MapPin className="w-3 h-3 text-[var(--season-primary,#164E3B)]" />
                      <span>{place.destinationName}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 group-hover:text-[var(--season-primary,#164E3B)] transition-colors line-clamp-2 leading-snug">
                    {place.name}
                  </h2>

                  {place.description ? (
                    <p className="font-sans text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mt-2.5">
                      {place.description}
                    </p>
                  ) : (
                    <p className="font-sans text-xs sm:text-sm text-slate-400 italic mt-2.5">
                      Heritage details and visitor guide available inside.
                    </p>
                  )}

                  {/* Footer CTA */}
                  <div className="mt-auto pt-4 border-t border-[var(--season-border,#F1F5F9)] flex items-center justify-between text-xs font-bold text-[var(--season-primary,#164E3B)] group-hover:text-[var(--season-primary-hover,#0D3028)]">
                    <span>Explore Attraction Details</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 sm:p-14 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <Compass className="w-7 h-7 stroke-[1.5]" />
            </div>

            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900">
              No attractions found
            </h3>

            <p className="font-sans text-xs sm:text-sm text-slate-500 leading-relaxed">
              We couldn’t find any attractions matching{" "}
              {searchQuery && <span className="font-semibold text-slate-700">“{searchQuery}”</span>}
              {selectedDestination !== "ALL" && (
                <span> in {destinations.find((d) => d.slug === selectedDestination)?.name || selectedDestination}</span>
              )}
              . Try searching another term or resetting your filter.
            </p>

            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>View All Attractions</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}


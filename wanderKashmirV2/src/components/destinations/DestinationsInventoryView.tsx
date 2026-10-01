"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal, MapPin, ArrowRight, RotateCcw, X, Check } from "lucide-react";
export interface DestinationListingItem {
  id: string;
  slug: string;
  type: string;
  title: string;
  h1Heading: string;
  description: string | null;
  imageUrl: string | null;
  workflowState: string;
  createdAt?: Date;
}

interface DestinationsInventoryViewProps {
  allDestinations?: DestinationListingItem[];
  destinations: DestinationListingItem[];
  activeName?: string;
  activeCategory?: string;
}

/**
 * Resolves the clean, authentic destination entity name (e.g. "Srinagar", "Gulmarg", "Dal Lake").
 * 
 * Resolution order:
 * 1. PRIMARY: dest.slug (converted from kebab-case to readable Title Case)
 * 2. FALLBACK 1: dest.h1Heading (if slug is unexpectedly missing)
 * 3. FALLBACK 2: dest.title (if h1Heading is missing)
 * 4. FINAL: "Destination"
 */
export function getDestinationDisplayName(dest: {
  slug?: string;
  h1Heading?: string | null;
  title?: string | null;
}): string {
  // 1. PRIMARY: Canonical URL slug converted from kebab-case to Title Case
  if (dest.slug && dest.slug.trim()) {
    return dest.slug
      .trim()
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // 2. FALLBACK 1: h1Heading (defensive handling if slug is missing)
  if (dest.h1Heading && dest.h1Heading.trim()) {
    return dest.h1Heading.trim();
  }

  // 3. FALLBACK 2: title (defensive handling if h1Heading is missing)
  if (dest.title && dest.title.trim()) {
    return dest.title.trim();
  }

  // 4. FINAL
  return "Destination";
}

export default function DestinationsInventoryView({
  allDestinations,
  destinations,
  activeName,
  activeCategory,
}: DestinationsInventoryViewProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Defensive validation: ensure strictly DESTINATION type & PUBLISHED workflowState
  const validSidebar = (allDestinations && allDestinations.length > 0 ? allDestinations : destinations).filter(
    (d) => d.type === "DESTINATION" && d.workflowState === "PUBLISHED"
  );
  const validDestinations = destinations.filter(
    (d) => d.type === "DESTINATION" && d.workflowState === "PUBLISHED"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* ========================================= */}
        {/* LEFT COLUMN: Filter Sidebar (Desktop)     */}
        {/* ========================================= */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24">
          <div className="bg-white border border-[var(--season-border,#E5E7EB)] rounded-2xl p-5 shadow-sm space-y-6">

            {/* 1. Category Filter */}
            <div className="pb-6 border-b border-[var(--season-border,#F3F4F6)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--season-primary,#EA580C)]" />
                  <h3 className="text-sm font-bold text-[var(--season-text,#111827)] uppercase tracking-wider font-display">
                    Category
                  </h3>
                </div>
                {activeCategory && (
                  <Link
                    href={activeName ? `/destinations?name=${activeName}` : "/destinations"}
                    className="text-xs font-semibold text-[var(--season-primary,#EA580C)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </Link>
                )}
              </div>
              <ul className="space-y-1.5">
                {[
                  { name: "Alpine Meadows", slug: "alpine-meadows" },
                  { name: "Forest & River Valleys", slug: "forest-river-valleys" },
                  { name: "Lakes & Waterfronts", slug: "lakes-waterfronts" },
                  { name: "Glaciers & High Passes", slug: "glaciers-high-passes" },
                  { name: "Heritage & Culture", slug: "heritage-culture" }
                ].map(cat => {
                  const isSelected = activeCategory === cat.slug;
                  // Construct href preserving name filter if exists
                  const params = new URLSearchParams();
                  if (activeName) params.set("name", activeName);
                  if (!isSelected) params.set("category", cat.slug);
                  
                  const targetHref = `/destinations${params.toString() ? '?' + params.toString() : ''}`;

                  return (
                    <li key={cat.slug}>
                      <Link
                        href={targetHref}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? "text-[var(--season-primary,#EA580C)] font-bold bg-slate-50"
                            : "text-[var(--season-text,#374151)] hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "border-[var(--season-primary,#EA580C)] bg-[var(--season-primary,#EA580C)] text-white"
                              : "border-slate-300 bg-white text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Discover By Name Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--season-border,#F3F4F6)]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--season-primary,#EA580C)]" />
                <h3 className="text-sm font-bold text-[var(--season-text,#111827)] uppercase tracking-wider font-display">
                  Discover By Name
                </h3>
              </div>
              {activeName && (
                <Link
                  href={activeCategory ? `/destinations?category=${activeCategory}` : "/destinations"}
                  className="text-xs font-semibold text-[var(--season-primary,#EA580C)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </Link>
              )}
            </div>

            {/* Destination Options List */}
            <ul className="space-y-1.5">
              {/* All Destinations (Clean Hub Reset) */}
              <li>
                <Link
                  href={activeCategory ? `/destinations?category=${activeCategory}` : "/destinations"}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    !activeName
                      ? "bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary,#EA580C)] font-bold shadow-2xs"
                      : "text-[var(--season-text,#374151)] hover:bg-slate-50 hover:text-[var(--season-primary,#EA580C)]"
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      !activeName
                        ? "border-[var(--season-primary,#EA580C)] bg-[var(--season-primary,#EA580C)]"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {!activeName && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>All Destinations</span>
                </Link>
              </li>

              {/* Individual Destination Filter Options (Clean Names Only) */}
              {validSidebar.map((dest) => {
                const displayName = getDestinationDisplayName(dest);
                const isSelected =
                  activeName?.toLowerCase() === dest.slug.toLowerCase() ||
                  activeName?.toLowerCase() === displayName.toLowerCase();

                // Toggle behavior: clicking active filter resets to /destinations
                
                    const params = new URLSearchParams();
                    if (activeCategory) params.set("category", activeCategory);
                    if (!isSelected) params.set("name", dest.slug);
                    const targetHref = `/destinations${params.toString() ? '?' + params.toString() : ''}`;


                return (
                  <li key={dest.id}>
                    <Link
                      href={targetHref}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary,#EA580C)] font-bold shadow-2xs"
                          : "text-[var(--season-text,#374151)] hover:bg-slate-50 hover:text-[var(--season-primary,#EA580C)]"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "border-[var(--season-primary,#EA580C)] bg-[var(--season-primary,#EA580C)]"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="truncate">{displayName}</span>
                    </Link>
                  </li>
                );
              })}

              {validSidebar.length === 0 && (
                <li className="text-xs text-[var(--season-muted,#6B7280)] italic px-2 py-1">
                  No destinations published yet.
                </li>
              )}
            </ul>
            
            {/* About Box */}
            <div className="pt-5 border-t border-[var(--season-border,#E5E7EB)]">
              <h3 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-2">
                About Destinations
              </h3>
              <p className="text-xs text-[var(--season-muted,#6B7280)] leading-relaxed">
                Our destinations are verified by local experts. We only list places that provide authentic and memorable experiences for our travelers.
              </p>
            </div>
          </div>
        </aside>

        {/* ========================================= */}
        {/* MOBILE FILTER MODAL / DRAWER              */}
        {/* ========================================= */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden">
            <div className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--season-border,#E5E7EB)]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--season-primary,#EA580C)]" />
                  <h3 className="text-base font-bold text-[var(--season-text,#111827)] font-display">
                    Filter By Destination
                  </h3>
                </div>
                <button 
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-gray-500 hover:text-black rounded-lg"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6 mt-4">

            {/* 1. Category Filter */}
            <div className="pb-6 border-b border-[var(--season-border,#F3F4F6)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--season-primary,#EA580C)]" />
                  <h3 className="text-sm font-bold text-[var(--season-text,#111827)] uppercase tracking-wider font-display">
                    Category
                  </h3>
                </div>
                {activeCategory && (
                  <Link
                    href={activeName ? `/destinations?name=${activeName}` : "/destinations"}
                    className="text-xs font-semibold text-[var(--season-primary,#EA580C)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </Link>
                )}
              </div>
              <ul className="space-y-1.5">
                {[
                  { name: "Alpine Meadows", slug: "alpine-meadows" },
                  { name: "Forest & River Valleys", slug: "forest-river-valleys" },
                  { name: "Lakes & Waterfronts", slug: "lakes-waterfronts" },
                  { name: "Glaciers & High Passes", slug: "glaciers-high-passes" },
                  { name: "Heritage & Culture", slug: "heritage-culture" }
                ].map(cat => {
                  const isSelected = activeCategory === cat.slug;
                  // Construct href preserving name filter if exists
                  const params = new URLSearchParams();
                  if (activeName) params.set("name", activeName);
                  if (!isSelected) params.set("category", cat.slug);
                  
                  const targetHref = `/destinations${params.toString() ? '?' + params.toString() : ''}`;

                  return (
                    <li key={cat.slug}>
                      <Link
                        href={targetHref}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? "text-[var(--season-primary,#EA580C)] font-bold bg-slate-50"
                            : "text-[var(--season-text,#374151)] hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "border-[var(--season-primary,#EA580C)] bg-[var(--season-primary,#EA580C)] text-white"
                              : "border-slate-300 bg-white text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

                {/* 2. Discover By Name */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[var(--season-text,#111827)] uppercase tracking-wider font-display">
                      Discover By Name
                    </h3>
                  </div>
                  <ul className="space-y-2">
                  {/* All Destinations (Clean Hub Reset) */}
                  <li>
                    <Link
                      href="/destinations"
                      onClick={() => setMobileFilterOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        !activeName
                          ? "bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary,#EA580C)] font-bold"
                          : "text-[var(--season-text,#374151)] hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          !activeName
                            ? "border-[var(--season-primary,#EA580C)] bg-[var(--season-primary,#EA580C)]"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {!activeName && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      <span>All Destinations</span>
                    </Link>
                  </li>

                  {/* Individual Destinations (Clean Names Only) */}
                  {validSidebar.map((dest) => {
                    const displayName = getDestinationDisplayName(dest);
                    const isSelected =
                      activeName?.toLowerCase() === dest.slug.toLowerCase() ||
                      activeName?.toLowerCase() === displayName.toLowerCase();

                    
                    const params = new URLSearchParams();
                    if (activeCategory) params.set("category", activeCategory);
                    if (!isSelected) params.set("name", dest.slug);
                    const targetHref = `/destinations${params.toString() ? '?' + params.toString() : ''}`;


                    return (
                      <li key={dest.id}>
                        <Link
                          href={targetHref}
                          onClick={() => setMobileFilterOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary,#EA580C)] font-bold"
                              : "text-[var(--season-text,#374151)] hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-[var(--season-primary,#EA580C)] bg-[var(--season-primary,#EA580C)]"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                          </span>
                          <span className="truncate">{displayName}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* RIGHT COLUMN: Results Header + Grid       */}
        {/* ========================================= */}
        <div className="flex-1 min-w-0 w-full">
          {/* Top Bar: Count + Active Filter Pill + Mobile Trigger */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[var(--season-border,#E5E7EB)]">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--season-text,#111827)] font-display tracking-tight">
                {validDestinations.length} Destination{validDestinations.length === 1 ? "" : "s"} Found
              </h2>

              {/* Active Filter Pill */}
              {(activeName || activeCategory) && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-slate-500">Filtered by:</span>
                  {activeCategory && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <span className="capitalize">{activeCategory.replace(/-/g, ' ')}</span>
                      <Link href={activeName ? `/destinations?name=${activeName}` : "/destinations"} className="hover:text-emerald-950 ml-0.5" title="Clear category filter">
                        <X className="w-3.5 h-3.5" />
                      </Link>
                    </span>
                  )}
                  {activeName && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200/60">
                      <span className="capitalize">{activeName.replace(/-/g, ' ')}</span>
                      <Link href={activeCategory ? `/destinations?category=${activeCategory}` : "/destinations"} className="hover:text-orange-950 ml-0.5" title="Clear name filter">
                        <X className="w-3.5 h-3.5" />
                      </Link>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Sidebar Trigger Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--season-text)] bg-white border border-[var(--season-border)] shadow-2xs hover:bg-slate-50"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--season-primary,#EA580C)]" />
                <span>Filter Destinations {(activeName || activeCategory) ? `(Active)` : ""}</span>
              </button>
            </div>
          </div>

          {/* Grid Area OR Empty State */}
          {validDestinations.length === 0 ? (
            <div className="bg-white border border-[var(--season-border,#E5E7EB)] rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4 shadow-2xs">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] mb-2">
                No destinations found
              </h3>
              <p className="text-[var(--season-muted,#6B7280)] max-w-md mx-auto text-sm mb-6">
                {activeName
                  ? `No published destination matches "${activeName}". Please choose another destination from the sidebar.`
                  : "No destinations are published yet."}
              </p>
              {activeName && (
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear Filter</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {validDestinations.map((dest) => {
                const displayName = getDestinationDisplayName(dest);
                return (
                  <Link
                    key={dest.id}
                    href={`/destinations/${dest.slug}`}
                    className="group flex flex-col bg-white border border-[var(--season-border)] rounded-2xl overflow-hidden hover:border-[var(--season-primary)] hover:shadow-lg transition-all duration-300"
                  >
                    {/* Hero Image */}
                    <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100">
                      <Image
                        src={dest.imageUrl || "/placeholder-image.jpg"}
                        alt={displayName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-[var(--season-text)] mb-2 line-clamp-1">
                        {displayName}
                      </h3>
                      <p className="text-sm text-[var(--season-muted)] line-clamp-2 mb-4 flex-1">
                        {dest.description || `Explore ${displayName} with verified local insights and attractions.`}
                      </p>
                      <div className="mt-auto pt-4 border-t border-[var(--season-border)] flex items-center justify-between text-sm font-bold text-[var(--season-primary)]">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
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
  ImageOff,
} from "lucide-react";
import { HELP_ME_CHOOSE_CONFIG } from "@/components/HelpMeChoose";
import { PopularTourCard, TourInclusionItem } from "@/types/tours";

export type { PopularTourCard, TourInclusionItem };

// Fallback skeleton structure with ZERO hardcoded fake images (imageUrl: "")
export const POPULAR_TOURS_DATA: PopularTourCard[] = [
  {
    id: "tour-7-days-complete",
    title: "Complete Kashmir Experience",
    slug: "7-days-complete-kashmir",
    duration: "7 Days • 6 Nights",
    badge: "Bestseller",
    imageUrl: "",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"],
    rating: 4.8,
    reviewsCount: 412,
    inclusions: [
      { label: "Hotel & Houseboat", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Meals", type: "meals" },
      { label: "Shikara Ride", type: "houseboat" },
    ],
    price: 23999,
  },
  {
    id: "tour-6-days-explorer",
    title: "Kashmir Explorer Package",
    slug: "6-days-tour-kashmir-explorer-package",
    duration: "6 Days • 5 Nights",
    badge: "Top Rated",
    imageUrl: "",
    destinations: ["Srinagar", "Sonamarg", "Gulmarg", "Pahalgam"],
    rating: 4.8,
    reviewsCount: 320,
    inclusions: [
      { label: "Resort Stay", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Meals", type: "meals" },
      { label: "Gondola Assist", type: "activities" },
    ],
    price: 18000,
  },
  {
    id: "tour-5-days-family",
    title: "Family Special Package",
    slug: "5-days-family-special",
    duration: "5 Days • 4 Nights",
    badge: "Family Pick",
    imageUrl: "",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    rating: 4.8,
    reviewsCount: 295,
    inclusions: [
      { label: "Family Suites", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Meals", type: "meals" },
      { label: "Houseboat Stay", type: "houseboat" },
    ],
    price: 13999,
  },
  {
    id: "tour-4-days-first-timer",
    title: "Complete First-Timer",
    slug: "4-days-srinagar-gulmarg-pahalgam",
    duration: "4 Days • 3 Nights",
    badge: "Best Value",
    imageUrl: "",
    destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
    rating: 4.8,
    reviewsCount: 412,
    inclusions: [
      { label: "Deluxe Hotel", type: "hotel" },
      { label: "Private Cab", type: "cab" },
      { label: "Daily Breakfast", type: "meals" },
      { label: "Gondola Tour", type: "activities" },
    ],
    price: 11999,
  },
];

// Helper to format Indian Rupee
function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to render inclusion icon
function renderInclusionIcon(type: TourInclusionItem["type"]) {
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

interface PopularToursProps {
  initialTours?: PopularTourCard[];
}

export default function PopularTours({ initialTours }: PopularToursProps) {
  const toursList = initialTours || [];
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  if (toursList.length === 0) {
    return null;
  }

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      aria-labelledby="popular-tours-heading"
      data-analytics-section="popular-tours"
      className="bg-white border-b transition-colors duration-200"
      style={{
        borderColor: "var(--season-border)",
        paddingTop: "14px",
        paddingBottom: "18px",
      }}
    >
      <div
        className="w-full mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: HELP_ME_CHOOSE_CONFIG.containerMaxWidth }}
      >
        {/* ===================================================================
            SECTION HEADER: Placement & Content matching reference
        =================================================================== */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2
              id="popular-tours-heading"
              className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase"
            >
              Popular Kashmir Tours
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
              Top booked itineraries with verified houseboats, private cabs, and local guides.
            </p>
          </div>

          <Link
            href="/tours"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold hover:underline transition-colors shrink-0 group"
            style={{ color: "var(--season-primary)" }}
          >
            <span>View All Tours</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ===================================================================
            POPULAR TOURS GRID: Compact Viewport-Optimized Cards
        =================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {toursList.map((tour) => {
            const isFav = favorites[tour.id];

            return (
              <div
                key={tour.id}
                className="group flex flex-col bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-[var(--season-primary)]"
                style={{
                  borderColor: "var(--season-border)",
                }}
              >
                {/* 1. Image with Exactly ONE Tag (Compact Height: 156px) */}
                <div className="relative w-full h-38 sm:h-40 overflow-hidden shrink-0 bg-slate-100">
                  {tour.imageUrl && tour.imageUrl.trim() ? (
                    <Image
                      src={tour.imageUrl}
                      alt={tour.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-1.5 p-3 text-center select-none border-b border-slate-100">
                      <ImageOff className="w-6 h-6 text-slate-400 stroke-[1.5]" aria-hidden="true" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Image yet to be assigned
                      </span>
                    </div>
                  )}

                  {/* ONE Tag in Image (Top Left) */}
                  {tour.badge && (
                    <div className="absolute top-2 left-2 z-10">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs"
                        style={{ backgroundColor: "var(--season-primary)" }}
                      >
                        {tour.badge}
                      </span>
                    </div>
                  )}

                  {/* Wishlist Heart Button (Top Right - Thin outline floating design) */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(e, tour.id)}
                    aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                    className="absolute top-2 right-2 z-10 p-1 cursor-pointer transition-transform duration-200 hover:scale-115 active:scale-90 focus:outline-hidden group/heart"
                  >
                    <Heart
                      strokeWidth={1.8}
                      className={`w-5 h-5 transition-all duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
                        isFav
                          ? "fill-[var(--season-primary)] stroke-[var(--season-primary)] scale-105"
                          : "stroke-white fill-black/35 group-hover/heart:fill-[var(--season-primary)] group-hover/heart:stroke-[var(--season-primary)]"
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Compact Body Content */}
                <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Duration • Rating Row */}
                    <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-700 truncate">{tour.duration}</span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-extrabold text-slate-900">{tour.rating}</span>
                        <span className="text-slate-400">({tour.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-[14px] sm:text-[15px] font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-[var(--season-primary)] transition-colors">
                      {tour.title}
                    </h3>

                    {/* Destinations Covered */}
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5 line-clamp-1">
                      {tour.destinations.join(" • ")}
                    </p>

                    {/* Included Amenities (2-Column Grid matching reference placement) */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2.5">
                      {tour.inclusions.slice(0, 4).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium min-w-0"
                        >
                          {renderInclusionIcon(item.type)}
                          <span className="truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Price & Primary Action (Compact Footer) */}
                  <div
                    className="mt-3 pt-2.5 border-t flex items-center justify-between"
                    style={{ borderColor: "var(--season-border)" }}
                  >
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                        Starting from
                      </span>
                      <div className="flex items-baseline gap-0.5 mt-0.5">
                        <span
                          className="font-display font-extrabold text-[15px] sm:text-[16px] leading-none"
                          style={{ color: "var(--season-primary)" }}
                        >
                          {formatINR(tour.price)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">/person</span>
                      </div>
                    </div>

                    <Link
                      href={`/tours/${tour.slug}`}
                      className="px-2.5 py-1.5 rounded-lg text-white font-extrabold text-xs shadow-2xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      style={{
                        backgroundColor: "var(--season-primary)",
                      }}
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

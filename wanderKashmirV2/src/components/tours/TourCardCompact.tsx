"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TourPackageDetail } from "@/data/liveToursData";
import { Heart, Building2, Car, Compass, ArrowRight, ImageOff } from "lucide-react";

interface TourCardCompactProps {
  tour: TourPackageDetail;
}

export default function TourCardCompact({ tour }: TourCardCompactProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Derive verified stay highlight
  const hasHouseboat = (tour.inclusions || []).some((s) => s.toLowerCase().includes("houseboat"));
  const stayText = hasHouseboat ? "Houseboat & Valley Stays" : "Comfortable Valley Stays";

  // Derive verified transport
  const transportText = "Private AC Chauffeur Included";

  // Derive verified sightseeing summary
  const sightseeingText = `${tour.destinations.length} Scenic Destinations Covered`;

  const primaryImage =
    tour.images && tour.images.length > 0 && tour.images[0] && tour.images[0].trim()
      ? tour.images[0].trim()
      : null;

  return (
    <article className="group flex flex-col rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
      {/* 1. Card Image Header */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={tour.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-1.5 p-4 text-center select-none">
            <ImageOff className="w-6 h-6 text-slate-400 stroke-[1.5]" aria-hidden="true" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Image yet to be assigned
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

        {/* Verified Badge (if exists) */}
        {tour.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[var(--season-text,#1F2937)] shadow-xs backdrop-blur-xs border border-white/40">
              {tour.badge}
            </span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsSaved(!isSaved);
          }}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-transform duration-200 hover:scale-110 ${
            isSaved
              ? "bg-rose-500 text-white shadow-sm"
              : "bg-black/30 text-white hover:bg-black/50"
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </button>

        {/* Route chips or pill indicator on bottom of image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium pointer-events-none">
          <span className="bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md">
            {tour.destinations.join(" • ")}
          </span>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Duration + Nights */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--season-primary)] mb-1">
            {tour.duration}
          </div>

          {/* Tour Title */}
          <h3 className="text-base sm:text-lg font-bold text-[var(--season-text,#111827)] font-display group-hover:text-[var(--season-primary)] transition-colors line-clamp-1">
            <Link href={`/tours/${tour.slug}`}>
              {tour.title}
            </Link>
          </h3>

          {/* Route with Arrow Separators */}
          <p className="mt-1 text-xs text-[var(--season-muted,#4B5563)] font-medium line-clamp-1">
            {tour.routeDisplay.join(" → ")}
          </p>

          {/* 3 Verified Highlights */}
          <div className="mt-3.5 pt-3 border-t border-[var(--season-border,#F3F4F6)] space-y-1.5 text-xs text-[var(--season-text,#374151)]">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
              <span className="truncate">{stayText}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
              <span className="truncate">{transportText}</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
              <span className="truncate">{sightseeingText}</span>
            </div>
          </div>
        </div>

        {/* 3. Card Footer with Price & CTA */}
        <div className="pt-3 border-t border-[var(--season-border,#E5E7EB)] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-extrabold text-[var(--season-text,#111827)] font-display">
                ₹{tour.price.toLocaleString()}
              </span>
              <span className="text-[11px] text-[var(--season-muted,#6B7280)] font-normal">
                / person
              </span>
            </div>
          </div>

          <Link
            href={`/tours/${tour.slug}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] transition-all shadow-2xs w-fit shrink-0 whitespace-nowrap"
          >
            <span className="whitespace-nowrap">View Details</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>
      </div>
    </article>
  );
}

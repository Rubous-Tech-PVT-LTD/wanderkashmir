"use client";

import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import HotelGallery from "@/components/stays/detail/HotelGallery";
import TourStickyBookingCard from "./TourStickyBookingCard";
import TourContentTabs from "./TourContentTabs";
import TourCardCompact from "./TourCardCompact";
import { TourPackageDetail } from "@/data/liveToursData";

interface TourPackageViewProps {
  tour: TourPackageDetail;
  otherTours?: TourPackageDetail[];
}

export default function TourPackageView({ tour, otherTours }: TourPackageViewProps) {
  return (
    <div className="min-h-screen bg-white text-[var(--season-text,#111827)] pb-20 pt-20 sm:pt-24">
      <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-5 md:px-6 space-y-5">
        {/* 1. Breadcrumb Navigation (At the very top matching reference) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
          <Link href="/" className="hover:text-[var(--season-primary,#065F46)] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/tours" className="hover:text-[var(--season-primary,#065F46)] transition-colors">
            Tour Packages
          </Link>
          {tour.tourCategory && tour.tourCategory.slug && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link
                href={`/tours/category/${tour.tourCategory.slug}`}
                className="hover:text-[var(--season-primary,#065F46)] transition-colors"
              >
                {tour.tourCategory.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-medium truncate">
            {tour.title}
          </span>
        </nav>

        {/* 2. Top Media Gallery (Reusing Hotel Detail Gallery) */}
        <HotelGallery
          title={tour.title}
          images={tour.images}
          emptySubtitle="Verified tour photography will appear here once submitted and approved by WanderKashmir."
        />

        {/* 3. Main Two-Column Layout (Matching exact reference hierarchy) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Column (8 cols): Title block, Route, Rating, Tabs & Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tour Title & Meta Block - Clean, no extra icons or lines */}
            <div className="space-y-1.5">
              {/* Duration */}
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                {tour.duration}
              </div>

              {/* Title + Badge */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <h1 className="text-lg sm:text-xl md:text-[22px] lg:text-[23px] font-bold text-slate-900 font-display tracking-tight leading-tight">
                  {tour.title}
                </h1>
                {tour.badge && (
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                    {tour.badge}
                  </span>
                )}
              </div>
              {/* Rating */}
              {tour.reviewsCount > 0 ? (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm pt-0.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-900">{tour.rating}</span>
                  <span className="text-slate-500">({tour.reviewsCount} {tour.reviewsCount === 1 ? 'review' : 'reviews'})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm pt-0.5 text-slate-500">
                  <Star className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Reviews coming soon</span>
                </div>
              )}
            </div>

            {/* Horizontal Tabs & Detailed Content (Overview, 5 Feature Cards, Route Map, etc.) */}
            <TourContentTabs tour={tour} />
          </div>

          {/* Right Column (4 cols): Booking Card placed at current location (non-sticky) */}
          <div className="lg:col-span-4">
            <TourStickyBookingCard
              title={tour.title}
              price={tour.price}
              duration={tour.duration}
              maxPersons={tour.maxPersons}
              whyThisRoute={tour.whyThisRoute}
            />
          </div>
        </div>
      </div>

      {/* OTHER TOURS SECTION - ORIGINAL CONTAINER PRESERVED */}
      {otherTours && otherTours.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight mb-6">
            Other Tours You May Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherTours.map((t) => (
              <TourCardCompact key={t.id} tour={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

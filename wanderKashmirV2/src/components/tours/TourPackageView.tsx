"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Star, Sparkles, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import HotelGallery from "@/components/stays/detail/HotelGallery";
import TourStickyBookingCard from "./TourStickyBookingCard";
import TourContentTabs from "./TourContentTabs";
import TourCardCompact from "./TourCardCompact";
import TourDynamicBlocksRenderer from "./TourDynamicBlocksRenderer";
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

              {/* Tour Overview / Description */}
              {tour.overview && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 whitespace-pre-line">
                  {tour.overview}
                </p>
              )}
            </div>

            {/* Key Highlights (Rendered if populated in DB) */}
            {tour.highlights && tour.highlights.length > 0 && (
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--season-primary,#065F46)]" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Tour Highlights
                  </h2>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-[13px] text-slate-700">
                  {tour.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Horizontal Tabs & Detailed Content (Overview, 5 Feature Cards, Route Map, etc.) */}
            <TourContentTabs tour={tour} />

            {/* Inclusions & Exclusions (Rendered if populated in DB) */}
            {((tour.inclusions && tour.inclusions.length > 0) || (tour.exclusions && tour.exclusions.length > 0)) && (
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  What's Included & Excluded
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tour.inclusions && tour.inclusions.length > 0 && (
                    <div className="space-y-2 p-3.5 sm:p-4 rounded-lg bg-emerald-50/40 border border-emerald-100/90">
                      <h3 className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Inclusions</span>
                      </h3>
                      <ul className="space-y-1.5 text-xs sm:text-[13px] text-slate-700">
                        {tour.inclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold shrink-0">•</span>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tour.exclusions && tour.exclusions.length > 0 && (
                    <div className="space-y-2 p-3.5 sm:p-4 rounded-lg bg-rose-50/40 border border-rose-100/90">
                      <h3 className="text-xs sm:text-sm font-bold text-rose-900 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Exclusions</span>
                      </h3>
                      <ul className="space-y-1.5 text-xs sm:text-[13px] text-slate-700">
                        {tour.exclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-600 font-bold shrink-0">•</span>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Content Blocks (Rendered if populated in DB) */}
            {tour.dynamicBlocks && tour.dynamicBlocks.length > 0 && (
              <TourDynamicBlocksRenderer blocks={tour.dynamicBlocks} />
            )}

            {/* Linked Travel Guides (Rendered if linked and published in DB) */}
            {tour.travelGuides && tour.travelGuides.length > 0 && (
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[var(--season-primary,#065F46)]" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Travel Guides & Stories
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {tour.travelGuides.map((guide) => (
                    <Link
                      key={guide.id}
                      href={`/blog/${guide.slug}`}
                      className="group flex gap-3 p-3 rounded-lg border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-[var(--season-primary)]/70 hover:shadow-2xs transition-all"
                    >
                      {guide.imageUrl ? (
                        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-slate-100 shrink-0">
                          <Image
                            src={guide.imageUrl}
                            alt={guide.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 space-y-1">
                        <h3 className="text-xs sm:text-[13.5px] font-semibold text-slate-900 group-hover:text-[var(--season-primary)] transition-colors line-clamp-2 leading-snug">
                          {guide.title}
                        </h3>
                        {guide.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {guide.description}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--season-primary)] pt-0.5">
                          Read Guide →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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

"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  ShieldCheck,
  Star,
  ArrowRight,
  Anchor,
  Hotel,
  Home,
  MessageCircle,
} from "lucide-react";
import { HotelDetailViewModel } from "./types";
import HotelGallery from "./HotelGallery";

interface HotelHeroProps {
  hotel: HotelDetailViewModel;
}

export default function HotelHero({ hotel }: HotelHeroProps) {
  const { basic, location, media, reviews, conversion } = hotel;

  const CategoryIcon =
    basic.propertyType === "Houseboat"
      ? Anchor
      : basic.propertyType === "Homestay"
      ? Home
      : Hotel;

  // WhatsApp enquiry link if phone exists
  const whatsappUrl = conversion.phone
    ? `https://wa.me/${conversion.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hello WanderKashmir, I would like to check availability for "${basic.name}" in ${location.destinationHub}.`
      )}`
    : `https://wa.me/916005888754?text=${encodeURIComponent(
        `Hello WanderKashmir, I would like to inquire about "${basic.name}" in ${location.destinationHub}.`
      )}`;

  return (
    <section className="space-y-4">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--season-muted,#6B7280)] font-medium">
        <ol className="flex items-center flex-wrap gap-1.5">
          <li>
            <Link href="/" className="hover:text-[var(--season-primary)] transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3 h-3 text-slate-400 inline" />
          </li>
          <li>
            <Link href="/stays" className="hover:text-[var(--season-primary)] transition-colors">
              Stays
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3 h-3 text-slate-400 inline" />
          </li>
          <li>
            <Link
              href={`/stays?type=${basic.propertyType.toLowerCase()}`}
              className="hover:text-[var(--season-primary)] transition-colors"
            >
              {basic.propertyType}
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3 h-3 text-slate-400 inline" />
          </li>
          <li className="text-[var(--season-text,#111827)] font-bold truncate max-w-[200px] sm:max-w-none" aria-current="page">
            {basic.name}
          </li>
        </ol>
      </nav>

      {/* 2. Hero Content Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-8">
          <HotelGallery title={basic.name} images={media.images} />
        </div>

        {/* Right: Info Panel */}
        <div className="lg:col-span-4 rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-xs space-y-4">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary)] border border-[var(--season-primary)]/20">
              <CategoryIcon className="w-3.5 h-3.5" />
              <span>{basic.propertyType}</span>
            </span>

            {basic.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Stay</span>
              </span>
            )}
          </div>

          {/* H1 Heading */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--season-text,#111827)] font-display tracking-tight leading-snug">
              {basic.name}
            </h1>

            {/* Location Link */}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--season-muted,#4B5563)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
              <span className="truncate">{location.address}</span>
            </div>
          </div>

          {/* Reviews Status */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--season-border,#F3F4F6)]">
            {typeof reviews.rating === "number" ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>{reviews.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-[var(--season-muted,#6B7280)] font-medium">
                  ({reviews.reviewCount} verified review{reviews.reviewCount === 1 ? "" : "s"})
                </span>
              </div>
            ) : (
              <div className="text-xs text-[var(--season-muted,#6B7280)] flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-slate-300" />
                <span>New on WanderKashmir</span>
              </div>
            )}
          </div>

          {/* Short Description */}
          {basic.shortDescription && (
            <p className="text-xs text-[var(--season-muted,#4B5563)] leading-relaxed line-clamp-3">
              {basic.shortDescription}
            </p>
          )}

          {/* Pricing & CTA */}
          <div className="pt-4 border-t border-[var(--season-border,#F3F4F6)] space-y-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-[var(--season-muted,#6B7280)] tracking-wider">
                Starting Rate
              </div>
              <div className="flex items-baseline gap-1.5">
                {conversion.startingPrice ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[var(--season-text,#111827)] font-display">
                      ₹{conversion.startingPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-[var(--season-muted,#6B7280)] font-medium">
                      / {conversion.priceUnit}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-[var(--season-text,#111827)] font-display">
                    Contact for Rates
                  </span>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <a
                href="#rooms"
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: "var(--season-primary)" }}
              >
                <span>Check Available Rooms</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-emerald-800 border border-emerald-300 hover:bg-emerald-50/70 transition-colors flex items-center justify-center gap-2 bg-white cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat with Local Host</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

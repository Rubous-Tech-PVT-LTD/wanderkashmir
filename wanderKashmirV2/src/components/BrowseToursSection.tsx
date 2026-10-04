"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Users,
  Heart,
  Compass,
  Snowflake,
  Sun,
  Sliders,
  Sparkles,
} from "lucide-react";
import { HELP_ME_CHOOSE_CONFIG } from "@/components/HelpMeChoose";

// =============================================================================
// DATA CATALOG FOR DURATION & TRAVEL STYLE
// =============================================================================
export const BROWSE_DURATIONS = [
  { days: "2 Days", toursCount: "1 Tour", href: "/tours?duration=2" },
  { days: "3 Days", toursCount: "1 Tour", href: "/tours?duration=3" },
  { days: "4 Days", toursCount: "1 Tour", href: "/tours?duration=4" },
  { days: "5 Days", toursCount: "1 Tour", href: "/tours?duration=5" },
  { days: "6 Days", toursCount: "1 Tour", href: "/tours?duration=6" },
  { days: "7 Days", toursCount: "1 Tour", href: "/tours?duration=7" },
];

export const BROWSE_TRAVEL_STYLES = [
  {
    name: "Family",
    subtext: "3 Tours",
    icon: Users,
    href: "/tours?style=family",
  },
  {
    name: "Honeymoon",
    subtext: "2 Tours",
    icon: Heart,
    href: "/tours?style=honeymoon",
  },
  {
    name: "Adventure",
    subtext: "2 Tours",
    icon: Compass,
    href: "/tours?style=adventure",
  },
  {
    name: "Cultural",
    subtext: "4 Tours",
    icon: Sparkles,
    href: "/tours?style=cultural",
  },
  {
    name: "Solo",
    subtext: "2 Tours",
    icon: Users,
    href: "/tours?style=solo",
  },
  {
    name: "Custom",
    subtext: "Build Your Own",
    icon: Sliders,
    href: "#customize-modal",
    isCustom: true,
  },
];

export interface BrowseDurationItem {
  days: string;
  toursCount: string;
  href: string;
}

interface BrowseToursSectionProps {
  durations?: BrowseDurationItem[];
}

// =============================================================================
// MAIN COMPONENT: BrowseToursSection
// =============================================================================
export default function BrowseToursSection({ durations }: BrowseToursSectionProps = {}) {
  const durationItems = durations && durations.length > 0 ? durations : [];

  return (
    <section
      aria-labelledby="browse-tours-heading"
      data-analytics-section="browse-tours"
      className="bg-white border-b transition-colors duration-200"
      style={{
        borderColor: "var(--season-border)",
        paddingTop: "24px",
        paddingBottom: "36px",
      }}
    >
      <div
        className="w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-7 sm:space-y-8"
        style={{ maxWidth: HELP_ME_CHOOSE_CONFIG.containerMaxWidth }}
      >
        {/* ===================================================================
            1. BROWSE BY DURATION
        =================================================================== */}
        {durationItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-3.5">
              <h2
                id="browse-tours-heading"
                className="font-display text-lg sm:text-xl font-extrabold text-[#17211D] tracking-tight"
              >
                Browse by Duration
              </h2>
              <Link
                href="/tours"
                className="group inline-flex items-center gap-1 text-xs font-bold transition-all duration-200 hover:translate-x-0.5 cursor-pointer"
                style={{ color: "var(--season-primary)" }}
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {durationItems.map((item) => (
                <Link
                  key={item.days}
                  href={item.href}
                  className="group flex flex-col items-center justify-center py-3.5 px-3 bg-white rounded-xl border transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--season-primary)] text-center focus:outline-hidden"
                  style={{ borderColor: "var(--season-border)" }}
                >
                  <span className="font-display font-extrabold text-sm sm:text-[15px] text-[#17211D] group-hover:text-[var(--season-primary)] transition-colors">
                    {item.days}
                  </span>
                  <span className="text-[11px] text-[#607069] font-medium mt-0.5">
                    {item.toursCount}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            2. BROWSE BY TRAVEL STYLE
        =================================================================== */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-3.5">
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#17211D] tracking-tight">
              Browse by Travel Style
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {BROWSE_TRAVEL_STYLES.map((item) => {
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex flex-col items-center justify-center py-3.5 px-3 bg-white rounded-xl border transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--season-primary)] text-center focus:outline-hidden"
                  style={{ borderColor: "var(--season-border)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-colors duration-200 bg-slate-50 group-hover:bg-[var(--season-primary-light)] group-hover:text-[var(--season-primary)]"
                    style={{ color: "var(--season-secondary)" }}
                  >
                    <IconComponent className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <span className="font-display font-extrabold text-xs sm:text-[13px] text-[#17211D] group-hover:text-[var(--season-primary)] transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[10.5px] text-[#607069] font-medium mt-0.5">
                    {item.subtext}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            3. BANNER: Kashmir, From People Who Know the Routes
        =================================================================== */}
        <div className="relative rounded-2xl overflow-hidden shadow-md border" style={{ borderColor: "var(--season-border)" }}>
          {/* Background Image: Kashmiri Local Mountain Guide */}
          <div className="relative w-full h-[180px] sm:h-[220px] md:h-[230px]">
            <Image
              src="https://res.cloudinary.com/dcmoseix9/image/upload/v1790176164/WhatsApp_Image_2026-09-23_at_8.30.44_PM_2_wxwqg2.jpg"
              alt="Kashmir Local Route Experts and Guides"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority={false}
            />

            {/* Gradient Overlay for high-contrast typography */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

            {/* Banner Content Container */}
            <div className="absolute inset-0 p-5 sm:p-8 md:p-10 flex flex-col justify-center max-w-2xl text-white">
              <h3 className="font-display text-xl sm:text-2xl md:text-[26px] font-extrabold tracking-tight text-white leading-tight">
                Kashmir, From People Who Know the Routes
              </h3>
              <p className="text-xs sm:text-sm text-white/85 font-sans mt-2 max-w-lg leading-relaxed">
                Our local team designs every itinerary with first-hand knowledge, real experience, and a deep love for Kashmir.
              </p>

              <div className="mt-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-[#17211D] hover:text-[var(--season-primary)] hover:bg-slate-100 transition-all duration-200 shadow-xs cursor-pointer group"
                >
                  <span>Meet Our Team</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import CustomizeTripModal from "@/components/CustomizeTripModal";
import HeroSearchBar from "@/components/HeroSearchBar";
import { HEADER_SPACING } from "@/components/Navbar";
import MobileHeroActionBar from "@/components/MobileHeroActionBar";
import MobileHeroCarousel from "@/components/MobileHeroCarousel";
import type { TravelStyleInput } from "@/lib/travelStyles";

// Custom Itinerary SVG Icon (replaces Sparkle icon)
function ItineraryIcon({
  className = "w-4.5 h-4.5",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* Travel Itinerary Folded Map & Waypoint Pin */}
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
      <circle cx="12" cy="11" r="2.2" fill="currentColor" />
    </svg>
  );
}

// =============================================================================
// 🎛️ HERO SECTION SIZING CONTROLS (Landing 50% split)
// =============================================================================
export const HERO_CONFIG = {
  // Height on Desktop: "50vh" splits landing screen 50% Hero & 50% Help Me Choose
  desktopHeight: "50vh",
};

interface HomeHeroProps {
  rating?: number;
  totalReviews?: number;
  travelStyles?: TravelStyleInput[];
}

export default function HomeHero({
  rating,
  totalReviews,
  travelStyles,
}: HomeHeroProps) {
  return (
    <>
      {/* ─── MOBILE ONLY: Cloudinary Travel Style Carousel & Action Bar ─── */}
      <div className="block md:hidden">
        <MobileHeroCarousel travelStyles={travelStyles} />

        {/* Mobile Action Bar: WhatsApp, Instagram, Google Rating, Customize Trip, Call */}
        <MobileHeroActionBar rating={rating} totalReviews={totalReviews} />
      </div>

      {/* ─── DESKTOP ONLY: Original Approved Desktop Hero Layout (Strictly Unchanged) ─── */}
      <section
        className="hidden md:flex relative z-30 items-center justify-center pt-[88px] pb-5 md:pt-[98px] md:pb-6 lg:pt-[106px] lg:pb-7 bg-white border-b transition-all duration-300"
        style={{ borderColor: "var(--season-border)" }}
      >
        <div className="w-full relative z-10 px-4 sm:px-6">
          {/* High-Converting Floating Hero Search Bar - Matches Nav Elements Start & Width on Desktop */}
          <div
            className="w-full flex justify-center relative z-30 transition-all duration-300"
            style={{
              ["--nav-elements-width" as string]: HEADER_SPACING.navElementsWidth || "760px",
              ["--nav-shift-x" as string]: HEADER_SPACING.centerContainerShiftX || "40px",
            }}
          >
            <div
              className="w-full max-w-xl lg:max-w-none lg:w-[var(--nav-elements-width)] lg:[transform:translateX(var(--nav-shift-x))]"
            >
              <HeroSearchBar />
            </div>
          </div>

          {/* Tailored Trip Quick Trigger */}
          <div
            className="mt-4 md:mt-5 relative z-10 flex flex-wrap items-center justify-center gap-2 transition-all duration-300 lg:[transform:translateX(var(--nav-shift-x))]"
            style={{
              ["--nav-shift-x" as string]: HEADER_SPACING.centerContainerShiftX || "40px",
            }}
          >
            <span className="text-xs text-[#56635E] font-medium">
              Planning something special?
            </span>
            <CustomizeTripModal
              customTitle="Plan Your Perfect Kashmir Trip"
              customSubtitle="Get a personalized itinerary, verified drivers, and handpicked stays direct from Srinagar."
              contextPayload={{
                sourceType: "homepage",
                sourcePage: "/",
              }}
              renderTrigger={(openModal) => (
                <button
                  type="button"
                  onClick={openModal}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-slate-50 text-[#17211D] border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs hover:scale-102 hover:border-[var(--season-primary)] hover:text-[var(--season-primary)] hover:bg-[var(--season-primary-light)]/40"
                  style={{ borderColor: "var(--season-border)" }}
                >
                  <ItineraryIcon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--season-primary)" }} />
                  <span>Customize Your Trip</span>
                </button>
              )}
            />
          </div>
        </div>
      </section>

      {/* Single Semantic Homepage H1 (Shared across Mobile & Desktop without altering hero height) */}
      <div
        className="bg-white border-b px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 text-center"
        style={{ borderColor: "var(--season-border)" }}
      >
        <h1 className="font-display text-sm sm:text-base md:text-lg font-extrabold text-[#17211D] tracking-tight">
          Discover Kashmir – Explore Tours, Destinations &amp; Experiences
        </h1>
      </div>
    </>
  );
}

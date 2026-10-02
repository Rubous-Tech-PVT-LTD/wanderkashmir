"use client";

import CustomizeTripModal from "@/components/CustomizeTripModal";
import HeroSearchBar from "@/components/HeroSearchBar";
import { HEADER_SPACING } from "@/components/Navbar";
import HeroTypewriter from "@/components/HeroTypewriter";
import MobileHeroActionBar from "@/components/MobileHeroActionBar";

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
}

export default function HomeHero({ rating, totalReviews }: HomeHeroProps) {
  return (
    <>
      {/* ─── MOBILE ONLY: Hero Video & Action Section (Copied from production, rest is new design) ─── */}
      <div className="block md:hidden">
        {/* Mobile Hero Video Container */}
        <section
          aria-label="Discover Kashmir Video"
          className="relative w-full h-[54dvh] min-h-[360px] max-h-[480px] flex flex-col justify-center overflow-hidden bg-black"
        >
          {/* Background Video */}
          <div className="absolute inset-0 z-0 overflow-hidden w-full h-full pointer-events-none">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="https://res.cloudinary.com/dcmoseix9/video/upload/so_0,f_auto,q_auto/v1789317861/Final_Video_rdc5nd.jpg"
              title="Discover Kashmir - WanderKashmir Travel"
              aria-label="WanderKashmir scenic travel video"
              className="absolute inset-0 w-full h-full object-cover object-center"
            >
              <source
                src="https://res.cloudinary.com/dcmoseix9/video/upload/f_auto,q_auto/v1789317861/Final_Video_rdc5nd.mp4"
                type="video/mp4"
              />
            </video>
            {/* Subtle contrast overlay */}
            <div className="absolute inset-0 bg-black/35" />
          </div>

          {/* Mobile Hero Content (H1 + Typewriter) */}
          <div className="relative z-10 w-full text-center flex flex-col items-center justify-center px-4 gap-[10px] [text-shadow:2px_4px_15px_rgba(0,0,0,0.8)]">
            <h1 className="text-[#F2F2F2] font-bold text-[20px] sm:text-[22px] tracking-tight leading-snug m-0 max-w-[340px] mx-auto px-1">
              Kashmir&apos;s Largest Travel Community
            </h1>
            <HeroTypewriter />
          </div>
        </section>

        {/* Mobile Action Bar: WhatsApp, Instagram, Google Rating, Customize Trip, Call */}
        <MobileHeroActionBar rating={rating} totalReviews={totalReviews} />
      </div>

      {/* ─── DESKTOP ONLY: Original Approved Desktop Hero Layout (Strictly Unchanged) ─── */}
      <section
        className="hidden md:flex relative items-center justify-center pt-[88px] pb-3.5 md:pt-[98px] md:pb-4 lg:pt-[106px] lg:pb-4.5 bg-white border-b transition-all duration-300"
        style={{ borderColor: "var(--season-border)" }}
      >
        <div className="w-full relative z-10 px-4 sm:px-6">
          {/* High-Converting Floating Hero Search Bar - Matches Nav Elements Start & Width on Desktop */}
          <div
            className="w-full flex justify-center transition-all duration-300"
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
            className="mt-3 flex flex-wrap items-center justify-center gap-2 transition-all duration-300 lg:[transform:translateX(var(--nav-shift-x))]"
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
    </>
  );
}

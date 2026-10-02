"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid, ArrowRight } from "lucide-react";
import CustomizeTripModal from "@/components/CustomizeTripModal";

// =============================================================================
// 1. BESPOKE OUTLINE SVG ICONS (Matching reference design style)
// =============================================================================

// Cultural Stays: Traditional Kashmiri Heritage Houseboat on water
function HouseboatIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      {/* Houseboat Roof & Canopy */}
      <path d="M4 11L12 4L20 11H4Z" />
      {/* Houseboat Windows / Wooden Carved Frame */}
      <rect x="7" y="11" width="10" height="5" rx="0.5" />
      <line x1="12" y1="11" x2="12" y2="16" />
      {/* Houseboat Hull on Dal Lake */}
      <path d="M2 18C4 18 5 19 7 19C9 19 10 18 12 18C14 18 15 19 17 19C19 19 20 18 22 18" />
      <path d="M4 18L5 20H19L20 18" />
    </svg>
  );
}

// Sufi Trails: Sacred Kashmiri Sufi Shrine Dome & Serenity Arch
function ShrineIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      {/* Crescent finial */}
      <path d="M12 2V4" />
      <circle cx="12" cy="4" r="1" fill="currentColor" />
      {/* Traditional Kashmiri Shrine Dome */}
      <path d="M12 5C9 7.5 7 10 7 13H17C17 10 15 7.5 12 5Z" />
      {/* Pillars & Archway */}
      <path d="M5 21V13H19V21" />
      <path d="M9 21V16C9 14.9 10.3 14 12 14C13.7 14 15 14.9 15 16V21" />
    </svg>
  );
}

// Solo Travels: Backpacker Explorer Gear / Trekker Pack
function BackpackIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      {/* Top Grab Handle */}
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      {/* Main Backpack Body */}
      <rect x="5" y="6" width="14" height="15" rx="3" />
      {/* Front Storage Pocket */}
      <rect x="8" y="12" width="8" height="6" rx="1.5" />
      {/* Fastener Straps */}
      <line x1="8" y1="9" x2="16" y2="9" />
    </svg>
  );
}

// Traditional Visits: Artisan Chinar Heritage & Cultural Craft
function TraditionalChinarIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      {/* Kashmiri Chinar Leaf Silhouette */}
      <path d="M12 2C12 5 9 6.5 8 8C7 9.5 7.5 11 6 12C4.5 13 3 13 3 15C3 17 5 18 7 17.5C8 17.2 9 16 10 17C10.5 17.5 10 19 11 20C11.5 20.5 12 21 12 22C12 21 12.5 20.5 13 20C14 19 13.5 17.5 14 17C15 16 16 17.2 17 17.5C19 18 21 17 21 15C21 13 19.5 13 18 12C16.5 11 17 9.5 16 8C15 6.5 12 5 12 2Z" />
      {/* Center Stem */}
      <line x1="12" y1="10" x2="12" y2="22" />
    </svg>
  );
}

// Beginners Hikes: Folded Mountain Trail Map Icon
function HikingBootIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

// Alpine Lake Treks: Mountain Peaks reflected in High Waters
function MountainLakeIcon({
  className = "w-9 h-9",
  "aria-hidden": ariaHidden = true,
}: {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M3 14L8 7L13 14" />
      <path d="M11 14L15 9L21 14" />
      <path d="M2 18C4 18 6 17 8 17C10 17 12 18 14 18C16 18 18 17 20 17C21 17 22 18 22 18" />
      <path d="M2 21C4 21 6 20 8 20C10 20 12 21 14 21C16 21 18 20 20 20C21 20 22 21 22 21" />
    </svg>
  );
}

// =============================================================================
// 2. HELP ME CHOOSE CARDS DATA CATALOG (6 Cards matching Airbnb row layout)
// =============================================================================
export interface PathwayCardItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  svgUrl?: string; // Optional: Cloudinary SVG URL
  iconClassName?: string;
  fallbackIcon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  href: string;
  actionText: string;
}

// Hardcoded fallback removed — HelpMeChoose is strictly database-backed via TravelStyle model

const STYLE_ICON_MAP: Record<string, {
  svgUrl?: string;
  iconClassName?: string;
  fallbackIcon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}> = {
  culture: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789793264/palace_igvqrj.png",
    fallbackIcon: HouseboatIcon,
  },
  spiritual: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789793902/dervish_jr9igw.png",
    fallbackIcon: ShrineIcon,
  },
  nature: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789793956/solo-traveller_uiybia.png",
    fallbackIcon: BackpackIcon,
  },
  family: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789794097/building_grx3vy.png",
    fallbackIcon: TraditionalChinarIcon,
  },
  adventure: {
    svgUrl: "https://res.cloudinary.com/dcmoseix9/image/upload/v1789794239/hiking_rpczgx.png",
    iconClassName: "-scale-x-100",
    fallbackIcon: HikingBootIcon,
  },
  trekking: {
    svgUrl: "",
    fallbackIcon: MountainLakeIcon,
  },
};

export interface HelpMeChooseProps {
  travelStyles?: any[];
}

// =============================================================================
// CARD SIZE, WIDTH & GAP CONTROLS
// =============================================================================
export const HELP_ME_CHOOSE_CONFIG = {
  // 1. Container MAX-WIDTH (Airbnb style wide: "1560px")
  containerMaxWidth: "1560px",

  // 2. Card gap (Clean 16px gap for 6 cards)
  cardGap: "16px",

  // 3. Card HEIGHT (Calibrated for 6 cards in a single row with action button: "218px")
  cardHeight: "218px",

  // 4. Card corner roundness
  cardBorderRadius: "16px",

  // 5. Section top padding
  sectionPaddingTop: "14px",

  // 6. Section bottom padding
  sectionPaddingBottom: "18px",
};

// =============================================================================
// 3. MAIN COMPONENT: HelpMeChoose
// =============================================================================
export default function HelpMeChoose({ travelStyles }: HelpMeChooseProps = {}) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const cards: PathwayCardItem[] = React.useMemo(() => {
    if (travelStyles && travelStyles.length > 0) {
      return travelStyles.map((style) => {
        const iconConfig = STYLE_ICON_MAP[style.slug.toLowerCase()] || {
          fallbackIcon: MountainLakeIcon,
        };
        return {
          id: style.slug,
          title: style.name.toUpperCase(),
          subtitle: style.description || style.name,
          imageUrl:
            style.imageUrl ||
            "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1000&auto=format&fit=crop",
          svgUrl: iconConfig.svgUrl,
          iconClassName: iconConfig.iconClassName,
          fallbackIcon: iconConfig.fallbackIcon,
          href: `/tours/${style.slug}`,
          actionText: `Explore ${style.name}`,
        };
      });
    }
    return [];
  }, [travelStyles]);

  const checkScroll = React.useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);

    if (cards.length > 0) {
      const cardWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth + 16
        : scrollWidth / cards.length;
      const idx = Math.min(
        cards.length - 1,
        Math.max(0, Math.round(scrollLeft / cardWidth))
      );
      setActiveIndex(idx);
    }
  }, [cards.length]);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const scrollToCard = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const children = el.children;
    if (children[index]) {
      (children[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 200);
    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: isReduced ? "auto" : "smooth",
    });
  };

  if (cards.length === 0) {
    return (
      <section
        aria-labelledby="help-me-choose-heading"
        className="bg-white border-b py-8 text-center"
        style={{ borderColor: "var(--season-border)" }}
      >
        <div className="container mx-auto px-4">
          <h2 id="help-me-choose-heading" className="text-lg font-bold text-[#17211D] uppercase">
            HELP ME CHOOSE YOUR PERFECT TRIP
          </h2>
          <p className="text-xs text-[#56635E] mt-1">
            No active travel styles are currently available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="help-me-choose-heading"
      data-analytics-section="help-me-choose"
      className="bg-white border-b relative"
      style={{
        borderColor: "var(--season-border)",
        paddingTop: HELP_ME_CHOOSE_CONFIG.sectionPaddingTop,
        paddingBottom: HELP_ME_CHOOSE_CONFIG.sectionPaddingBottom,
      }}
    >
      <div
        className="w-full mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: HELP_ME_CHOOSE_CONFIG.containerMaxWidth }}
      >
        {/* Section Header (Airbnb Style: Left-Aligned Title + Right-Aligned Controls) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3.5 sm:mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="help-me-choose-heading"
                className="font-display text-xl sm:text-2xl md:text-[24px] font-extrabold text-[#17211D] tracking-tight uppercase"
              >
                HELP ME CHOOSE YOUR PERFECT TRIP
              </h2>
              <ArrowRight
                className="w-5 h-5 hidden sm:block shrink-0"
                style={{ color: "var(--season-secondary)" }}
                aria-hidden="true"
              />
            </div>
            <p className="text-xs sm:text-sm text-[#56635E] font-sans mt-0.5">
              Tell us your travel style, and we’ll curate your ideal Kashmir experience.
            </p>
          </div>

          {/* Right: Controls (Category Indicator + Accessible Navigation Arrows) */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-2xs select-none"
              style={{
                borderColor: "var(--season-border)",
                color: "var(--season-primary)",
                backgroundColor: "var(--season-primary-light)",
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{cards.length} Travel Styles</span>
            </div>

            <div
              className="flex items-center gap-1.5"
              role="group"
              aria-label="Travel styles carousel controls"
            >
              <button
                type="button"
                disabled={!canScrollLeft}
                onClick={() => handleScroll("left")}
                aria-label="Previous travel styles"
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:border-[var(--season-primary)] hover:text-[var(--season-primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--season-primary)]"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                disabled={!canScrollRight}
                onClick={() => handleScroll("right")}
                aria-label="Next travel styles"
                className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:border-[var(--season-primary)] hover:text-[var(--season-primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--season-primary)]"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            CARDS GRID: 6 Cards in a Single Row (Desktop) / Horizontal Snap (Mobile: 1 Prominent Card + Next Partial)
        =================================================================== */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex lg:grid overflow-x-auto lg:overflow-visible scrollbar-none snap-x snap-mandatory lg:snap-none lg:grid-cols-6 transition-all duration-300 py-1 -my-1"
          style={{
            gap: HELP_ME_CHOOSE_CONFIG.cardGap,
            scrollPaddingLeft: "1rem",
            scrollPaddingRight: "1rem",
          }}
          tabIndex={0}
          aria-label="Travel styles carousel"
        >
          {cards.map((card, idx) => {
            const FallbackIcon = card.fallbackIcon;
            const isHovered = hoveredCardId === card.id;

            return (
              <Link
                key={card.id}
                href={card.href}
                data-analytics-option={card.id}
                aria-label={`${card.title}: ${card.subtitle}. ${card.actionText}`}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className={`group relative overflow-hidden transition-all duration-300 transform flex flex-col justify-end px-2.5 sm:px-3 py-3 sm:py-4 select-none cursor-pointer border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--season-primary)] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none w-[80vw] max-w-[320px] sm:w-[280px] lg:w-auto h-[248px] lg:h-[218px] shrink-0 snap-center lg:snap-none lg:shrink ${
                  isHovered
                    ? "shadow-2xl -translate-y-1.5"
                    : "border-transparent hover:-translate-y-1 hover:shadow-xl"
                }`}
                style={{
                  borderRadius: HELP_ME_CHOOSE_CONFIG.cardBorderRadius,
                  borderColor: isHovered ? "var(--season-primary)" : "transparent",
                  boxShadow: isHovered ? "0 0 25px var(--season-focus-ring)" : undefined,
                }}
              >
                {/* 1. Full Bleed Background Imagery */}
                <Image
                  src={card.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover object-center transition-transform duration-700 ease-out motion-safe:group-hover:scale-108 motion-reduce:transform-none"
                  priority={idx < 6}
                  aria-hidden="true"
                />

                {/* 2. Centered Content at Bottom (Icon + Title + Subtitle + Action Badge) */}
                <div className="relative z-10 w-full flex flex-col items-center text-center pb-0.5">
                  {/* SVG Icon */}
                  <div
                    className="mb-1.5 sm:mb-2 transition-transform duration-300 motion-safe:group-hover:scale-110 drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] text-white"
                    aria-hidden="true"
                  >
                    {card.svgUrl ? (
                      <div className={`relative w-7 h-7 md:w-8 md:h-8 ${card.iconClassName || ""}`}>
                        <Image
                          src={card.svgUrl}
                          alt=""
                          fill
                          unoptimized
                          className="object-contain filter brightness-0 invert drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          aria-hidden="true"
                        />
                      </div>
                    ) : (
                      <FallbackIcon
                        className={`w-7 h-7 md:w-8 md:h-8 text-white stroke-[1.8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${card.iconClassName || ""}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  {/* Title (Bold Uppercase White with Crisp Contrast Shadow) */}
                  <h3 className="w-full font-display font-extrabold text-white text-[11px] sm:text-[11.5px] lg:text-[12px] xl:text-[12.5px] tracking-tight uppercase leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] [text-shadow:_0_1px_3px_rgba(0,0,0,0.9),_0_2px_8px_rgba(0,0,0,0.8)] transition-colors duration-200 truncate">
                    {card.title}
                  </h3>

                  {/* Subtitle (Concise description with text shadow) */}
                  <p className="w-full text-white text-[9.5px] sm:text-[10px] lg:text-[10.5px] font-medium leading-snug mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] [text-shadow:_0_1px_2px_rgba(0,0,0,0.9)] truncate">
                    {card.subtitle}
                  </p>

                  {/* View Action Badge (Subtle Glass Base with Seasonal Theme Hover) */}
                  <div className="mt-2 sm:mt-2.5 max-w-full">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-[10.5px] xl:text-[11px] font-semibold tracking-wide text-white bg-white/15 backdrop-blur-xs border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.15)] group-hover:bg-[var(--season-primary)] group-hover:border-[var(--season-primary)] group-hover:shadow-md transition-all duration-200 max-w-full group-hover:scale-102">
                      <span className="truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">{card.actionText}</span>
                      <ArrowRight
                        className="w-3 h-3 text-white transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile Carousel Swipe & Dot Pagination */}
        {cards.length > 1 && (
          <div className="flex lg:hidden flex-col items-center gap-1.5 mt-3.5 select-none" aria-hidden="true">
            <span className="text-[10.5px] font-medium text-[#56635E] tracking-wider">
              ← swipe →
            </span>
            <div
              className="flex items-center justify-center gap-1.5"
              role="tablist"
              aria-label="Travel style carousel indicators"
            >
              {cards.map((card, i) => (
                <button
                  key={card.id}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === i}
                  aria-label={`Go to ${card.title}`}
                  onClick={() => scrollToCard(i)}
                  className={`transition-all duration-200 rounded-full cursor-pointer ${
                    activeIndex === i
                      ? "w-6 h-2 bg-[var(--season-primary)]"
                      : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Can't find exactly what you're looking for? Customize CTA */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/80 rounded-2xl p-4 sm:px-6 sm:py-4">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-900 font-display">
              Can&apos;t find exactly what you&apos;re looking for?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Let our Srinagar destination experts design a custom package for your exact dates and group size.
            </p>
          </div>
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
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:brightness-105 active:scale-98 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: "var(--season-primary, #D62828)",
                }}
              >
                <span>Customize My Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          />
        </div>
      </div>
    </section>
  );
}

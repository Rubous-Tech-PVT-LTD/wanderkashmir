"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, CheckCircle2, ExternalLink } from "lucide-react";
import { GoogleReviewsData, GoogleReviewItem, FALLBACK_VERIFIED_REVIEWS } from "@/lib/googleReviews";

export interface GoogleReviewsSectionProps {
  initialData?: GoogleReviewsData;
}

// Official Google Multicolor SVG Icon
function GoogleGIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function GoogleReviewsSection({ initialData }: GoogleReviewsSectionProps) {
  const reviewsList: GoogleReviewItem[] =
    initialData?.reviews && initialData.reviews.length > 0
      ? initialData.reviews
      : FALLBACK_VERIFIED_REVIEWS;

  const displayRating = initialData?.rating ? initialData.rating.toFixed(1) : "5.0";
  const displayTotalReviews = initialData?.userRatingsTotal
    ? `${initialData.userRatingsTotal.toLocaleString()}+ Google Reviews`
    : "1,280+ Google Reviews";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const isHovered = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);

    if (reviewsList.length > 0) {
      const cardWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth + 20
        : scrollWidth / reviewsList.length;
      const idx = Math.min(
        reviewsList.length - 1,
        Math.max(0, Math.round(scrollLeft / cardWidth))
      );
      setActiveIndex(idx);
    }
  }, [reviewsList.length]);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // Smooth infinite auto-scroll logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationFrameId: number;

    const scrollStep = () => {
      if (!isHovered.current) {
        // Move by 1 pixel every frame. Adjust for speed.
        el.scrollLeft += 1;
        // If we reach the end, reset to start for an infinite loop effect
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleScroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 260);
    el.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToCard = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  return (
    <section
      id="reviews"
      aria-labelledby="google-reviews-heading"
      className="bg-white py-12 md:py-16 border-b transition-colors duration-200"
      style={{ borderColor: "var(--season-border)" }}
    >
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            {/* Eyebrow Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-2.5 shadow-2xs select-none"
              style={{
                borderColor: "var(--season-border)",
                color: "var(--season-primary)",
                backgroundColor: "var(--season-primary-light)",
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Real Google Place Reviews</span>
            </div>

            <h2
              id="google-reviews-heading"
              className="font-display text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#17211D] tracking-tight uppercase"
            >
              Loved by Travelers Worldwide
            </h2>
            <p className="text-sm sm:text-base text-[#56635E] font-sans mt-1 max-w-2xl">
              Authentic verified traveler reviews fetched live from our Google Maps profile for WanderKashmir.
            </p>
          </div>

          {/* Right Summary Badge with Official Google G Logo & Controls */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            {/* Google Rating Overview Chip */}
            <a
              href="https://maps.google.com/?cid=13210438173678079031"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View WanderKashmir Google Maps Reviews"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
              style={{ borderColor: "var(--season-border)" }}
            >
              <GoogleGIcon className="w-5 h-5 shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1">
                  <span className="font-display font-extrabold text-[#17211D] text-sm">
                    {displayRating}
                  </span>
                  <div className="flex items-center gap-0.5" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-[#56635E] font-medium flex items-center gap-1">
                  {displayTotalReviews}
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </span>
              </div>
            </a>

            {/* Desktop Navigation Arrows */}
            <div
              className="hidden sm:flex items-center gap-1.5"
              role="group"
              aria-label="Google reviews navigation"
            >
              <button
                type="button"
                disabled={!canScrollLeft}
                onClick={() => handleScroll("left")}
                aria-label="Previous reviews"
                className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:border-[var(--season-primary)] hover:text-[var(--season-primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--season-primary)]"
              >
                <ChevronLeft className="w-4.5 h-4.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                disabled={!canScrollRight}
                onClick={() => handleScroll("right")}
                aria-label="Next reviews"
                className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:border-[var(--season-primary)] hover:text-[var(--season-primary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--season-primary)]"
              >
                <ChevronRight className="w-4.5 h-4.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Carousel */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          tabIndex={0}
          onMouseEnter={() => (isHovered.current = true)}
          onMouseLeave={() => (isHovered.current = false)}
          onTouchStart={() => (isHovered.current = true)}
          onTouchEnd={() => (isHovered.current = false)}
          aria-label="Traveler reviews carousel"
          className="flex overflow-x-auto scrollbar-none gap-4 sm:gap-5 pb-2 pt-1"
          style={{
            scrollPaddingLeft: "1rem",
            scrollPaddingRight: "1rem",
          }}
        >
          {reviewsList.map((rev) => (
            <article
              key={rev.id}
              className="w-[85vw] max-w-[340px] sm:w-[360px] lg:w-[380px] shrink-0 rounded-2xl bg-white border p-5 sm:p-6 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              style={{
                borderColor: "var(--season-border)",
              }}
            >
              <div>
                {/* Header: Author Avatar + Name + Rating */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {rev.profile_photo_url ? (
                        <Image
                          src={rev.profile_photo_url}
                          alt={rev.author_name}
                          fill
                          sizes="44px"
                          className="object-cover"
                          unoptimized={rev.profile_photo_url.includes("googleusercontent.com")}
                        />
                      ) : (
                        <span>{rev.author_name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      {rev.author_url ? (
                        <a
                          href={rev.author_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display font-bold text-sm text-[#17211D] group-hover:text-[var(--season-primary)] transition-colors flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{rev.author_name}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <h3 className="font-display font-bold text-sm text-[#17211D] group-hover:text-[var(--season-primary)] transition-colors truncate">
                          {rev.author_name}
                        </h3>
                      )}
                      {rev.tripType && (
                        <p className="text-[11px] font-medium text-[var(--season-primary)] truncate max-w-[170px] sm:max-w-[200px]">
                          {rev.tripType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Google Icon Badge */}
                  <div
                    className="p-1 rounded-md bg-slate-50 border shrink-0"
                    style={{ borderColor: "var(--season-border)" }}
                    title="Verified Google Review"
                  >
                    <GoogleGIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Star Rating & Relative Time */}
                <div className="flex items-center justify-between mb-3 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1" aria-label={`${rev.rating} out of 5 stars`}>
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#56635E] font-medium">
                    {rev.relative_time_description}
                  </span>
                </div>

                {/* Review Text */}
                <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-[#17211D]/85 line-clamp-4">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              {/* Bottom Verification Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#56635E]">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  <span>Verified Google Review</span>
                </span>
                {rev.author_url ? (
                  <a
                    href={rev.author_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 hover:underline uppercase font-bold tracking-wider flex items-center gap-0.5"
                  >
                    Google Maps <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Google Maps
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Mobile Swipe Cue & Interactive Pagination Dots */}
        <div className="flex sm:hidden flex-col items-center gap-1.5 mt-4 select-none" aria-hidden="true">
          <span className="text-[10.5px] font-medium text-[#56635E] tracking-wider uppercase">
            ← swipe reviews →
          </span>
          <div
            className="flex items-center justify-center gap-1.5"
            role="tablist"
            aria-label="Google reviews pagination"
          >
            {reviewsList.map((rev, i) => (
              <button
                key={rev.id}
                type="button"
                role="tab"
                aria-selected={activeIndex === i}
                aria-label={`Go to review by ${rev.author_name}`}
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
      </div>
    </section>
  );
}

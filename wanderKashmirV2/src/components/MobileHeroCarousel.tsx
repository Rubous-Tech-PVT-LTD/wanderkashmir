"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  mapTravelStylesToCards,
  type PathwayCardItem,
  type TravelStyleInput,
} from "@/lib/travelStyles";

interface MobileHeroCarouselProps {
  travelStyles?: TravelStyleInput[];
}

const AUTOPLAY_INTERVAL_MS = 4500;
const INTERACTION_RESUME_DELAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;
const CLICK_GUARD_PX = 10;

function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function MobileHeroCarousel({
  travelStyles,
}: MobileHeroCarouselProps) {
  const slides: PathwayCardItem[] = useMemo(
    () => mapTravelStylesToCards(travelStyles),
    [travelStyles]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const safeActiveIndex =
    slides.length > 0 ? activeIndex % slides.length : 0;

  const scheduleAutoplayResume = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, INTERACTION_RESUME_DELAY_MS);
  }, []);

  const pauseAndScheduleResume = useCallback(() => {
    setIsPaused(true);
    scheduleAutoplayResume();
  }, [scheduleAutoplayResume]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || prefersReducedMotion || isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [slides.length, prefersReducedMotion, isPaused]);

  const goToSlide = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      const normalized = ((index % slides.length) + slides.length) % slides.length;
      setActiveIndex(normalized);
      pauseAndScheduleResume();
    },
    [slides.length, pauseAndScheduleResume]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (e.touches.length !== 1) return;
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      didSwipeRef.current = false;
      setIsPaused(true);
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    },
    []
  );

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (
      touchStartXRef.current === null ||
      touchStartYRef.current === null ||
      e.touches.length !== 1
    ) {
      return;
    }

    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    const deltaY = e.touches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > CLICK_GUARD_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
      didSwipeRef.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (
        touchStartXRef.current === null ||
        touchStartYRef.current === null ||
        e.changedTouches.length === 0
      ) {
        scheduleAutoplayResume();
        return;
      }

      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

      touchStartXRef.current = null;
      touchStartYRef.current = null;

      if (
        slides.length > 1 &&
        Math.abs(deltaX) >= SWIPE_THRESHOLD_PX &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        didSwipeRef.current = true;
        setActiveIndex((prev) =>
          deltaX < 0
            ? (prev + 1) % slides.length
            : (prev - 1 + slides.length) % slides.length
        );
      }

      scheduleAutoplayResume();

      setTimeout(() => {
        didSwipeRef.current = false;
      }, 80);
    },
    [slides.length, scheduleAutoplayResume]
  );

  const handleTouchCancel = useCallback(() => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    didSwipeRef.current = false;
    scheduleAutoplayResume();
  }, [scheduleAutoplayResume]);

  const handleCtaClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (didSwipeRef.current) {
      e.preventDefault();
    }
  }, []);

  if (slides.length === 0) {
    return (
      <section
        aria-label="Discover Kashmir"
        className="relative w-full h-[54dvh] min-h-[360px] max-h-[480px] flex flex-col justify-center overflow-hidden bg-black"
      />
    );
  }

  return (
    <section
      aria-label="Discover Kashmir by Travel Style"
      aria-roledescription="carousel"
      className="relative w-full h-[54dvh] min-h-[360px] max-h-[480px] overflow-hidden bg-black select-none touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={scheduleAutoplayResume}
    >
      {/* Horizontal Slide Track */}
      <div
        className={`flex h-full w-full ${
          prefersReducedMotion
            ? ""
            : "transition-transform duration-500 ease-out"
        }`}
        style={{
          transform: `translate3d(-${safeActiveIndex * 100}%, 0, 0)`,
        }}
      >
        {slides.map((slide, index) => {
          const FallbackIcon = slide.fallbackIcon;
          const isCurrent = index === safeActiveIndex;

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
              aria-hidden={!isCurrent}
              className="relative w-full h-full shrink-0 flex flex-col justify-end"
            >
              {/* Full-bleed Cloudinary Background Image */}
              <Image
                src={slide.imageUrl}
                alt={slide.imageAlt}
                fill
                sizes="100vw"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                className="object-cover object-center pointer-events-none"
              />

              {/* Subtle Dark Gradient Overlay for Readability & Top Navbar Contrast */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50 pointer-events-none"
                aria-hidden="true"
              />

              {/* Hero Banner Content */}
              <div className="relative z-10 w-full px-5 pt-16 pb-11 flex flex-col items-start text-left">
                {/* Category Icon */}
                <div
                  className="mb-2.5 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                  aria-hidden="true"
                >
                  {slide.svgUrl ? (
                    <div
                      className={`relative w-8 h-8 ${slide.iconClassName || ""}`}
                    >
                      <Image
                        src={slide.svgUrl}
                        alt=""
                        fill
                        sizes="32px"
                        className="object-contain filter brightness-0 invert drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        aria-hidden="true"
                      />
                    </div>
                  ) : (
                    <FallbackIcon
                      className={`w-8 h-8 text-white stroke-[1.8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                        slide.iconClassName || ""
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Category Title */}
                <h2 className="font-display font-extrabold text-white text-2xl sm:text-3xl tracking-tight uppercase leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                  {slide.title}
                </h2>

                {/* Category Subtitle */}
                <p className="text-white/90 text-sm sm:text-base font-medium leading-snug mt-1 max-w-[300px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                  {slide.subtitle}
                </p>

                {/* Seasonal Theme Explore CTA */}
                <Link
                  href={slide.href}
                  tabIndex={isCurrent ? 0 : -1}
                  onClick={handleCtaClick}
                  className="mt-3.5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-lg transition-all duration-200 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  style={{
                    backgroundColor: "var(--season-primary, #D62828)",
                  }}
                >
                  <span>{slide.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots Inside Existing Hero Container */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-3.5 left-0 right-0 z-20 flex items-center justify-center gap-1.5 px-4"
          role="tablist"
          aria-label="Hero category slides"
        >
          {slides.map((slide, idx) => {
            const isActive = idx === safeActiveIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to ${slide.title}`}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isActive
                    ? "w-6 shadow-sm"
                    : "w-2 bg-white/55 hover:bg-white/85"
                }`}
                style={
                  isActive
                    ? { backgroundColor: "var(--season-primary, #D62828)" }
                    : undefined
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Users, Clock, Sparkles, Map, Compass } from "lucide-react";

interface ToursRecommendationBarProps {
  currentCategory?: string | null;
}

export default function ToursRecommendationBar({ currentCategory }: ToursRecommendationBarProps) {
  const activeSlug = (currentCategory || "").toLowerCase().trim();
  const activeRef = useRef<HTMLAnchorElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollContainerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    }
  }, [activeSlug]);

  const CATEGORY_TILES = [
    {
      slug: "culture",
      label: "Culture",
      icon: Map,
      href: "/tours/culture",
    },
    {
      slug: "spiritual",
      label: "Spiritual",
      icon: Sparkles,
      href: "/tours/spiritual",
    },
    {
      slug: "nature",
      label: "Nature",
      icon: Compass,
      href: "/tours/nature",
    },
    {
      slug: "family",
      label: "Family",
      icon: Users,
      href: "/tours/family",
    },
    {
      slug: "adventure",
      label: "Adventure",
      icon: Sparkles,
      href: "/tours/adventure",
    },
    {
      slug: "trekking",
      label: "Trekking",
      icon: Clock,
      href: "/tours/trekking",
    },
    {
      slug: "",
      label: "Explore All",
      icon: Compass,
      href: "/tours",
    },
  ];

  return (
    <section className="w-full flex justify-center px-4 sm:px-6 lg:px-8 -mt-5 sm:-mt-7 relative z-20">
      <div className="w-full max-w-7xl rounded-2xl border border-slate-200/90 bg-white py-3 px-4 sm:py-3.5 sm:px-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Left: Helper Text (Compact) */}
        <div className="shrink-0 text-center lg:text-left space-y-0.5 max-w-sm">
          <h2 className="text-sm sm:text-base font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
            Not sure which tour is right for you?
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--season-muted,#6B7280)] leading-relaxed">
            Select what kind of experience you want, and we will highlight the ideal package.
          </p>
        </div>

        {/* Right: Category Shortcut Tiles (Compact & Crisp, No Edge Clipping) */}
        <div
          ref={scrollContainerRef}
          className="w-full lg:w-auto flex-1 flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto py-1 px-1 scrollbar-none justify-start lg:justify-end"
        >
          {CATEGORY_TILES.map((tile) => {
            const isExploreAll = tile.slug === "";
            const isCurrent = isExploreAll ? !activeSlug : activeSlug === tile.slug;
            const Icon = tile.icon;

            return (
              <Link
                key={tile.label}
                ref={isCurrent ? activeRef : undefined}
                href={tile.href}
                className={`flex flex-col items-center justify-center py-2 px-2 sm:py-2.5 sm:px-3 rounded-xl border text-center transition-all w-[76px] sm:w-[84px] shrink-0 box-border ${
                  isCurrent
                    ? "bg-[var(--season-primary-light,#ECFDF5)] border-[var(--season-primary)] text-[var(--season-primary)] font-bold shadow-xs ring-1 ring-[var(--season-primary)]/20"
                    : "bg-white border-slate-200 hover:border-slate-300 text-[var(--season-text,#374151)] hover:bg-slate-50/80 font-medium"
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                    isCurrent
                      ? "bg-[var(--season-primary)] text-white shadow-2xs"
                      : "bg-slate-50 text-[var(--season-primary)] border border-slate-200/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[10px] sm:text-[11px] leading-tight whitespace-nowrap">
                  {tile.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

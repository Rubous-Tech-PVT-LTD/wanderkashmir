"use client";

import Link from "next/link";
import { LIVE_TOURS_CATALOG, TourPackageDetail } from "@/data/liveToursData";
import { Compass, ArrowRight, Clock, Star } from "lucide-react";

interface TourSwitcherBannerProps {
  currentSlug: string;
}

export default function TourSwitcherBanner({ currentSlug }: TourSwitcherBannerProps) {
  const otherTours = LIVE_TOURS_CATALOG.filter((t) => t.slug !== currentSlug);

  return (
    <div className="rounded-3xl border border-[var(--season-border)] bg-[var(--season-surface)] p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--season-primary)]">
            Explore All 6 Live Kashmir Packages
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--season-text)] font-display mt-0.5">
            Compare Other Popular Itineraries
          </h3>
        </div>
        <Link
          href="/tours"
          className="text-xs sm:text-sm font-semibold text-[var(--season-primary)] hover:underline inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>View all packages</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherTours.slice(0, 3).map((tour) => (
          <Link
            key={tour.id}
            href={`/tours/${tour.slug}`}
            className="group rounded-2xl border border-[var(--season-border)] hover:border-[var(--season-primary)]/60 bg-white p-4 transition-all hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--season-muted)] mb-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {tour.duration}
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {tour.rating}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-[var(--season-text)] group-hover:text-[var(--season-primary)] transition-colors font-display line-clamp-1">
                {tour.title}
              </h4>
              <p className="text-xs text-[var(--season-muted)] mt-1 line-clamp-2">
                {tour.routeDisplay.join(" → ")}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--season-border)]/60">
              <div>
                <span className="text-xs text-[var(--season-muted)] block">From</span>
                <span className="font-bold text-sm text-[var(--season-text)]">
                  ₹{tour.price.toLocaleString()}
                </span>
              </div>
              <span className="text-xs font-semibold text-[var(--season-primary)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                View Package →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Compass, MapPin, Building, ArrowRight, Anchor, Home } from "lucide-react";

interface HotelInternalLinksProps {
  destinationHub: string;
  destinationSlug?: string | null;
  propertyType: string;
}

export default function HotelInternalLinks({
  destinationHub,
  destinationSlug,
  propertyType,
}: HotelInternalLinksProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
          Explore More in {destinationHub} & Kashmir
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Destination Guide */}
        {destinationSlug && (
          <Link
            href={`/destinations/${destinationSlug}`}
            className="p-4 rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white hover:border-[var(--season-primary)] shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between space-y-2"
          >
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[var(--season-primary)] transition-colors font-display">
                {destinationHub} Destination Guide
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                Discover top sightseeing places, weather, and travel tips.
              </p>
            </div>
            <div className="text-[11px] font-bold text-[var(--season-primary)] flex items-center gap-1">
              <span>View Guide</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        )}

        {/* More Stays in this destination */}
        <Link
          href={`/stays?location=${encodeURIComponent(destinationHub)}`}
          className="p-4 rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white hover:border-[var(--season-primary)] shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between space-y-2"
        >
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[var(--season-primary)] transition-colors font-display">
              All Stays in {destinationHub}
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Browse other verified hotels, homestays, and resorts in the area.
            </p>
          </div>
          <div className="text-[11px] font-bold text-[var(--season-primary)] flex items-center gap-1">
            <span>Explore Stays</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Heritage Houseboats */}
        <Link
          href="/stays?type=houseboat"
          className="p-4 rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white hover:border-[var(--season-primary)] shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between space-y-2"
        >
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Anchor className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[var(--season-primary)] transition-colors font-display">
              Heritage Dal Lake Houseboats
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Experience handcrafted cedarwood houseboats floating on tranquil waters.
            </p>
          </div>
          <div className="text-[11px] font-bold text-[var(--season-primary)] flex items-center gap-1">
            <span>View Houseboats</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Curated Tour Packages */}
        <Link
          href="/tours"
          className="p-4 rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white hover:border-[var(--season-primary)] shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between space-y-2"
        >
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[var(--season-primary)] transition-colors font-display">
              Kashmir Tour Packages
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2">
              Complete itineraries with transport, hotels, and local sightseeing included.
            </p>
          </div>
          <div className="text-[11px] font-bold text-[var(--season-primary)] flex items-center gap-1">
            <span>Browse Tours</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </section>
  );
}

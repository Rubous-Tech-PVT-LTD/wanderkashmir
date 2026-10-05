"use client";

import Link from "next/link";
import { MapPin, ArrowRight, Compass, Sparkles, CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";
import { TourPackageDetail, TourItineraryDay, TourResolvedDestinationItem } from "@/data/liveToursData";
import { analyzeTourRoute } from "@/lib/tours/routeResolver";

interface TourRouteMapProps {
  tour?: TourPackageDetail;
  destinations?: string[];
  itinerary?: TourItineraryDay[];
  resolvedDestinations?: TourResolvedDestinationItem[];
  whyThisRoute?: string[];
  duration?: string;
}

export default function TourRouteMap({
  tour,
  destinations,
  itinerary,
  resolvedDestinations,
  whyThisRoute,
  duration,
}: TourRouteMapProps) {
  const effectiveDestinations = tour?.destinations || destinations || [];
  const effectiveItinerary = tour?.itinerary || itinerary || [];
  const effectiveResolved = tour?.resolvedDestinations || resolvedDestinations || [];
  const effectiveWhyThisRoute = tour?.whyThisRoute || whyThisRoute || [];
  const effectiveDuration = tour?.duration || duration || "";

  // Perform deterministic route analysis
  const analysis = analyzeTourRoute(
    effectiveItinerary,
    effectiveDestinations,
    effectiveResolved,
    effectiveWhyThisRoute,
    effectiveDuration
  );

  const { circuit, uniqueStops, days, whyThisRouteBullets, svgPath } = analysis;

  return (
    <div className="space-y-6">
      {/* 1. WHY THIS ROUTE (Curated Route Explanation) */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100/80 flex items-center justify-center text-[var(--season-primary,#065F46)] shrink-0">
            <Sparkles className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-display">
              Why This Route
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600">
              Curated travel circuit based on this tour’s sequence & pacing
            </p>
          </div>
        </div>

        <ul className="space-y-2 pt-1 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
          {whyThisRouteBullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. ROUTE OVERVIEW (Circuit Sequence Breadcrumbs) */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-2">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Tour Route Circuit
        </div>
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {circuit.map((hop, idx) => (
            <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs sm:text-sm font-bold bg-slate-100 text-slate-800 border border-slate-200/80">
                {hop}
              </span>
              {idx < circuit.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-[var(--season-primary,#065F46)] shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. DYNAMIC TOUR ROUTE MAP (SVG Topographic Visual Canvas) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-12">
        {/* Left (7 cols): Map Canvas */}
        <div className="md:col-span-7 bg-[#E8F0E8] relative min-h-[300px] sm:min-h-[340px] flex items-center justify-center p-6 overflow-hidden">
          {/* Subtle topographical dot-matrix texture */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `radial-gradient(#065F46 0.75px, transparent 0.75px), radial-gradient(#065F46 0.75px, #E8F0E8 0.75px)`,
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
            }}
          />

          {/* Dynamic SVG Connecting Route */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" fill="none">
            {/* Background subtle mountain contour reference curves */}
            <path
              d="M20 280 Q 80 200, 160 220 T 320 180 T 400 240"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M0 120 Q 120 80, 240 100 T 380 60"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Glowing route line backdrop */}
            {svgPath && (
              <path
                d={svgPath}
                stroke="#6EE7B7"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40"
              />
            )}

            {/* Active connecting route line dynamically rendered for THIS tour */}
            {svgPath && (
              <path
                d={svgPath}
                stroke="#065F46"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="7 4"
                className="opacity-90"
              />
            )}
          </svg>

          {/* Dynamic Destination Markers for THIS tour ONLY */}
          <div className="relative w-full h-[260px]">
            {uniqueStops.map((stop) => {
              const { coord, isHub, order, name } = stop;

              return (
                <div
                  key={stop.key}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10"
                  style={{ left: coord.left, top: coord.top }}
                >
                  {isHub ? (
                    <div
                      className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md ring-2 ring-white"
                      title={`${name} (Arrival & Departure Hub)`}
                    >
                      <MapPin className="w-3.5 h-3.5 fill-current" />
                    </div>
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full bg-[var(--season-primary,#065F46)] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs"
                      title={`${name} (Stop ${order})`}
                    >
                      {order}
                    </div>
                  )}

                  <span className="text-xs sm:text-[13px] font-bold text-slate-900 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-2xs border border-slate-200/90 whitespace-nowrap flex items-center gap-1">
                    {name}
                    {isHub && (
                      <span className="text-[10px] font-medium text-rose-600 uppercase">
                        Hub
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (5 cols): Destinations Quick Overview */}
        <div className="md:col-span-5 p-4 sm:p-5 border-t md:border-t-0 md:border-l border-slate-200/90 flex flex-col justify-between bg-white space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[var(--season-primary,#065F46)]" />
                <span>Tour Destinations ({uniqueStops.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                In Visit Order
              </span>
            </div>

            <div className="space-y-2">
              {uniqueStops.map((stop) => {
                const innerContent = (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 group-hover:bg-[var(--season-primary)] group-hover:text-white transition-colors">
                        {stop.order}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {stop.name}
                      </span>
                    </div>

                    {stop.hasPublicPage && stop.slug ? (
                      <span className="text-[11px] font-medium text-[var(--season-primary,#065F46)] flex items-center gap-0.5 shrink-0">
                        <span>Explore</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Stop
                      </span>
                    )}
                  </div>
                );

                if (stop.hasPublicPage && stop.slug) {
                  return (
                    <Link
                      key={stop.key}
                      href={`/destinations/${stop.slug}`}
                      className="block focus:outline-none"
                    >
                      {innerContent}
                    </Link>
                  );
                }

                return <div key={stop.key}>{innerContent}</div>;
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-normal">
            Private vehicle & verified local chauffeur accompany you through each inter-valley segment.
          </div>
        </div>
      </div>

      {/* 4. DAY-WISE ROUTE (Sequential Itinerary Stops Breakdown) */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
            Day-wise Route Breakdown
          </h3>
          <span className="text-xs text-slate-500">
            {days.length} {days.length === 1 ? "Day" : "Days"} Itinerary
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {days.map((day, idx) => {
            const dayLabel =
              typeof day.dayNumber === "string" && day.dayNumber.toLowerCase().startsWith("day")
                ? day.dayNumber
                : `Day ${day.dayNumber}`;

            return (
              <div
                key={idx}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-bold shrink-0 border border-slate-200/60">
                    {dayLabel}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                      {day.title}
                    </div>
                    {day.desc && (
                      <div className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
                        {day.desc.split("\n")[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[var(--season-primary,#065F46)] border border-emerald-200/80 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{day.destination}</span>
                  </span>
                  {day.isExcursion && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Day Excursion
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

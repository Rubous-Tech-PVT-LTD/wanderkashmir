"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Car,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Star,
  Compass,
  HelpCircle,
  ArrowRight,
  FileText,
  Calendar,
  BedDouble,
  Sparkles,
  Lightbulb,
  ShieldCheck,
  Map,
  Image as ImageIcon,
} from "lucide-react";
import { TourPackageDetail } from "@/data/liveToursData";
import { RichContentRenderer } from "@/components/destinations/RichContentRenderer";


interface TourContentTabsProps {
  tour: TourPackageDetail;
}

type TabType =
  | "places"
  | "stays"
  | "best-time"
  | "itinerary"
  | "transport"
  | "food"
  | "shopping"
  | "experiences"
  | "nearby"
  | "faq";



export default function TourContentTabs({ tour }: TourContentTabsProps) {
  // Use a multi-open state model. Initial state must represent all sections as CLOSED.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  // Inside Itinerary: Single active day state. Initial state: no day detail is selected/open initially.
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);
  
  // Real DB Experiences filtering
  const activeExperiences = (tour.experiences || []).filter(e => e.status === "ACTIVE").sort((a, b) => a.displayOrder - b.displayOrder);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const willBeOpen = !prev[id];
      if (id === "itinerary" && !willBeOpen) {
        // Reset active day when itinerary accordion closes
        setActiveDayIdx(null);
      }
      return {
        ...prev,
        [id]: willBeOpen
      };
    });
  };

  const navigateToSection = (id: string) => {
    // 1. Open that section.
    setOpenSections((prev) => ({
      ...prev,
      [id]: true
    }));
    
    // 2. Scroll with a slight delay to ensure layout is updated
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -90; 
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "places", label: "Places" },
    { id: "stays", label: "Where to Stay" },
    { id: "best-time", label: "Best Time to Visit" },
    { id: "itinerary", label: "Itinerary" },
    { id: "transport", label: "How to Reach" },
    { id: "food", label: "Food" },
    { id: "shopping", label: "Shopping" },
    { id: "experiences", label: "Activities" },
    { id: "nearby", label: "Nearby Places" },
    { id: "faq", label: "FAQ" },
  ];

  // Helper icon renderer for feature cards (clean, stroke-1.8)
  const renderFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case "clock":
        return <Clock className="w-4 h-4 text-[var(--season-primary,#065F46)] stroke-[1.8]" />;
      case "pin":
        return <MapPin className="w-4 h-4 text-[var(--season-primary,#065F46)] stroke-[1.8]" />;
      case "hotel":
        return <BedDouble className="w-4 h-4 text-[var(--season-primary,#065F46)] stroke-[1.8]" />;
      case "car":
        return <Car className="w-4 h-4 text-[var(--season-primary,#065F46)] stroke-[1.8]" />;
      case "meals":
        return <UtensilsCrossed className="w-4 h-4 text-[var(--season-primary,#065F46)] stroke-[1.8]" />;
      default:
        return <Clock className="w-4 h-4 text-[var(--season-primary,#065F46)] stroke-[1.8]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation matching reference layout: clean underline */}
      <div className="border-b border-slate-200/90 -mx-4 px-4 sm:mx-0 sm:px-0 sticky top-16 z-20 bg-white mb-2">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = !!openSections[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigateToSection(tab.id)}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? "text-[var(--season-primary,#065F46)]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--season-primary,#065F46)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPACT ACCORDION CARDS LIST (8-10px gap desktop, 6-8px gap mobile) */}
      <div className="space-y-2 sm:space-y-2.5">
{/* 1. PLACES */}
        <section
          id="places"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["places"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("places")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["places"]}
            aria-controls="content-places"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <MapPin className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                  Places
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  Destinations covered in this tour
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["places"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["places"] && (
            <div
              id="content-places"
              className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {tour.destinations && tour.destinations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(tour.resolvedDestinations && tour.resolvedDestinations.length > 0
                    ? tour.resolvedDestinations
                    : tour.destinations.map((d: any) => ({ name: d, hasPublicPage: false, slug: undefined }))
                  ).map((dest: any, idx: number) => (
                    <span key={`${dest.name}-${idx}`}>
                      {dest.hasPublicPage && dest.slug ? (
                        <Link
                          href={`/destinations/${dest.slug}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                        >
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          {dest.name}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {dest.name}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-1.5">
                  <MapPin className="w-6 h-6 text-slate-300" />
                  <p className="text-xs text-slate-500 font-medium">Destinations for this tour will appear here.</p>
                </div>
              )}
            </div>
          )}
        </section>
<section
          id="stays"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["stays"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("stays")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["stays"]}
            aria-controls="content-stays"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <BedDouble className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                  Accommodations & Stays
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  Verified hotel, resort, and houseboat allocations
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["stays"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["stays"] && (
            <div
              id="content-stays"
              className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {tour.stays && tour.stays.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tour.stays.map((stay) => {
                    if (stay.propertyId && stay.image && stay.name) {
                      return (
                        <Link
                          key={stay.id}
                          href={`/stays/${stay.propertyId}`}
                          className="group p-3 rounded-lg border border-slate-200/80 bg-slate-50/30 hover:border-[var(--season-primary)]/70 hover:shadow-2xs transition-all space-y-2.5 block"
                        >
                          <div className="relative aspect-16/10 rounded-md overflow-hidden bg-slate-100">
                            <Image
                              src={stay.image}
                              alt={stay.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                              {stay.nights} {stay.nights === 1 ? "Night" : "Nights"}
                            </div>
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                              {stay.type || stay.stayType || "Stay"}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <MapPin className="w-3 h-3 shrink-0 text-[var(--season-primary)]" />
                              <span className="truncate">{stay.location || stay.destination}</span>
                            </div>
                            <h3 className="font-semibold text-sm text-slate-900 group-hover:text-[var(--season-primary)] transition-colors">
                              {stay.name}
                            </h3>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                            <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Assigned Stay
                            </span>
                            <span className="font-semibold text-[var(--season-primary)] group-hover:underline flex items-center gap-0.5">
                              View Details →
                            </span>
                          </div>
                        </Link>
                      );
                    }

                    // Unassigned Stay Slot
                    return (
                      <div
                        key={stay.id}
                        className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/30 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-[var(--season-primary)] flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {stay.destination}
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {stay.nights} {stay.nights === 1 ? "Night" : "Nights"}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-semibold text-sm text-slate-900">
                              {stay.destination} — {stay.nights} {stay.nights === 1 ? "Night" : "Nights"}
                            </h3>
                            <p className="text-xs font-medium text-amber-700 mt-0.5">
                              Accommodation: To be assigned
                            </p>
                          </div>

                          <p className="text-xs text-slate-500 leading-relaxed">
                            Pre-inspected {stay.stayType ? stay.stayType.toLowerCase() : "hotel"} accommodation aligned with package category standards.
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                          <span className="font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80">
                            Slot Reserved ({stay.stayType || "Hotel"})
                          </span>
                          <span className="text-slate-400">
                            {stay.destination} Circuit
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                    Accommodation details will be added soon.
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Verified hotel, resort, and houseboat allocations for this package are currently being curated.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <section
          id="best-time"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["best-time"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("best-time")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["best-time"]}
            aria-controls="content-best-time"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <Clock className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                  Best Time to Visit
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  When to experience this journey
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["best-time"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["best-time"] && (
            <div
              id="content-best-time"
              className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {tour.contentSections?.bestTime ? (
                <div className="p-4 sm:p-5 rounded-lg border border-slate-200/80 bg-slate-50/40 text-slate-700 text-xs sm:text-[13.5px] leading-relaxed">
                  <RichContentRenderer content={tour.contentSections.bestTime} className="prose-sm max-w-none text-slate-700" />
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-1.5 min-h-[140px]">
                  <Clock className="w-6 h-6 text-slate-300" />
                  <p className="text-xs text-slate-500 font-medium">Best time information hasn't been configured for this tour yet.</p>
                </div>
              )}
            </div>
          )}
        </section>
<section
          id="itinerary"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["itinerary"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("itinerary")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["itinerary"]}
            aria-controls="content-itinerary"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <Calendar className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                  Day-by-Day Itinerary
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  {tour.itinerary && tour.itinerary.length > 0
                    ? `${tour.itinerary.length} days curated journey with flexible pacing`
                    : "Curated schedule with daily highlights"}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["itinerary"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["itinerary"] && (
            <div
              id="content-itinerary"
              className="w-full max-w-none px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 animate-in fade-in slide-in-from-top-1 duration-200"
              style={{ width: "100%", maxWidth: "none" }}
            >
              {!tour.itinerary || tour.itinerary.length === 0 ? (
                <div className="w-full p-6 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-1.5 min-h-[140px]">
                  <Calendar className="w-6 h-6 text-slate-300" />
                  <p className="text-xs text-slate-500 font-medium">
                    Detailed itinerary schedule is being updated for this season.
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-none space-y-3.5" style={{ width: "100%", maxWidth: "none" }}>
                  {/* Dynamic Day Selector Tabs */}
                  <div
                    role="tablist"
                    aria-label="Tour itinerary days"
                    className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5"
                  >
                    {tour.itinerary.map((dayPlan, idx) => {
                      const isSelected = activeDayIdx === idx;
                      const dayNum =
                        typeof dayPlan.day === "string"
                          ? dayPlan.day.replace(/[^0-9]/g, "") || String(idx + 1)
                          : String(dayPlan.day);
                      return (
                        <button
                          key={idx}
                          role="tab"
                          type="button"
                          id={`day-tab-${idx}`}
                          aria-selected={isSelected}
                          aria-controls={`day-panel-${idx}`}
                          onClick={() => setActiveDayIdx(activeDayIdx === idx ? null : idx)}
                          className={`shrink-0 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-[13px] transition-all duration-150 cursor-pointer border ${
                            isSelected
                              ? "bg-[var(--season-primary)] text-white border-[var(--season-primary)] shadow-2xs font-semibold"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90 hover:border-slate-300 font-medium"
                          }`}
                        >
                          Day {dayNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Day Detail Layout: Only ONE day active at a time */}
                  {activeDayIdx === null ? (
                    <div className="w-full py-5 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 text-center">
                      <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                        Select a day above to view the detailed schedule, route stops, and activities.
                      </p>
                    </div>
                  ) : (() => {
                    const activeDay = tour.itinerary[activeDayIdx];
                    if (!activeDay) return null;
                    const dayNum =
                      typeof activeDay.day === "string"
                        ? activeDay.day.replace(/[^0-9]/g, "") || String(activeDayIdx + 1)
                        : String(activeDay.day);
                    const cleanTitle = (activeDay.title || "")
                      .replace(new RegExp(`^Day\\s*${dayNum}\\s*[:\\-–—]?\\s*`, "i"), "")
                      .replace(/^Day\\s*\\d+\\s*[:\\-–—]?\\s*/i, "")
                      .trim() || activeDay.title || `Day ${dayNum}`;

                    return (
                      <div
                        key={activeDayIdx}
                        id={`day-panel-${activeDayIdx}`}
                        role="tabpanel"
                        aria-labelledby={`day-tab-${activeDayIdx}`}
                        className="w-full max-w-none rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-5 transition-all duration-200 animate-in fade-in duration-200"
                        style={{ width: "100%", maxWidth: "none" }}
                      >
                        {/* Mobile Layout (< md): Single column, image placed after heading and before description */}
                        <div className="md:hidden space-y-3 w-full">
                          {/* Mobile Day Heading */}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[11px] font-bold text-[var(--season-primary)] uppercase tracking-wider bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 rounded-md">
                                Day {dayNum}
                              </span>
                              {activeDay.location && (
                                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{activeDay.location}</span>
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                              {cleanTitle}
                            </h3>
                          </div>

                          {/* Image / Empty Media placed after heading */}
                          <div className="self-start mt-0 w-full aspect-[4/3] rounded-xl overflow-hidden" style={{ width: "100%" }}>
                            {activeDay.image ? (
                              <div className="relative w-full h-full bg-slate-100 border border-slate-200/80">
                                <Image
                                  src={activeDay.image}
                                  alt={cleanTitle}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 380px"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full border border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center p-4 text-center">
                                <div className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-2 shadow-2xs">
                                  <ImageIcon className="w-4.5 h-4.5 stroke-[1.5]" />
                                </div>
                                <p className="text-xs font-medium text-slate-600">
                                  Image yet to be assigned
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Visuals will be updated for Day {dayNum}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {activeDay.desc && (
                            <div className="text-xs sm:text-[13px] text-slate-600 leading-relaxed space-y-1">
                              <RichContentRenderer content={activeDay.desc} className="prose-sm max-w-none text-slate-600" />
                            </div>
                          )}

                          {/* Info Rows / Metadata blocks: Stay, Meals, Activities */}
                          {(activeDay.stay ||
                            activeDay.meals ||
                            (activeDay.activities && activeDay.activities.length > 0)) && (
                            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {activeDay.stay && (
                                <div className="p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/60 min-w-0">
                                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-0.5">
                                    <BedDouble className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
                                    <span>Stay</span>
                                  </div>
                                  <p className="text-xs text-slate-600 truncate" title={activeDay.stay}>
                                    {activeDay.stay}
                                  </p>
                                </div>
                              )}
                              {activeDay.meals && (
                                <div className="p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/60 min-w-0">
                                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-0.5">
                                    <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
                                    <span>Meals</span>
                                  </div>
                                  <p className="text-xs text-slate-600 truncate" title={activeDay.meals}>
                                    {activeDay.meals}
                                  </p>
                                </div>
                              )}
                              {activeDay.activities && activeDay.activities.length > 0 && (
                                <div className="p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/60 min-w-0">
                                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-0.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
                                    <span>Activities</span>
                                  </div>
                                  <p
                                    className="text-xs text-slate-600 truncate"
                                    title={activeDay.activities.join(", ")}
                                  >
                                    {activeDay.activities.join(", ")}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Desktop Layout (>= md): Strict 2-Column CSS Grid with exact top alignment spanning full width */}
                        <div
                          className="hidden md:grid items-start w-full max-w-none"
                          style={{
                            gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 38%)",
                            gap: "24px",
                            alignItems: "start",
                            width: "100%",
                            maxWidth: "none",
                          }}
                        >
                          {/* Left Column: Starts at the very top */}
                          <div className="space-y-3 min-w-0 w-full">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[11px] font-bold text-[var(--season-primary)] uppercase tracking-wider bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 rounded-md">
                                  Day {dayNum}
                                </span>
                                {activeDay.location && (
                                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{activeDay.location}</span>
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight leading-snug">
                                {cleanTitle}
                              </h3>
                            </div>

                            {/* Description */}
                            {activeDay.desc && (
                              <div className="text-xs sm:text-[13px] text-slate-600 leading-relaxed space-y-1">
                                <RichContentRenderer content={activeDay.desc} className="prose-sm max-w-none text-slate-600" />
                              </div>
                            )}

                            {/* Metadata Blocks */}
                            {(activeDay.stay ||
                              activeDay.meals ||
                              (activeDay.activities && activeDay.activities.length > 0)) && (
                              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {activeDay.stay && (
                                  <div className="p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/60 min-w-0">
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-0.5">
                                      <BedDouble className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
                                      <span>Stay</span>
                                    </div>
                                    <p className="text-xs text-slate-600 truncate" title={activeDay.stay}>
                                      {activeDay.stay}
                                    </p>
                                  </div>
                                )}
                                {activeDay.meals && (
                                  <div className="p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/60 min-w-0">
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-0.5">
                                      <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
                                      <span>Meals</span>
                                    </div>
                                    <p className="text-xs text-slate-600 truncate" title={activeDay.meals}>
                                      {activeDay.meals}
                                    </p>
                                  </div>
                                )}
                                {activeDay.activities && activeDay.activities.length > 0 && (
                                  <div className="p-2.5 rounded-lg border border-slate-200/70 bg-slate-50/60 min-w-0">
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-0.5">
                                      <Sparkles className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
                                      <span>Activities</span>
                                    </div>
                                    <p
                                      className="text-xs text-slate-600 truncate"
                                      title={activeDay.activities.join(", ")}
                                    >
                                      {activeDay.activities.join(", ")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right Column: Starts at the EXACT SAME TOP coordinate and spans full column width */}
                          <div
                            className="self-start mt-0 w-full aspect-[4/3] rounded-xl overflow-hidden"
                            style={{ width: "100%" }}
                          >
                            {activeDay.image ? (
                              <div className="relative w-full h-full bg-slate-100 border border-slate-200/80">
                                <Image
                                  src={activeDay.image}
                                  alt={cleanTitle}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 1024px) 38vw, 360px"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full border border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center p-4 text-center">
                                <div className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-2 shadow-2xs">
                                  <ImageIcon className="w-4.5 h-4.5 stroke-[1.5]" />
                                </div>
                                <p className="text-xs font-medium text-slate-600">
                                  Image yet to be assigned
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Visuals will be updated for Day {dayNum}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </section>
<section
          id="transport"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["transport"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("transport")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["transport"]}
            aria-controls="content-transport"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <Car className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                    Transport & Transfers
                  </h2>
                  {tour.transports && tour.transports.length > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {tour.transports.length} Segments
                    </span>
                  )}
                </div>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  Dedicated private vehicle, airport transfers and local touring
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["transport"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["transport"] && (
            <div
              id="content-transport"
              className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {tour.transports && tour.transports.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tour.transports.map((seg, idx) => {
                    const isAssigned = !!seg.vehicleId && !!seg.vehicle;
                    const vehicle = seg.vehicle;
                    const driver = seg.driver;

                    if (isAssigned && vehicle) {
                      const vehicleTitle = `${vehicle.make ? vehicle.make + " " : ""}${vehicle.model}`;
                      const vehicleImg = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null;

                      return (
                        <div
                          key={seg.id || idx}
                          className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/30 space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <Car className="w-3 h-3 text-blue-600" />
                                {seg.origin} → {seg.destination}
                              </span>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {seg.purpose || "Transfer"}
                              </span>
                            </div>

                            {vehicleImg && (
                              <div className="relative w-full h-28 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                <Image
                                  src={vehicleImg}
                                  alt={vehicleTitle}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mb-0.5">
                                <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600" />
                                <span>Private Vehicle Assigned</span>
                              </div>
                              <h3 className="font-semibold text-sm text-slate-900">
                                {vehicleTitle}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {vehicle.type || "Vehicle"}{vehicle.capacity ? ` • Capacity: ${vehicle.capacity} Guests` : ""}
                                {vehicle.registrationNum ? ` • RC: ${vehicle.registrationNum.toUpperCase()}` : ""}
                              </p>
                              {vehicle.vendorProfile?.businessName && (
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Operator: <span className="font-medium text-slate-700">{vehicle.vendorProfile.businessName}</span>
                                </p>
                              )}
                            </div>

                            {driver && driver.name && (
                              <div className="p-2 rounded-md bg-white border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[9px]">
                                    {driver.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900 text-xs">{driver.name}</p>
                                    <p className="text-[10px] text-slate-400">Verified Chauffeur</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                  Active
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                            <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Dedicated Cab
                            </span>
                            <Link
                              href="/taxis"
                              className="font-semibold text-[var(--season-primary)] hover:underline flex items-center gap-0.5"
                            >
                              View Fleet →
                            </Link>
                          </div>
                        </div>
                      );
                    }

                    // Unassigned transport segment
                    return (
                      <div
                        key={seg.id || idx}
                        className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/30 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Car className="w-3 h-3 text-amber-700" />
                              {seg.origin} → {seg.destination}
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {seg.purpose || "Transfer"}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-semibold text-sm text-slate-900">
                              {seg.origin} → {seg.destination}
                            </h3>
                            <p className="text-xs font-medium text-amber-700 mt-0.5">
                              Transport: To be assigned
                            </p>
                          </div>

                          <p className="text-xs text-slate-500 leading-relaxed">
                            Route segment reserved. Verified private mountain vehicle and certified local driver assigned prior to journey.
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                          <span className="font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80">
                            Private Transfer Included
                          </span>
                          <span className="text-slate-400">
                            Tolls Covered
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                    Transport details will be added soon.
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Verified private mountain transport allocations for this circuit are currently being finalized.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <section
          id="food"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["food"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("food")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["food"]}
            aria-controls="content-food"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <UtensilsCrossed className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                  Food
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  Local food and meal details
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["food"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["food"] && (
            <div
              id="content-food"
              className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {tour.contentSections?.food ? (
                <div className="p-4 sm:p-5 rounded-lg border border-slate-200/80 bg-slate-50/40 text-slate-700 text-xs sm:text-[13.5px] leading-relaxed">
                  <RichContentRenderer content={tour.contentSections.food} className="prose-sm max-w-none text-slate-700" />
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-1.5 min-h-[140px]">
                  <UtensilsCrossed className="w-6 h-6 text-slate-300" />
                  <p className="text-xs text-slate-500 font-medium">Local food recommendations will appear here once configured.</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section
          id="shopping"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["shopping"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("shopping")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["shopping"]}
            aria-controls="content-shopping"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <Sparkles className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                  Shopping
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  Local shopping and souvenirs
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["shopping"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["shopping"] && (
            <div
              id="content-shopping"
              className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {tour.contentSections?.shopping ? (
                <div className="p-4 sm:p-5 rounded-lg border border-slate-200/80 bg-slate-50/40 text-slate-700 text-xs sm:text-[13.5px] leading-relaxed">
                  <RichContentRenderer content={tour.contentSections.shopping} className="prose-sm max-w-none text-slate-700" />
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-1.5 min-h-[140px]">
                  <Sparkles className="w-6 h-6 text-slate-300" />
                  <p className="text-xs text-slate-500 font-medium">Shopping recommendations haven't been configured yet.</p>
                </div>
              )}
            </div>
          )}
        </section>
<section
          id="experiences"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["experiences"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("experiences")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["experiences"]}
            aria-controls="content-experiences"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <Sparkles className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                  Included Iconic Experiences
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  {activeExperiences.length
                    ? `${activeExperiences.length} handpicked activities & excursions`
                    : "Curated local cultural and adventure activities"}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["experiences"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["experiences"] && (
            <div
              id="content-experiences"
              className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {activeExperiences.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeExperiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/30 space-y-1.5 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--season-primary)] uppercase tracking-wider">
                          <Compass className="w-3 h-3 shrink-0" />
                          <span>{exp.destination}</span>
                          {exp.dayNumber && <span>• Day {exp.dayNumber}</span>}
                        </div>
                        {exp.isOptional && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider">
                            Optional
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-xs sm:text-[13.5px] text-slate-900 leading-snug">
                        {exp.title}
                      </h3>

                      {exp.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {exp.description}
                        </p>
                      )}

                      {(exp.duration || exp.basePrice !== null) && (
                        <div className="flex items-center gap-3 pt-1.5 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                          {exp.duration && <span>⏱ {exp.duration}</span>}
                          {exp.basePrice !== null && exp.basePrice !== undefined && (
                            <span>₹{exp.basePrice.toLocaleString()} {exp.isOptional ? "pp" : "Included"}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-[var(--season-primary)] mx-auto flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                    Included experiences for this tour are currently being curated.
                  </h3>
                </div>
              )}
            </div>
          )}
        </section>

        <section
          id="nearby"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["nearby"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("nearby")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["nearby"]}
            aria-controls="content-nearby"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <Map className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                  Nearby Places
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  Other places to explore nearby
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["nearby"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["nearby"] && (
            <div
              id="content-nearby"
              className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {tour.contentSections?.nearby ? (
                <div className="p-4 sm:p-5 rounded-lg border border-slate-200/80 bg-slate-50/40 text-slate-700 text-xs sm:text-[13.5px] leading-relaxed">
                  <RichContentRenderer content={tour.contentSections.nearby} className="prose-sm max-w-none text-slate-700" />
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-1.5 min-h-[140px]">
                  <Map className="w-6 h-6 text-slate-300" />
                  <p className="text-xs text-slate-500 font-medium">Nearby places to explore will appear here once configured.</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section
          id="faq"
          className={`rounded-xl border transition-colors duration-150 scroll-mt-24 bg-white ${
            openSections["faq"]
              ? "border-slate-300 shadow-2xs"
              : "border-slate-200/90 hover:border-slate-300"
          }`}
        >
          <button
            type="button"
            onClick={() => toggleSection("faq")}
            className="w-full flex items-center justify-between text-left px-3.5 py-3 sm:px-4.5 sm:py-3.5 min-h-[52px] sm:min-h-[58px] group cursor-pointer"
            aria-expanded={!!openSections["faq"]}
            aria-controls="content-faq"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[var(--season-primary)] group-hover:bg-emerald-50 transition-colors">
                <HelpCircle className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 leading-snug tracking-tight group-hover:text-[var(--season-primary)] transition-colors">
                  Frequently Asked Questions
                </h2>
                <p className="text-[12px] sm:text-[13px] text-slate-500 leading-tight truncate mt-0.5">
                  Common questions regarding booking, pacing and seasonal conditions
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 group-hover:text-slate-700 ${
                openSections["faq"] ? "rotate-180 text-[var(--season-primary)]" : ""
              }`}
            />
          </button>

          {openSections["faq"] && (
            <div
              id="content-faq"
              className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-3.5 border-t border-slate-100/90 animate-in fade-in slide-in-from-top-1 duration-200 space-y-3"
            >
              {tour.contentSections?.faqs && tour.contentSections.faqs.length > 0 ? (
                <div className="space-y-2.5">
                  {tour.contentSections.faqs.map((faq, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-3.5 sm:p-4 rounded-lg border border-slate-200/80 bg-slate-50/40 space-y-1.5"
                    >
                      <h3 className="text-xs sm:text-[13.5px] font-semibold text-slate-900 flex items-start gap-2">
                        <span className="text-[var(--season-primary)] font-bold shrink-0">Q:</span>
                        <span>{faq.question}</span>
                      </h3>
                      <div className="text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-5">
                        <RichContentRenderer content={faq.answer} className="prose-sm max-w-none text-slate-600" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                    Frequently asked questions for this tour will be updated shortly.
                  </h3>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
